import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const sessionUser = getSession(request);

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Réservé à l'administrateur." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    // 1. PING SUPABASE
    if (action === "ping") {
      const start = Date.now();
      const { count, error } = await supabaseAdmin.from("drivers").select("*", { count: "exact", head: true });
      const latency = Date.now() - start;
      return NextResponse.json({
        success: !error,
        latency,
        error: error ? error.message : null,
      });
    }

    // 2. TOGGLE AVAILABILITY CONDUCTEUR
    if (action === "toggle_driver_availability" && id) {
      const { data: driver } = await supabaseAdmin.from("drivers").select("availability").eq("id", id).single();
      const newAvail = driver?.availability === "immediate" ? "flexible" : "immediate";
      const { error } = await supabaseAdmin.from("drivers").update({ availability: newAvail }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, availability: newAvail });
    }

    // 3. SUPPRIMER CONDUCTEUR
    if (action === "delete_driver" && id) {
      const { error } = await supabaseAdmin.from("drivers").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // 3b. VALIDER ET PUBLIER UN CONDUCTEUR SUR LE SITE PUBLIC
    if (action === "approve_driver" && id) {
      const { error } = await supabaseAdmin
        .from("drivers")
        .update({
          status: "approved",
          is_approved: true,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({
        success: true,
        status: "approved",
        message: "Profil candidat validé avec succès. Il est maintenant visible sur le site public (carte et profils disponibles).",
      });
    }

    // 3c. REFUSER / MASQUER UN CONDUCTEUR DU SITE PUBLIC
    if (action === "reject_driver" && id) {
      const { error } = await supabaseAdmin
        .from("drivers")
        .update({
          status: "rejected",
          is_approved: false,
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({
        success: true,
        status: "rejected",
        message: "Profil candidat refusé et retiré du site public.",
      });
    }

    // 3d. REMETTRE UN CONDUCTEUR EN ATTENTE DE VALIDATION
    if (action === "reset_driver" && id) {
      const { error } = await supabaseAdmin
        .from("drivers")
        .update({
          status: "pending",
          is_approved: false,
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({
        success: true,
        status: "pending",
        message: "Profil candidat remis en attente de vérification.",
      });
    }

    // 4. SUPPRIMER ENTREPRISE
    if (action === "delete_company" && id) {
      const { error } = await supabaseAdmin.from("companies").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // 4b. CRÉER UN CONDUCTEUR DIRECTEMENT DANS SUPABASE
    if (action === "create_driver" && data) {
      const { data: inserted, error } = await supabaseAdmin.from("drivers").insert([data]).select();
      if (error) throw error;
      return NextResponse.json({ success: true, driver: inserted?.[0] });
    }

    // 4c. APPROUVER UNE OFFRE D'EMPLOI ET LA PUBLIER DIRECTEMENT SUR LE SITE
    if (action === "approve_job" && id) {
      const { error } = await supabaseAdmin
        .from("jobs")
        .update({
          status: "approved",
          is_active: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: "L'offre d'emploi a été approuvée avec succès. Elle est désormais visible publiquement sur truckmatch.fr/offres-emploi.",
      });
    }

    // 4d. REJETER OU SUSPENDRE UNE OFFRE D'EMPLOI
    if (action === "reject_job" && id) {
      const { error } = await supabaseAdmin
        .from("jobs")
        .update({
          status: "rejected",
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: "L'offre d'emploi a été rejetée/suspendue et retirée de la parution publique.",
      });
    }

    // 4e. SUPPRIMER DÉFINITIVEMENT UNE OFFRE D'EMPLOI
    if (action === "delete_job" && id) {
      const { error } = await supabaseAdmin.from("jobs").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "L'offre d'emploi a été supprimée." });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin actions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
