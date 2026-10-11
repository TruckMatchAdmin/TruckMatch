import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "driver" && session.role !== "admin")) {
      return NextResponse.json(
        { error: "Accès refusé. Connexion candidat requise." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    // 1. Mise à jour du profil conducteur dans Supabase
    if (action === "update_profile") {
      const {
        first_name,
        last_name,
        phone,
        city,
        postal_code,
        address,
        availability,
        permits,
        fimo,
        fco,
        chrono_card,
        adr,
        caces,
        experience,
        specialties,
      } = data || {};

      const updatePayload: Record<string, any> = {};
      if (first_name !== undefined) updatePayload.first_name = first_name;
      if (last_name !== undefined) updatePayload.last_name = last_name;
      if (phone !== undefined) updatePayload.phone = phone;
      if (city !== undefined) updatePayload.city = city;
      if (postal_code !== undefined) {
        updatePayload.postal_code = postal_code;
        if (postal_code && postal_code.length >= 2) {
          updatePayload.department = postal_code.slice(0, 2);
        }
      }
      if (address !== undefined) updatePayload.address = address;
      if (availability !== undefined) updatePayload.availability = availability;
      if (permits !== undefined) updatePayload.permits = permits;
      if (fimo !== undefined) updatePayload.fimo = !!fimo;
      if (fco !== undefined) updatePayload.fco = !!fco;
      if (chrono_card !== undefined) updatePayload.chrono_card = !!chrono_card;
      if (adr !== undefined) updatePayload.adr = adr;
      if (caces !== undefined) updatePayload.caces = caces;
      if (experience !== undefined) updatePayload.experience = experience;
      if (specialties !== undefined) updatePayload.specialties = specialties;

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("drivers")
        .update(updatePayload)
        .eq("email", session.email.toLowerCase().trim())
        .select()
        .maybeSingle();

      if (updateErr) {
        console.error("Driver update error:", updateErr);
        throw updateErr;
      }

      return NextResponse.json({
        success: true,
        driver: updated,
        message: "Profil synchronisé avec succès dans Supabase.",
      });
    }

    // 2. Bascule de disponibilité rapide
    if (action === "toggle_availability") {
      const { data: current } = await supabaseAdmin
        .from("drivers")
        .select("availability")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();

      const newAvail =
        current?.availability === "immediate"
          ? "flexible"
          : current?.availability === "flexible"
          ? "busy"
          : "immediate";

      const { error } = await supabaseAdmin
        .from("drivers")
        .update({ availability: newAvail })
        .eq("email", session.email.toLowerCase().trim());

      if (error) throw error;

      return NextResponse.json({ success: true, availability: newAvail });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Candidate actions error:", err);
    return NextResponse.json({ error: "Erreur serveur: " + err.message }, { status: 500 });
  }
}
