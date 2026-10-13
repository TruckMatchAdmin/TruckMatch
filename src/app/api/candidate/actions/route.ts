import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { notifyCommercialPurchase } from "@/lib/telegram/notifier";

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

    // 3. Activer le Boost Visibilité Candidat (4.99 € pour 3 mois)
    if (action === "activate_boost") {
      const { data: driver } = await supabaseAdmin
        .from("drivers")
        .select("*")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();

      if (!driver) {
        return NextResponse.json({ error: "Profil conducteur introuvable." }, { status: 404 });
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 3);

      const orderNumber = `BST-${Date.now().toString(36).toUpperCase()}`;

      // Enregistrer la commande
      await supabaseAdmin.from("commercial_orders").insert({
        order_number: orderNumber,
        driver_id: driver.id,
        order_type: "candidate_boost",
        product_name: "Boost Visibilité Candidat (3 Mois)",
        product_id: "boost_3m",
        quantity: 1,
        amount_eur: 4.99,
        vat_amount: 0.83,
        total_paid: 4.99,
        is_paid: true,
        status: "paid",
        payment_method: "cb",
        payment_reference: `CB-${Date.now()}`,
        paid_at: new Date().toISOString(),
        metadata: {
          driver_id: driver.id,
          driver_name: `${driver.first_name || ""} ${driver.last_name || ""}`.trim(),
          driver_email: driver.email,
          period_months: 3,
        },
      });

      // Mettre à jour le profil conducteur
      const { data: updatedDriver, error: updateErr } = await supabaseAdmin
        .from("drivers")
        .update({
          is_boosted: true,
          boosted_until: expiresAt.toISOString(),
          is_premium: true,
          is_reliable: true,
        })
        .eq("id", driver.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Notification Telegram
      try {
        await notifyCommercialPurchase({
          orderNumber,
          orderType: "candidate_boost",
          companyName: `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Candidat Conducteur",
          companyEmail: driver.email,
          productName: "Boost Visibilité Candidat 3 Mois (1er de liste, Badge Premium, Candidat Fiable)",
          amountEur: 4.99,
        });
      } catch (tgErr) {
        console.error("Telegram notify error:", tgErr);
      }

      // Envoi de l'email officiel de confirmation & reçu Boost 4,99 €
      try {
        const { sendPaymentDriverBoostEmail } = await import("@/lib/email/mailer");
        await sendPaymentDriverBoostEmail({
          email: driver.email,
          driverName: `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Conducteur",
          orderNumber,
          amountEur: 4.99,
          paidAt: new Date().toLocaleDateString("fr-FR"),
          expiresAt: expiresAt.toLocaleDateString("fr-FR"),
        });
      } catch (mailErr) {
        console.warn("[Boost] Erreur envoi email confirmation boost:", mailErr);
      }

      return NextResponse.json({
        success: true,
        message: "Félicitations ! Votre profil est désormais boosté en 1ère position pour 3 mois.",
        driver: updatedDriver,
      });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Candidate actions error:", err);
    return NextResponse.json({ error: "Erreur serveur: " + err.message }, { status: 500 });
  }
}
