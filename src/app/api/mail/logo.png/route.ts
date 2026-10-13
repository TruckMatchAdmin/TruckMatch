import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { decodeTrackingToken } from "@/lib/email/mailer";
import { notifyEmailOpened } from "@/lib/telegram/notifier";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || searchParams.get("track");

    if (token) {
      const payload = decodeTrackingToken(token);
      if (payload) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "Inconnue";
        const userAgent = request.headers.get("user-agent") || "Email Client";

        // 1. Mettre à jour email_logs dans Supabase
        try {
          await supabaseAdmin
            .from("email_logs")
            .update({
              status: "opened",
              opened_at: new Date().toISOString(),
              ip_address: ip,
              user_agent: userAgent,
            })
            .eq("tracking_id", payload.trackingId);
        } catch (dbErr) {
          console.warn("Could not update email_logs:", dbErr);
        }

        // 2. Déclencher la notification Telegram instantanée à l'administrateur
        try {
          await notifyEmailOpened({
            recipientEmail: payload.recipientEmail,
            emailType: payload.emailType,
            subject: payload.subject,
            ipAddress: ip,
            userAgent,
          });
        } catch (tgErr) {
          console.error("Erreur notification Telegram lecture email:", tgErr);
        }
      }
    }
  } catch (err) {
    console.error("Erreur tracking logo email:", err);
  }

  // Renvoyer l'image officielle du logo TruckMatch en haute définition
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo-email.png");
    if (fs.existsSync(logoPath)) {
      const fileBuffer = fs.readFileSync(logoPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }
  } catch (readErr) {
    console.error("Erreur lecture logo local:", readErr);
  }

  return new NextResponse(null, { status: 404 });
}
