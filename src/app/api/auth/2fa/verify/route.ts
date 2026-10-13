import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
  ADMIN_2FA_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { verify2FACode } from "@/lib/auth/twoFactor";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length !== 4) {
      return NextResponse.json(
        { error: "Veuillez saisir un code de vérification valide à 4 chiffres." },
        { status: 400 }
      );
    }

    // Récupérer le jeton pré-auth
    const cookieHeader = request.headers.get("cookie") || "";
    const pendingMatch = cookieHeader.match(/(?:^|;\s*)tm_2fa_pending=([^;]+)/);
    const pendingToken = pendingMatch ? decodeURIComponent(pendingMatch[1]) : null;

    const pendingUser = verifySessionToken(pendingToken);
    const adminEmail = (process.env.ADMIN_EMAIL || "jobs@truckmatch.fr").trim().toLowerCase();

    // L'email doit impérativement correspondre à l'administrateur
    const emailToVerify = pendingUser?.email || adminEmail;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Navigateur inconnu";

    const verifyResult = await verify2FACode(emailToVerify, code, ip, userAgent);

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || "Code de validation incorrect." },
        { status: 401 }
      );
    }

    // Succès 2FA : Émission de la session Administrateur avec validation 2FA (12h)
    const nowEpoch = Math.floor(Date.now() / 1000);
    const adminUser = {
      id: "admin",
      email: adminEmail,
      role: "admin" as const,
      name: "Administrateur TruckMatch",
      twoFactorVerifiedAt: nowEpoch,
    };

    const sessionToken = createSessionToken(adminUser);
    const response = NextResponse.json({
      success: true,
      role: "admin",
      user: adminUser,
      redirectUrl: "/espace-admin",
      message: "Authentification à deux facteurs validée avec succès.",
    });

    // Cookie de session HttpOnly valable 12 heures
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      ...sessionCookieOptions,
      maxAge: ADMIN_2FA_MAX_AGE_SECONDS,
    });

    // Supprimer le cookie de pending 2FA
    response.cookies.set("tm_2fa_pending", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error("2FA verify error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la validation du code." },
      { status: 500 }
    );
  }
}
