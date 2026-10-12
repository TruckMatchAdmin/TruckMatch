import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { notifySupportTicket } from "@/lib/telegram/notifier";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userType, name, email, phone, subject, message, priority } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Votre nom est obligatoire." }, { status: 400 });
    }
    if (!email || !String(email).includes("@")) {
      return NextResponse.json({ error: "Une adresse email valide est obligatoire." }, { status: 400 });
    }
    if (!subject || !String(subject).trim()) {
      return NextResponse.json({ error: "Le sujet de votre message est obligatoire." }, { status: 400 });
    }
    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: "Le contenu de votre message est obligatoire." }, { status: 400 });
    }

    // Génération d'un numéro de ticket unique et lisible : TK-YYYYMMDD-XXXX
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = crypto.randomInt(1000, 9999);
    const ticketNumber = `TK-${datePart}-${randomSuffix}`;

    const cleanUserType = userType || "autre";
    const cleanPriority = priority === "urgente" ? "urgente" : "normal";

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert([
        {
          ticket_number: ticketNumber,
          user_type: cleanUserType,
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: phone ? String(phone).trim() : null,
          subject: String(subject).trim(),
          message: String(message).trim(),
          priority: cleanPriority,
          status: "open",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Support] Erreur création ticket:", error);
      return NextResponse.json(
        { error: "Impossible d'enregistrer votre message. Veuillez réessayer." },
        { status: 500 }
      );
    }

    // Déclenchement immédiat de l'alerte Telegram pour l'administrateur
    try {
      await notifySupportTicket({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        user_type: ticket.user_type,
        name: ticket.name,
        email: ticket.email,
        phone: ticket.phone,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        eventType: "created",
      });
    } catch (tgErr: any) {
      console.warn("[Support] Avertissement Telegram alert:", tgErr.message);
    }

    return NextResponse.json({
      success: true,
      ticketNumber: ticket.ticket_number,
      message: `Votre demande a bien été enregistrée sous la référence ${ticket.ticket_number}. Notre équipe vous répondra sous 24h ouvrées.`,
    });
  } catch (err: any) {
    console.error("[Support] Erreur inattendue:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ status: "Support API operational" });
}
