import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncTransportJobsToDatabase } from "@/lib/jobs/franceTravailSync";

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    const authHeader = request.headers.get("authorization");
    const isCronAuthorized =
      authHeader &&
      process.env.CRON_SECRET &&
      authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized && (!session || session.role !== "admin")) {
      return NextResponse.json(
        { error: "Accès refusé. Réservé à l'administration TruckMatch." },
        { status: 403 }
      );
    }

    const result = await syncTransportJobsToDatabase();

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Échec de synchronisation" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation réussie : ${result.inserted} nouvelles offres ajoutées, ${result.updated} actualisées. Total actif : ${result.total} offres.`,
      ...result,
    });
  } catch (err: any) {
    console.error("[API Jobs Sync] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur interne" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    return NextResponse.json({
      status: "ready",
      provider: "France Travail & Partenaires Transport",
      supportedCategories: ["SPL (CE)", "PL (C)", "VUL", "Frigo", "Benne", "Traction de Nuit"],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
