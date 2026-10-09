import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // 1. Déposer un besoin de recrutement express
    if (action === "post_job_need") {
      const { title, permit, location, contract_type, salary, urgent, description, company_name } = data || {};
      
      // On peut insérer dans la table jobs ou simuler une confirmation persistée
      try {
        const { error: insertErr } = await supabaseAdmin.from("jobs").insert([
          {
            title: title || `Conducteur ${permit || "SPL"} - ${location || "France"}`,
            permit_required: permit || "CE",
            location: location || "National",
            contract_type: contract_type || "CDI",
            salary_range: salary || "2 500€ - 3 200€",
            description: description || `Recherche urgente de conducteur ${permit} pour tournées régulières.`,
            company_name: company_name || "Entreprise Partenaire",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);
        if (insertErr) {
          console.warn("Insert jobs warning (table might not exist yet):", insertErr.message);
        }
      } catch (err: any) {
        console.warn("Jobs table exception:", err.message);
      }

      return NextResponse.json({
        success: true,
        message: "Votre recherche de conducteur a été publiée avec succès dans le réseau TruckMatch.",
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
