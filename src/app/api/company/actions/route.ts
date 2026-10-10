import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // 1. Déposer une offre d'emploi de conducteur (Soumise à modération Admin)
    if (action === "post_job_need" || action === "post_job") {
      const {
        title,
        permit,
        location,
        contract_type,
        salary,
        urgent,
        description,
        company_name,
        category,
        schedule,
        benefits,
        requirements,
      } = data || {};

      // Déduction automatique de la catégorie selon le permis
      let cat = category;
      if (!cat) {
        if (permit === "CE") cat = "spl";
        else if (permit === "C") cat = "pl";
        else if (permit === "BE" || permit === "B") cat = "vul";
        else cat = "spl";
      }

      // Extraction du département si mentionné dans le lieu (ex: "Lyon (69)")
      let locCity = location || "France";
      let locDept = "";
      const deptMatch = locCity.match(/\b(0[1-9]|[1-8][0-9]|9[0-8]|2A|2B)\b/);
      if (deptMatch) {
        locDept = deptMatch[1];
      }

      const jobTitle = title || `Conducteur ${permit || "SPL"} — ${locCity}`;

      const { data: inserted, error: insertErr } = await supabaseAdmin.from("jobs").insert([
        {
          title: jobTitle,
          permit_required: permit || "CE",
          category: cat,
          location_city: locCity,
          location_department: locDept,
          contract_type: contract_type || "CDI",
          salary_range: salary || "2 600€ - 3 200€ brut/mois",
          schedule: schedule || "Retour domicile chaque soir",
          benefits: benefits || "Paniers repas conventionnés CCNTR + mutuelle d'entreprise",
          description: description || `Recherche de conducteur ${permit || "SPL"} qualifié pour tournées régulières.`,
          requirements: Array.isArray(requirements) && requirements.length > 0 ? requirements : [`Permis ${permit || "CE"}`, "FCO Valide", "Carte Chrono"],
          company_name: company_name || "Entreprise Partenaire",
          status: "pending", // En attente de validation par l'administration
          is_active: false, // Inactif jusqu'à approbation
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]).select();

      if (insertErr) {
        console.error("Jobs table insert error:", insertErr);
        throw insertErr;
      }

      return NextResponse.json({
        success: true,
        job: inserted?.[0],
        message: "Votre offre d'emploi a été enregistrée avec succès. Elle sera publiée sur le site dès approbation de l'équipe administrative.",
      });
    }

    // 2. Mettre à jour profil entreprise
    if (action === "update_company_profile") {
      const { id, company_name, phone, fleet_size, city, postal_code } = data || {};
      if (id) {
        const { error: updateErr } = await supabaseAdmin
          .from("companies")
          .update({
            company_name,
            phone,
            fleet_size,
            city,
            postal_code,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (updateErr) throw updateErr;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Company actions error:", err);
    return NextResponse.json({ error: "Erreur serveur: " + err.message }, { status: 500 });
  }
}
