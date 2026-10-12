import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { generateAndSend2FACode } from "@/lib/auth/twoFactor";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const pendingMatch = cookieHeader.match(/(?:^|;\s*)tm_2fa_pending=([^;]+)/);
    const pendingToken = pendingMatch ? decodeURIComponent(pendingMatch[1]) : null;

    const pendingUser = verifySessionToken(pendingToken);
    const adminEmail = (process.env.ADMIN_EMAIL || "jobs@truckmatch.fr").trim().toLowerCase();
    const emailToTarget = pendingUser?.email || adminEmail;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Navigateur inconnu";

    const res = await generateAndSend2FACode(emailToTarget, ip, userAgent);

    if (!res.success) {
      return NextResponse.json(
        { error: res.error || "Impossible de renvoyer le code." },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Un nouveau code de vérification à 4 chiffres a été envoyé sur votre Telegram @TruckMatchAdmin_bot.",
    });
  } catch (err: any) {
    console.error("2FA resend error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du code." },
      { status: 500 }
    );
  }
}
