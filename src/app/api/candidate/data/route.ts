import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "driver" && session.role !== "admin")) {
      return NextResponse.json(
        { error: "Accès refusé. Connexion candidat requise." },
        { status: 403 }
      );
    }

    // Récupérer le profil réel du conducteur
    let driverProfile: any = null;
    if (session.email) {
      const { data: driver } = await supabaseAdmin
        .from("drivers")
        .select("*")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();
      driverProfile = driver;
    }

    // Récupérer les offres d'emploi réelles actives et validées
    const { data: jobs, error: jobsErr } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (jobsErr) {
      console.warn("Could not load jobs for candidate:", jobsErr);
    }

    return NextResponse.json({
      success: true,
      driver: driverProfile,
      jobs: jobs || [],
    });
  } catch (err: any) {
    console.error("Candidate data route error:", err);
    return NextResponse.json({ error: "Erreur serveur: " + err.message }, { status: 500 });
  }
}
