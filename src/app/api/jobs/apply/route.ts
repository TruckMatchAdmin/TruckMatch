import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendCandidateApplicationEmail,
  sendCandidateApplicationReceiptEmail,
} from "@/lib/email/mailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Dictionnaire de contacts RH officiels de grands groupes de transport en France
const VERIFIED_COMPANY_RECRUITMENT_EMAILS: Record<string, string> = {
  stef: "recrutement@stef.com",
  geodis: "carrieres@geodis.com",
  mauffrey: "recrutement@mauffrey.com",
  delanchy: "recrutement@delanchy.fr",
  malherbe: "rh@malherbe.fr",
  perrenot: "recrutement@perrenot.eu",
  samat: "carrieres@samat.com",
  combronde: "recrutement@combronde.com",
  xpo: "recrutement.france@xpo.com",
  veynat: "contact@transports-veynat.com",
  charpentier: "recrutement@transports-charpentier.fr",
  dupont: "contact@truckmatch.fr",
};

function resolveCompanyEmail(companyName: string, directEmail?: string): string | null {
  if (directEmail && directEmail.includes("@")) {
    return directEmail.trim().toLowerCase();
  }

  const normalized = companyName.toLowerCase();
  for (const [key, email] of Object.entries(VERIFIED_COMPANY_RECRUITMENT_EMAILS)) {
    if (normalized.includes(key)) {
      return email;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      job_id,
      job_title,
      company_name,
      candidate_id,
      candidate_name,
      candidate_email,
      candidate_phone,
      candidate_city,
      candidate_postal_code,
      permits = [],
      fimo = false,
      fco = false,
      chrono_card = false,
      experience_years = "",
      resume_url = "",
      message = "",
      apply_url,
    } = body;

    if (!job_title || !company_name || !candidate_name || !candidate_email || !candidate_phone) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner votre nom, téléphone et adresse email." },
        { status: 400 }
      );
    }

    // Récupérer l'offre en base si job_id fourni
    let jobContactEmail: string | undefined;
    let jobApplyUrl: string | undefined = apply_url;

    if (job_id) {
      const { data: job } = await supabaseAdmin
        .from("jobs")
        .select("id, contact_email, apply_url")
        .or(`id.eq.${job_id},external_id.eq.${job_id}`)
        .maybeSingle();

      if (job) {
        if (job.contact_email) jobContactEmail = job.contact_email;
        if (job.apply_url) jobApplyUrl = job.apply_url;
      }
    }

    const destinationEmail = resolveCompanyEmail(company_name, jobContactEmail);

    let emailSent = false;
    let emailError: string | undefined;

    // Si on a un email de destination valide, envoyer la présentation du candidat
    if (destinationEmail) {
      const sendResult = await sendCandidateApplicationEmail({
        to: destinationEmail,
        companyName: company_name,
        jobTitle: job_title,
        candidateName: candidate_name,
        candidateEmail: candidate_email,
        candidatePhone: candidate_phone,
        candidateCity: candidate_city,
        permits,
        fimo,
        fco,
        chronoCard: chrono_card,
        experience: experience_years,
        message,
        resumeUrl: resume_url || undefined,
      });

      if (sendResult.success) {
        emailSent = true;
        // Envoi accusé de réception au candidat
        try {
          await sendCandidateApplicationReceiptEmail({
            to: candidate_email,
            candidateName: candidate_name,
            jobTitle: job_title,
            companyName: company_name,
            destinationEmail,
          });
        } catch (receiptErr) {
          console.warn("[Apply] Échec accusé de réception candidat (non bloquant):", receiptErr);
        }
      } else {
        emailError = sendResult.error;
      }
    }

    // Enregistrement dans job_applications
    const { data: insertedApp, error: dbErr } = await supabaseAdmin
      .from("job_applications")
      .insert([
        {
          job_id: job_id && job_id.length === 36 ? job_id : null,
          job_title,
          company_name,
          candidate_id: candidate_id || null,
          candidate_name,
          candidate_email,
          candidate_phone,
          candidate_city: candidate_city || null,
          candidate_postal_code: candidate_postal_code || null,
          permits: permits || [],
          fimo: Boolean(fimo),
          fco: Boolean(fco),
          chrono_card: Boolean(chrono_card),
          experience_years: experience_years || null,
          resume_url: resume_url || null,
          message: message || null,
          destination_email: destinationEmail || null,
          email_sent: emailSent,
          status: emailSent ? "sent" : "redirected",
        },
      ])
      .select("id")
      .single();

    if (dbErr) {
      console.warn("[Apply] Erreur sauvegarde job_applications (non bloquant):", dbErr);
    }

    return NextResponse.json({
      success: true,
      applicationId: insertedApp?.id,
      emailSent,
      destinationEmail: destinationEmail ? destinationEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
      redirectUrl: !emailSent ? jobApplyUrl || "https://truckmatch.fr/espace-candidat" : null,
      message: emailSent
        ? `Votre candidature a été transmise avec succès au service recrutement de ${company_name} !`
        : `Votre dossier est pré-enregistré. Finalisez votre démarche sur le portail officiel de l'entreprise.`,
    });
  } catch (err: any) {
    console.error("[Apply API] Erreur traitement candidature:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur interne lors de la transmission" },
      { status: 500 }
    );
  }
}
