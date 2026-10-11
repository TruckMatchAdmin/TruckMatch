import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  SESSION_COOKIE,
  createSessionToken,
  safeEqual,
  sessionCookieOptions,
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
      if (!safeEqual(String(password), adminPassword)) {
        return NextResponse.json(
          { error: "Adresse email ou mot de passe incorrect." },
          { status: 401 }
        );
      }
      return sessionResponse(
        { success: true, role: "admin", redirectUrl: "/espace-admin" },
        { id: "admin", email: cleanEmail, role: "admin", name: "Administrateur TruckMatch" }
      );
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
