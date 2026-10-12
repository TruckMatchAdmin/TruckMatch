import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession, isAdmin2FAValid } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    // Vérification de la session signée et du 2FA (12h)
    const sessionUser = getSession(request);

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Réservé à l'administration." }, { status: 403 });
    }

    if (!isAdmin2FAValid(sessionUser)) {
      return NextResponse.json(
        { error: "Vérification 2FA requise ou session de 12h expirée.", requires2FA: true },
        { status: 401 }
      );
    }

    // Récupération des conducteurs
    const { data: drivers } = await supabaseAdmin
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });

    // Récupération des entreprises
    const { data: companies } = await supabaseAdmin
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    // Récupération des offres d'emploi
    const { data: jobs } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    // Récupération des tickets support
    const { data: supportTickets } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    const jobsList = jobs || [];
    const ticketsList = supportTickets || [];

    return NextResponse.json({
      success: true,
      drivers: drivers || [],
      companies: companies || [],
      jobs: jobsList,
      supportTickets: ticketsList,
      stats: {
        totalDrivers: drivers?.length || 0,
        pendingDrivers: drivers?.filter((d) => d.status === "pending" || (!d.status && !d.is_approved))?.length || 0,
        approvedDrivers: drivers?.filter((d) => d.status === "approved" || d.is_approved)?.length || 0,
        rejectedDrivers: drivers?.filter((d) => d.status === "rejected")?.length || 0,
        totalCompanies: companies?.length || 0,
        withResume: drivers?.filter((d) => d.resume_url)?.length || 0,
        availableNow: drivers?.filter((d) => d.availability === "immediate")?.length || 0,
        totalJobs: jobsList.length,
        pendingJobs: jobsList.filter((j) => j.status === "pending").length,
        approvedJobs: jobsList.filter((j) => j.status === "approved" && j.is_active).length,
        rejectedJobs: jobsList.filter((j) => j.status === "rejected").length,
        totalTickets: ticketsList.length,
        openTickets: ticketsList.filter((t) => t.status === "open" || t.status === "in_progress").length,
        urgentTickets: ticketsList.filter((t) => t.priority === "urgente" && t.status !== "resolved").length,
      },
    });
  } catch (err: any) {
    console.error("Admin data route error:", err);
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 });
  }
}
