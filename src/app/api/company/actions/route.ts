import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    // Session signée obligatoire (entreprise uniquement)
    const session = getSession(request);
    if (!session || session.role !== "company") {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("email", session.email.toLowerCase().trim())
      .maybeSingle();

    if (!company) {
      return NextResponse.json(
        { error: "Aucun profil entreprise n'est associé à ce compte." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    // 1. Déposer une offre d'emploi (soumise à modération)
    if (action === "post_job_need" || action === "post_job") {
      const {
        title,
        permit,
        location,
        contract_type,
        salary,
        description,
        category,
        schedule,
        benefits,
        requirements,
      } = data || {};

      if (!title || !String(title).trim()) {
        return NextResponse.json({ error: "Le titre de l'offre est obligatoire." }, { status: 400 });
      }
      if (!location || !String(location).trim()) {
        return NextResponse.json({ error: "Le lieu de travail est obligatoire." }, { status: 400 });
      }
      if (!description || !String(description).trim()) {
        return NextResponse.json({ error: "La description du poste est obligatoire." }, { status: 400 });
      }
      if (!contract_type) {
        return NextResponse.json({ error: "Le type de contrat est obligatoire." }, { status: 400 });
      }
      if (!permit) {
        return NextResponse.json({ error: "Le permis requis est obligatoire." }, { status: 400 });
      }

      // Catégorie déduite du permis si absente
      let cat = category;
      if (!cat) {
        if (permit === "CE") cat = "spl";
        else if (permit === "C") cat = "pl";
        else if (permit === "BE" || permit === "B") cat = "vul";
        else cat = "spl";
      }

      // Département extrait du lieu (ex : "Lyon (69)")
      const locCity = String(location).trim();
      const deptMatch = locCity.match(/\b(0[1-9]|[1-8][0-9]|9[0-8]|2A|2B)\b/);
      const locDept = deptMatch ? deptMatch[1] : "";

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("jobs")
        .insert([
          {
            title: String(title).trim(),
            permit_required: permit,
            category: cat,
            location_city: locCity,
            location_department: locDept,
            contract_type,
            salary_range: salary || null,
            schedule: schedule || null,
            benefits: benefits || null,
            description: String(description).trim(),
            requirements: Array.isArray(requirements) ? requirements : [],
            company_id: company.id,
            company_name: company.company_name,
            status: "pending", // En attente de validation par l'administration
            is_active: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (insertErr) {
        console.error("Jobs table insert error:", insertErr);
        throw insertErr;
      }

      return NextResponse.json({
        success: true,
        job: inserted?.[0],
        message:
          "Votre offre d'emploi a été enregistrée avec succès. Elle sera publiée sur le site dès approbation de l'équipe administrative.",
      });
    }

    // 2. Mettre à jour le profil de SON entreprise uniquement
    if (action === "update_company_profile") {
      const { company_name, phone, fleet_size, city, postal_code } = data || {};
      const { error: updateErr } = await supabaseAdmin
        .from("companies")
        .update({ company_name, phone, fleet_size, city, postal_code })
        .eq("id", company.id);
      if (updateErr) throw updateErr;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Company actions error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
