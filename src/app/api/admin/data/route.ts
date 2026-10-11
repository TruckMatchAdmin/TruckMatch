import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    // Vérification de la session signée
    const sessionUser = getSession(request);

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Réservé à l'administration." }, { status: 403 });
    }

    // Récupération des conducteurs
    const { data: drivers, error: driverErr } = await supabaseAdmin
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });

    // Récupération des entreprises
    const { data: companies, error: compErr } = await supabaseAdmin
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    // Récupération des offres d'emploi
    const { data: jobs, error: jobErr } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    const jobsList = jobs || [];

    return NextResponse.json({
      success: true,
      drivers: drivers || [],
      companies: companies || [],
      jobs: jobsList,
      stats: {
        totalDrivers: drivers?.length || 0,
        totalCompanies: companies?.length || 0,
        withResume: drivers?.filter((d) => d.resume_url)?.length || 0,
        availableNow: drivers?.filter((d) => d.availability === "immediate")?.length || 0,
        totalJobs: jobsList.length,
        pendingJobs: jobsList.filter((j) => j.status === "pending").length,
        approvedJobs: jobsList.filter((j) => j.status === "approved" && j.is_active).length,
        rejectedJobs: jobsList.filter((j) => j.status === "rejected").length,
      },
    });
  } catch (err: any) {
    console.error("Admin data route error:", err);
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 });
  }
}
