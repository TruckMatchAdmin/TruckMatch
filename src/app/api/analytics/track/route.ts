import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      visitorId,
      pagePath,
      pageTitle,
      referrer,
      referrerSource,
      deviceType,
      browser,
    } = body;

    // Ne pas enregistrer les requêtes incomplètes ou les pages admin internes
    if (!pagePath || pagePath.startsWith("/espace-admin") || pagePath.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    // Récupération du pays via headers
    const headers = request.headers;
    const country =
      headers.get("cf-ipcountry") ||
      headers.get("x-vercel-ip-country") ||
      headers.get("x-country-code") ||
      "France";

    await supabaseAdmin.from("site_analytics").insert({
      session_id: sessionId || "anon-session",
      visitor_id: visitorId || "anon-visitor",
      page_path: pagePath,
      page_title: pageTitle || pagePath,
      referrer: referrer || "",
      referrer_source: referrerSource || "Trafic Direct",
      device_type: deviceType || "desktop",
      browser: browser || "Navigateur Web",
      country: country,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Analytics tracking should fail silently to never block user experience
    return NextResponse.json({ ok: false, error: err.message }, { status: 200 });
  }
}
