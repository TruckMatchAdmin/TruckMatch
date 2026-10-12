import { NextResponse } from "next/server";
import { sendDailyReport } from "@/lib/telegram/dailyReport";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const expectedSecret = process.env.CRON_SECRET || "truckmatch_cron_secret_paris21h_2026";

    // Vérification du Bearer Token
    const providedSecret = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (providedSecret !== expectedSecret) {
      const url = new URL(request.url);
      const querySecret = url.searchParams.get("secret");
      if (querySecret !== expectedSecret) {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    const result = await sendDailyReport(force);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erreur envoi rapport quotidien" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadySent: result.alreadySent || false,
      date: result.stats?.date,
      message: result.alreadySent
        ? "Rapport déjà transmis aujourd'hui (aucune duplication)."
        : "Rapport quotidien de 21h envoyé avec succès sur Telegram.",
    });
  } catch (err: any) {
    console.error("[Cron Daily Report] Erreur:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Accepte également GET avec ?secret=... pour faciliter les pings de services cron distants
  return POST(request);
}
