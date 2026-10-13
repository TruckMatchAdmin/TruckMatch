import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

function generateSlug(name: string, fallbackId: string): string {
  const base = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `transport-${fallbackId.slice(0, 8)}`;
}

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "company" && session.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    let company: any = null;
    const { data: foundComp } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("email", session.email.toLowerCase().trim())
      .maybeSingle();

    if (foundComp) {
      company = foundComp;
    } else if (session.role === "admin" || session.email.toLowerCase().includes("truckmatch")) {
      const { data: adminComp } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("email", "jobs@truckmatch.fr")
        .maybeSingle();
      company = adminComp;
    }

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
    }

    const slug = company.slug || generateSlug(company.company_name, company.id);

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        slug,
      },
      publicUrl: `/entreprises/${slug}`,
    });
  } catch (err: any) {
    console.error("GET /api/company/profile error:", err);
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "company" && session.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    let company: any = null;
    const { data: foundComp } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("email", session.email.toLowerCase().trim())
      .maybeSingle();

    if (foundComp) {
      company = foundComp;
    } else if (session.role === "admin" || session.email.toLowerCase().includes("truckmatch")) {
      const { data: adminComp } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("email", "jobs@truckmatch.fr")
        .maybeSingle();
      company = adminComp;
    }

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const {
      logo_url,
      cover_url,
      about_text,
      commitments_text,
      website_url,
      founded_year,
      fleet_size,
      phone,
      address,
      postal_code,
      city,
      equipment_types,
      operating_zones,
      driver_benefits,
      custom_slug,
    } = body;

    // Déterminer le slug définitif
    let finalSlug = company.slug;
    if (custom_slug && typeof custom_slug === "string") {
      finalSlug = generateSlug(custom_slug, company.id);
    } else if (!finalSlug) {
      finalSlug = generateSlug(company.company_name, company.id);
    }

    const updatePayload: any = {
      slug: finalSlug,
    };

    if (logo_url !== undefined) updatePayload.logo_url = logo_url;
    if (cover_url !== undefined) updatePayload.cover_url = cover_url;
    if (about_text !== undefined) updatePayload.about_text = about_text;
    if (commitments_text !== undefined) updatePayload.commitments_text = commitments_text;
    if (website_url !== undefined) updatePayload.website_url = website_url;
    if (founded_year !== undefined) updatePayload.founded_year = founded_year;
    if (fleet_size !== undefined) updatePayload.fleet_size = fleet_size;
    if (phone !== undefined) updatePayload.phone = phone;
    if (address !== undefined) updatePayload.address = address;
    if (postal_code !== undefined) updatePayload.postal_code = postal_code;
    if (city !== undefined) updatePayload.city = city;
    if (Array.isArray(equipment_types)) updatePayload.equipment_types = equipment_types;
    if (Array.isArray(operating_zones)) updatePayload.operating_zones = operating_zones;
    if (Array.isArray(driver_benefits)) updatePayload.driver_benefits = driver_benefits;

    const { data: updatedCompany, error: updateErr } = await supabaseAdmin
      .from("companies")
      .update(updatePayload)
      .eq("id", company.id)
      .select()
      .single();

    if (updateErr) {
      console.error("Update company profile error:", updateErr);
      return NextResponse.json(
        { error: "Impossible d'enregistrer le profil : " + updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil et page de présentation de l'entreprise mis à jour avec succès !",
      company: updatedCompany,
      publicUrl: `/entreprises/${updatedCompany.slug || finalSlug}`,
    });
  } catch (err: any) {
    console.error("POST /api/company/profile error:", err);
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 });
  }
}
