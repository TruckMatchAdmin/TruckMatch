import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

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

    const cleanEmail = email.trim().toLowerCase();

    // 1. Authentification via Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    // Si erreur de mot de passe / auth
    if (authError) {
      return NextResponse.json(
        { error: "Adresse email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const authUser = authData?.user;
    let role = authUser?.user_metadata?.role;
    let name = authUser?.user_metadata?.name || cleanEmail;
    let profileData: any = null;

    // Détection rôle admin
    if (cleanEmail === "admin@truckmatch.fr" || role === "admin") {
      role = "admin";
      name = "Administrateur";
    }

    // Si pas admin, identifier si chauffeur ou entreprise
    if (role !== "admin") {
      // Vérifier table drivers
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
        // Vérifier table companies
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
    }

    // Définir l'URL de redirection selon le profil
    let redirectUrl = "/espace-candidat";
    if (role === "admin") {
      redirectUrl = "/espace-admin";
    } else if (role === "company") {
      redirectUrl = "/espace-entreprise";
    } else {
      role = "driver";
      redirectUrl = "/espace-candidat";
    }

    const sessionPayload = {
      id: authUser?.id,
      email: cleanEmail,
      role,
      name,
      timestamp: Date.now(),
    };

    const response = NextResponse.json({
      success: true,
      role,
      redirectUrl,
      user: sessionPayload,
      profile: profileData,
    });

    // Poser cookie de session sécurisé
    response.cookies.set("tm_session", JSON.stringify(sessionPayload), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion : " + err.message },
      { status: 500 }
    );
  }
}
