import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Champs privés des conducteurs jamais transmis aux recruteurs
const PRIVATE_DRIVER_FIELDS = ["birth_date", "address", "latitude", "longitude"];

export async function GET(request: Request) {
  try {
    // 1. Session signée obligatoire (entreprise ou administrateur)
    const session = getSession(request);
    if (!session || (session.role !== "company" && session.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    // 2. Profil de l'entreprise connectée (aucune donnée de substitution)
    let companyProfile: any = null;
    if (session.role === "company" || session.role === "admin") {
      const { data: comp } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();
      companyProfile = comp;
    }

    // 3. Vivier de conducteurs validés par l'administration (sans les champs privés)
    const { data: drivers, error: driverErr } = await supabaseAdmin
      .from("drivers")
      .select("*")
      .or("status.eq.approved,is_approved.eq.true")
      .order("created_at", { ascending: false });

    if (driverErr) {
      console.error("Company data drivers error:", driverErr);
    }

    const driversList = (drivers || []).map((d: any) => {
      const copy = { ...d };
      for (const f of PRIVATE_DRIVER_FIELDS) delete copy[f];
      return copy;
    });

    // 4. Uniquement les offres de CETTE entreprise
    let companyJobs: any[] = [];
    if (companyProfile?.id) {
      const { data: jobsData } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("company_id", companyProfile.id)
        .order("created_at", { ascending: false });
      companyJobs = jobsData || [];
    }

    const stats = {
      totalDrivers: driversList.length,
      ceDrivers: driversList.filter((d: any) => d.permits?.includes("CE")).length,
      cDrivers: driversList.filter((d: any) => d.permits?.includes("C")).length,
      withResume: driversList.filter((d: any) => d.resume_url).length,
      immediate: driversList.filter((d: any) => d.availability === "immediate").length,
      myJobsCount: companyJobs.length,
      myPendingJobsCount: companyJobs.filter((j) => j.status === "pending").length,
      myActiveJobsCount: companyJobs.filter((j) => j.status === "approved" && j.is_active).length,
    };

    return NextResponse.json({
      success: true,
      drivers: driversList,
      jobs: companyJobs,
      stats,
      company: companyProfile,
    });
  } catch (err: any) {
    console.error("Company data route error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
