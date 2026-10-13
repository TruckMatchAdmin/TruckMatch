import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decodeTrackingToken } from "@/lib/email/mailer";
import { notifyEmailOpened } from "@/lib/telegram/notifier";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// 1x1 transparent GIF buffer
const TRANSPARENT_1X1_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

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

        // Mettre à jour email_logs
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
          console.warn("Could not update email_logs from pixel:", dbErr);
        }

        // Notification Telegram instantanée
        try {
          await notifyEmailOpened({
            recipientEmail: payload.recipientEmail,
            emailType: payload.emailType,
            subject: payload.subject,
            ipAddress: ip,
            userAgent,
          });
        } catch (tgErr) {
          console.error("Erreur notification Telegram pixel:", tgErr);
        }
      }
    }
  } catch (err) {
    console.error("Erreur tracking pixel:", err);
  }

  return new NextResponse(TRANSPARENT_1X1_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
