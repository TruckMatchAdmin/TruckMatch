import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    // 1. Récupération session éventuelle
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

    // 2. Récupérer le vivier complet des chauffeurs depuis Supabase
    const { data: drivers, error: driverErr } = await supabaseAdmin
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });

    if (driverErr) {
      console.error("Company data drivers error:", driverErr);
    }

    // 3. Récupérer les informations de l'entreprise si connectée
    let companyProfile: any = null;
    if (sessionUser?.email) {
      const { data: comp } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("email", sessionUser.email.toLowerCase().trim())
        .maybeSingle();
      companyProfile = comp;
    }

    // 4. Récupérer les offres d'emploi de l'entreprise
    let companyJobs: any[] = [];
    try {
      const { data: jobsData } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      companyJobs = jobsData || [];
    } catch (jErr) {
      console.warn("Could not load jobs in company data:", jErr);
    }

    const driversList = drivers || [];

    const stats = {
      totalDrivers: driversList.length,
      ceDrivers: driversList.filter((d) => d.permits?.includes("CE")).length,
      cDrivers: driversList.filter((d) => d.permits?.includes("C")).length,
      withResume: driversList.filter((d) => d.resume_url).length,
      immediate: driversList.filter((d) => d.availability === "immediate").length,
      myJobsCount: companyJobs.length,
      myPendingJobsCount: companyJobs.filter((j) => j.status === "pending").length,
      myActiveJobsCount: companyJobs.filter((j) => j.status === "approved" && j.is_active).length,
    };

    return NextResponse.json({
      success: true,
      drivers: driversList,
      jobs: companyJobs,
      stats,
      company: companyProfile || {
        company_name: sessionUser?.name || "Transports Réunis & Logistique",
        siret: "84792104500028",
        city: "Paris",
        postal_code: "75001",
        fleet_size: "6-20",
        email: sessionUser?.email || "recrutement@transporteur.fr",
        phone: "01 45 67 89 00",
      },
    });
  } catch (err: any) {
    console.error("Company data route error:", err);
    return NextResponse.json({ error: "Erreur serveur: " + err.message }, { status: 500 });
  }
}
