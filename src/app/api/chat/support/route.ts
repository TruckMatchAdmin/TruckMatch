import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { sendNewSupportMessageToDriverEmail } from "@/lib/email/mailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

function cleanId(rawId: string): string {
  if (!rawId) return "";
  return rawId.replace(/^cand-/, "").replace(/^comp-/, "");
}

/**
 * GET: Récupère les messages d'une conversation support
 */
export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawRecipientId = searchParams.get("recipient_id") || "";
    const markRead = searchParams.get("mark_read") === "true";
    const markReadByAdmin = searchParams.get("mark_read_by_admin") === "true";

    // CAS 1 : ADMINISTRATEUR
    if (session.role === "admin") {
      if (rawRecipientId) {
        const recipientId = cleanId(rawRecipientId);

        // Si l'admin ouvre la conversation, on marque les messages du candidat/entreprise comme lus par l'admin
        if (markReadByAdmin) {
          await supabaseAdmin
            .from("support_messages")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("recipient_id", recipientId)
            .neq("sender_type", "admin")
            .eq("is_read", false);
        }

        const { data: messages, error } = await supabaseAdmin
          .from("support_messages")
          .select("*")
          .eq("recipient_id", recipientId)
          .order("created_at", { ascending: true });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          recipientId,
          messages: messages || [],
        });
      }

      // Si pas de recipient_id spécifié, on renvoie les derniers messages récents pour synthétiser les statuts "Vu" et badges
      const { data: recentMessages, error } = await supabaseAdmin
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        messages: recentMessages || [],
      });
    }

    // CAS 2 : CANDIDAT (CHAUFFEUR)
    if (session.role === "driver") {
      const { data: driver } = await supabaseAdmin
        .from("drivers")
        .select("id, email, first_name, last_name")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();

      if (!driver) {
        return NextResponse.json({ error: "Profil chauffeur introuvable." }, { status: 404 });
      }

      // Le candidat consulte ses messages : on met à jour automatiquement les messages de l'admin en LUS avec le timestamp exact
      if (markRead !== false) {
        await supabaseAdmin
          .from("support_messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("recipient_id", driver.id)
          .eq("sender_type", "admin")
          .eq("is_read", false);
      }

      const { data: messages, error } = await supabaseAdmin
        .from("support_messages")
        .select("*")
        .eq("recipient_id", driver.id)
        .order("created_at", { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Nombre de messages non lus restants de l'admin
      const unreadCount = (messages || []).filter(
        (m) => m.sender_type === "admin" && !m.is_read
      ).length;

      return NextResponse.json({
        success: true,
        driverId: driver.id,
        messages: messages || [],
        unreadCount,
      });
    }

    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  } catch (err: any) {
    console.error("[Support Chat API GET] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST: Envoi d'un message dans le chat support
 */
export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    const body = await request.json();
    const { message, recipient_id, recipient_type } = body;

    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: "Le message ne peut pas être vide." }, { status: 400 });
    }

    const cleanMessageText = String(message).trim();

    // 1. ENVOI PAR L'ADMINISTRATEUR AU CANDIDAT OU À L'ENTREPRISE
    if (session.role === "admin") {
      if (!recipient_id) {
        return NextResponse.json({ error: "Destinataire requis." }, { status: 400 });
      }

      const cleanRecipientId = cleanId(recipient_id);
      const normalizedRecipientType =
        recipient_type === "candidat" || recipient_type === "candidate"
          ? "candidate"
          : "company";

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("support_messages")
        .insert([
          {
            recipient_id: cleanRecipientId,
            recipient_type: normalizedRecipientType,
            sender_type: "admin",
            sender_name: "Support TruckMatch",
            message: cleanMessageText,
            is_read: false,
            read_at: null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertErr) {
        console.error("[Support Chat POST Admin] Erreur insert:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      // Si le destinataire est un candidat (chauffeur), on lui envoie immédiatement une notification email !
      if (normalizedRecipientType === "candidate") {
        try {
          const { data: driver } = await supabaseAdmin
            .from("drivers")
            .select("id, email, first_name, last_name")
            .eq("id", cleanRecipientId)
            .maybeSingle();

          if (driver && driver.email) {
            const driverDisplayName = `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Conducteur";
            
            // Envoi asynchrone non bloquant pour fluidité totale
            sendNewSupportMessageToDriverEmail({
              email: driver.email.toLowerCase().trim(),
              driverName: driverDisplayName,
              messagePreview: cleanMessageText,
              senderName: "L'équipe Support TruckMatch",
            })
              .then((mailRes) => {
                if (mailRes.success) {
                  console.log(`[Support Chat] Notification email envoyée avec succès à ${driver.email}`);
                } else {
                  console.warn(`[Support Chat] Échec envoi email à ${driver.email}:`, mailRes.error);
                }
              })
              .catch((mailErr) => {
                console.error("[Support Chat] Erreur promesse email:", mailErr);
              });
          }
        } catch (findErr) {
          console.error("[Support Chat] Erreur recherche chauffeur pour notification email:", findErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: inserted,
      });
    }

    // 2. ENVOI PAR LE CANDIDAT VERS LE SUPPORT TRUCKMATCH
    if (session.role === "driver") {
      const { data: driver } = await supabaseAdmin
        .from("drivers")
        .select("id, email, first_name, last_name")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();

      if (!driver) {
        return NextResponse.json({ error: "Profil chauffeur introuvable." }, { status: 404 });
      }

      const driverDisplayName = `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Conducteur";

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("support_messages")
        .insert([
          {
            recipient_id: driver.id,
            recipient_type: "candidate",
            sender_type: "candidate",
            sender_name: driverDisplayName,
            message: cleanMessageText,
            is_read: false,
            read_at: null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertErr) {
        console.error("[Support Chat POST Candidate] Erreur insert:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: inserted,
      });
    }

    return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
  } catch (err: any) {
    console.error("[Support Chat API POST] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH: Marquer explicitement des messages comme lus
 */
export async function PATCH(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    const body = await request.json();
    const { action, recipient_id } = body;

    if (action === "mark_read_by_candidate" && session.role === "driver") {
      const { data: driver } = await supabaseAdmin
        .from("drivers")
        .select("id")
        .eq("email", session.email.toLowerCase().trim())
        .maybeSingle();

      if (!driver) return NextResponse.json({ error: "Chauffeur non trouvé" }, { status: 404 });

      await supabaseAdmin
        .from("support_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("recipient_id", driver.id)
        .eq("sender_type", "admin")
        .eq("is_read", false);

      return NextResponse.json({ success: true });
    }

    if (action === "mark_read_by_admin" && session.role === "admin" && recipient_id) {
      const cleanRecipientId = cleanId(recipient_id);
      await supabaseAdmin
        .from("support_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("recipient_id", cleanRecipientId)
        .neq("sender_type", "admin")
        .eq("is_read", false);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
  } catch (err: any) {
    console.error("[Support Chat API PATCH] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
