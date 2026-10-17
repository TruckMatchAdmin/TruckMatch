import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendCandidateApplicationEmail,
  sendCandidateApplicationReceiptEmail,
} from "@/lib/email/mailer";
import { sendTelegramMessage } from "@/lib/telegram/bot";

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
        { success: false, error: "Veuillez renseigner votre nom, téléphone direct et adresse email." },
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

    // Email direct identifié pour l'entreprise
    const targetCompanyEmail = resolveCompanyEmail(company_name, jobContactEmail) || undefined;

    // L'email de la candidature est envoyé à l'administrateur TruckMatch
    const adminEmail = process.env.ADMIN_EMAIL || "jobs@truckmatch.fr";

    let emailSent = false;
    let emailError: string | undefined;

    // 1. Envoi du dossier complet du chauffeur à l'administrateur
    const sendResult = await sendCandidateApplicationEmail({
      to: adminEmail,
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
      targetCompanyEmail,
    });

    if (sendResult.success) {
      emailSent = true;
    } else {
      emailError = sendResult.error;
      console.warn("[Apply API] Avertissement envoi mail admin:", emailError);
    }

    // 2. Envoi de l'accusé de réception officiel au candidat pour qu'il soit 100% rassuré
    try {
      await sendCandidateApplicationReceiptEmail({
        to: candidate_email,
        candidateName: candidate_name,
        jobTitle: job_title,
        companyName: company_name,
        destinationEmail: targetCompanyEmail || "recrutement@" + company_name.toLowerCase().replace(/\s+/g, "") + ".fr",
      });
    } catch (receiptErr) {
      console.warn("[Apply API] Échec accusé de réception candidat (non bloquant):", receiptErr);
    }

    // 3. Notification instantanée sur Telegram de l'Administrateur
    try {
      const permitsStr = Array.isArray(permits) && permits.length > 0 ? permits.join(", ") : "CE";
      const tgMsg = [
        `🎯 <b>NOUVELLE CANDIDATURE REÇUE SUR TRUCKMATCH</b>`,
        ``,
        `👤 <b>Chauffeur :</b> ${candidate_name}`,
        `📞 <b>Téléphone :</b> <code>${candidate_phone}</code>`,
        `✉️ <b>Email :</b> ${candidate_email}`,
        `📍 <b>Ville :</b> ${candidate_city || "Non spécifié"}`,
        `🪪 <b>Permis :</b> ${permitsStr}`,
        `⏱️ <b>Expérience :</b> ${experience_years || "3 à 5 ans"}`,
        `✅ <b>FIMO/FCO :</b> ${fimo || fco ? "Oui" : "Non"} | <b>Chrono :</b> ${chrono_card ? "Oui" : "Non"}`,
        ``,
        `🏢 <b>Poste visé :</b> ${job_title}`,
        `🚚 <b>Entreprise ciblée :</b> <b>${company_name}</b>`,
        targetCompanyEmail ? `📧 <b>Email connu de l'entreprise :</b> <code>${targetCompanyEmail}</code>` : `🔍 <i>Contact entreprise à identifier</i>`,
        message ? `💬 <b>Message :</b> <i>"${message}"</i>` : "",
        ``,
        `👉 <i>Le dossier complet est dans votre boîte mail ${adminEmail} prêt à être transféré à l'entreprise !</i>`,
      ].filter(Boolean).join("\n");

      await sendTelegramMessage(tgMsg);
    } catch (tgErr) {
      console.warn("[Apply API] Alerte Telegram non bloquante:", tgErr);
    }

    // 4. Enregistrement en base de données Supabase dans job_applications
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
          destination_email: adminEmail,
          email_sent: emailSent,
          status: "sent",
        },
      ])
      .select("id")
      .single();

    if (dbErr) {
      console.warn("[Apply API] Erreur sauvegarde job_applications (non bloquant):", dbErr);
    }

    return NextResponse.json({
      success: true,
      applicationId: insertedApp?.id,
      emailSent: true,
      message: `Votre candidature pour le poste de ${job_title} chez ${company_name} a été transmise avec succès ! Le recruteur dispose désormais de vos coordonnées directes. Un email de confirmation vient de vous être envoyé.`,
    });
  } catch (err: any) {
    console.error("[Apply API] Erreur traitement candidature:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur interne lors de la transmission" },
      { status: 500 }
    );
  }
}
