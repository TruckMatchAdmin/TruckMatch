import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionMatch = cookieHeader.match(/tm_session=([^;]+)/);
    let sessionUser: any = null;

    if (sessionMatch) {
      try {
        sessionUser = JSON.parse(decodeURIComponent(sessionMatch[1]));
      } catch {
        sessionUser = null;
      }
    }

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Réservé à l'administrateur." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    // 1. PING SUPABASE
    if (action === "ping") {
      const start = Date.now();
      const { count, error } = await supabaseAdmin.from("drivers").select("*", { count: "exact", head: true });
      const latency = Date.now() - start;
      return NextResponse.json({
        success: !error,
        latency,
        error: error ? error.message : null,
      });
    }

    // 2. TOGGLE AVAILABILITY CONDUCTEUR
    if (action === "toggle_driver_availability" && id) {
      const { data: driver } = await supabaseAdmin.from("drivers").select("availability").eq("id", id).single();
      const newAvail = driver?.availability === "immediate" ? "flexible" : "immediate";
      const { error } = await supabaseAdmin.from("drivers").update({ availability: newAvail }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, availability: newAvail });
    }

    // 3. SUPPRIMER CONDUCTEUR
    if (action === "delete_driver" && id) {
      const { error } = await supabaseAdmin.from("drivers").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // 4. SUPPRIMER ENTREPRISE
    if (action === "delete_company" && id) {
      const { error } = await supabaseAdmin.from("companies").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // 5. SEED EXEMPLES DE CANDIDATS & ENTREPRISES DANS SUPABASE
    if (action === "seed") {
      const sampleDrivers = [
        {
          first_name: "Marc",
          last_name: "Lefebvre",
          email: "marc.lefebvre.spl@gmail.com",
          phone: "0624891234",
          birth_date: "1988-04-12",
          address: "14 Rue des Frères Lumière",
          postal_code: "69007",
          city: "Lyon",
          department: "69",
          permits: ["CE", "C", "B"],
          fimo: true,
          fco: true,
          chrono_card: true,
          adr: ["ADR Citerne", "ADR Colis"],
          caces: ["R489-3"],
          availability: "immediate",
          experience: "5-10",
          resume_url: "https://truckmatch.fr/sample-cv-marc.pdf",
          resume_name: "CV_Marc_Lefebvre_SPL.pdf",
        },
        {
          first_name: "Thomas",
          last_name: "Dubois",
          email: "t.dubois.transport@gmail.com",
          phone: "0785123490",
          birth_date: "1994-09-21",
          address: "8 Avenue de Flandre",
          postal_code: "59000",
          city: "Lille",
          department: "59",
          permits: ["CE", "C"],
          fimo: true,
          fco: true,
          chrono_card: true,
          adr: ["ADR Colis"],
          caces: [],
          availability: "immediate",
          experience: "3-5",
          resume_url: "https://truckmatch.fr/sample-cv-thomas.pdf",
          resume_name: "CV_Thomas_Dubois_CE.pdf",
        },
        {
          first_name: "Sarah",
          last_name: "Moreau",
          email: "sarah.moreau.porteur@gmail.com",
          phone: "0612984567",
          birth_date: "1997-01-18",
          address: "22 Boulevard Victor Hugo",
          postal_code: "44000",
          city: "Nantes",
          department: "44",
          permits: ["C", "B"],
          fimo: true,
          fco: true,
          chrono_card: true,
          adr: [],
          caces: ["R489-1"],
          availability: "flexible",
          experience: "1-3",
          resume_url: "https://truckmatch.fr/sample-cv-sarah.pdf",
          resume_name: "CV_Sarah_Moreau_Porteur.pdf",
        },
      ];

      const sampleCompanies = [
        {
          siret: "48291048200021",
          company_name: "Transports Trans-Express Rhône",
          contact_first_name: "Philippe",
          contact_last_name: "Garnier",
          contact_role: "Directeur d'Exploitation",
          email: "contact@trans-express-rhone.fr",
          phone: "0478123456",
          address: "Zone Industrielle de Vénissieux",
          postal_code: "69200",
          city: "Vénissieux",
          naf_code: "49.41A",
          fleet_size: "21-50",
          target_drivers: ["CE", "C"],
        },
        {
          siret: "51928471200034",
          company_name: "Logistique & Fret Normandie",
          contact_first_name: "Béatrice",
          contact_last_name: "Vasseur",
          contact_role: "Responsable RH & Flotte",
          email: "rh@normandie-fret.com",
          phone: "0235987654",
          address: "Parc d'Activité de la Seine",
          postal_code: "76000",
          city: "Rouen",
          naf_code: "49.41A",
          fleet_size: "6-20",
          target_drivers: ["CE"],
        },
      ];

      // Insérer les conducteurs
      for (const d of sampleDrivers) {
        await supabaseAdmin.from("drivers").upsert(d, { onConflict: "email" });
      }

      // Insérer les entreprises
      for (const c of sampleCompanies) {
        await supabaseAdmin.from("companies").upsert(c, { onConflict: "siret" });
      }

      return NextResponse.json({
        success: true,
        message: "Données démo synchronisées avec succès dans Supabase.",
      });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin actions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
