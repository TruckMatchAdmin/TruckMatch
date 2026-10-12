import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  SESSION_COOKIE,
  createSessionToken,
  safeEqual,
  sessionCookieOptions,
  getSession,
  isAdmin2FAValid,
} from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

function sessionResponse(
  body: Record<string, unknown>,
  user: { id: string; email: string; role: "admin" | "company" | "driver"; name: string }
) {
  const response = NextResponse.json({ ...body, user });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre email et votre mot de passe." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Compte administrateur : défini UNIQUEMENT par les variables d'environnement du serveur.
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (adminEmail && adminPassword && cleanEmail === adminEmail) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Navigateur inconnu";

      if (!safeEqual(String(password), adminPassword)) {
        // Journalisation de la tentative échouée
        try {
          await supabaseAdmin.from("admin_audit_logs").insert({
            event_type: "unauthorized_attempt",
            admin_email: cleanEmail,
            ip_address: ip,
            user_agent: userAgent,
            details: { reason: "Mot de passe admin incorrect" },
          });
        } catch {}

        return NextResponse.json(
          { error: "Adresse email ou mot de passe incorrect." },
          { status: 401 }
        );
      }

      // Vérifier si une session 2FA admin valide (< 12h) existe déjà
      const existingSession = getSession(request);
      if (existingSession && isAdmin2FAValid(existingSession)) {
        return sessionResponse(
          { success: true, role: "admin", redirectUrl: "/espace-admin" },
          existingSession
        );
      }

      // Étape 1 validée : Génération et expédition sécurisée du code 2FA par Telegram
      const { generateAndSend2FACode } = await import("@/lib/auth/twoFactor");
      const twoFaResult = await generateAndSend2FACode(cleanEmail, ip, userAgent);

      if (!twoFaResult.success) {
        return NextResponse.json(
          { error: twoFaResult.error || "Impossible d'envoyer le code de vérification Telegram." },
          { status: 429 }
        );
      }

      const pendingToken = createSessionToken({
        id: "admin-pending",
        email: cleanEmail,
        role: "admin",
        name: "Admin (2FA Requis)",
      });

      const response = NextResponse.json({
        success: true,
        requires2FA: true,
        message: "Code à 4 chiffres envoyé sur votre Telegram @TruckMatchAdmin_bot.",
      });

      response.cookies.set("tm_2fa_pending", pendingToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 5 * 60, // 5 minutes
        sameSite: "lax",
      });

      return response;
    }

    // Authentification via Supabase Auth (conducteurs et entreprises)
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Adresse email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const authUser = authData?.user;
    let role: "company" | "driver" = "driver";
    let name = cleanEmail;
    let profileData: any = null;

    // Le rôle est déterminé par les tables du serveur, jamais par user_metadata (modifiable par l'utilisateur)
    const { data: driver } = await supabaseAdmin
      .from("drivers")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (driver) {
      role = "driver";
      name = `${driver.first_name} ${driver.last_name}`;
      profileData = driver;
    } else {
      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (company) {
        role = "company";
        name = company.company_name;
        profileData = company;
      }
    }

    const redirectUrl = role === "company" ? "/espace-entreprise" : "/espace-candidat";

    return sessionResponse(
      { success: true, role, redirectUrl, profile: profileData },
      { id: authUser?.id || cleanEmail, email: cleanEmail, role, name }
    );
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}
