import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { syncTransportJobsToDatabase } from "@/lib/jobs/franceTravailSync";
import { sendTelegramMessage } from "@/lib/telegram/bot";

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    const authHeader = request.headers.get("authorization") || "";
    const expectedSecret = process.env.CRON_SECRET || "truckmatch_cron_secret_paris21h_2026";

    const providedSecret = authHeader.replace(/^Bearer\s+/i, "").trim();
    const url = new URL(request.url);
    const querySecret = url.searchParams.get("secret");

    const isCronAuthorized =
      (providedSecret && providedSecret === expectedSecret) ||
      (querySecret && querySecret === expectedSecret);

    if (!isCronAuthorized && (!session || session.role !== "admin")) {
      return NextResponse.json(
        { error: "Accès refusé. Réservé à l'administration ou au cron système." },
        { status: 403 }
      );
    }

    const purge = url.searchParams.get("purge") !== "false";
    const result = await syncTransportJobsToDatabase({ purgeDeleted: purge });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Échec de synchronisation" }, { status: 500 });
    }

    // Notification Telegram Admin
    try {
      const nowStr = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());

      const msg = [
        `🔄 <b>[TruckMatch] Synchronisation Minuit des Offres</b>`,
        ``,
        `✅ <b>Nouvelles offres ajoutées :</b> +${result.inserted}`,
        `♻️ <b>Offres actualisées :</b> ${result.updated}`,
        `🗑️ <b>Offres expirées supprimées :</b> ${result.deactivated}`,
        `📊 <b>Total des offres en ligne :</b> <b>${result.total}</b>`,
        ``,
        `🕒 <i>Exécuté le ${nowStr} (Europe/Paris)</i>`,
      ].join("\n");

      await sendTelegramMessage(msg);
    } catch (tgErr) {
      console.warn("[Jobs Sync] Notification Telegram non bloquante:", tgErr);
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation réussie : ${result.inserted} ajoutées, ${result.updated} actualisées, ${result.deactivated} supprimées. Total actif : ${result.total} offres.`,
      inserted: result.inserted,
      updated: result.updated,
      deactivated: result.deactivated,
      total: result.total,
    });
  } catch (err: any) {
    console.error("[API Jobs Sync] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur interne" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const expectedSecret = process.env.CRON_SECRET || "truckmatch_cron_secret_paris21h_2026";
  const querySecret = url.searchParams.get("secret");

  // Si déclenché par un ping cron avec secret
  if (querySecret && querySecret === expectedSecret) {
    return POST(request);
  }

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
