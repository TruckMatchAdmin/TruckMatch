import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "./bot";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

/**
 * Formate une date en fuseau Europe/Paris
 */
export function formatParisDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

/**
 * Enregistre et garantit l'unicité d'une notification via idempotency_key
 */
async function canSendNotification(idempotencyKey: string, eventType: string, payload: any): Promise<boolean> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("telegram_notifications_log")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing) {
      console.log(`[Notifier] Notification ignorée (doublon idempotency_key: ${idempotencyKey})`);
      return false;
    }

    await supabaseAdmin.from("telegram_notifications_log").insert({
      idempotency_key: idempotencyKey,
      event_type: eventType,
      payload,
      sent_at: new Date().toISOString(),
      success: true,
    });

    return true;
  } catch (err: any) {
    console.warn("[Notifier] Warning log notification:", err.message);
    return true; // En cas d'erreur de journalisation, on envoie tout de même
  }
}

/**
 * Échappe le HTML pour l'API Telegram
 */
function escapeHtml(str: string = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Notification : Inscription d'un Candidat Conducteur
 */
export async function notifyDriverRegistered(driver: {
  id: string;
  first_name: string;
  last_name: string;
  city?: string;
  postal_code?: string;
  department?: string;
  permits?: string[];
  fimo?: boolean;
  fco?: boolean;
  chrono_card?: boolean;
  experience?: string;
  availability?: string;
}) {
  const idempotencyKey = `driver_reg_${driver.id}`;
  const shouldSend = await canSendNotification(idempotencyKey, "driver_registered", { driver_id: driver.id });
  if (!shouldSend) return;

  const dateStr = formatParisDate();
  const expPermits = (driver.permits || []).join(", ") || "Non spécifié";
  const qualifications = [
    driver.fimo ? "FIMO" : null,
    driver.fco ? "FCO" : null,
    driver.chrono_card ? "Carte Chro." : null,
  ].filter(Boolean).join(" • ") || "À compléter";

  const safeLastInitial = driver.last_name ? `${driver.last_name.charAt(0)}.` : "";
  const maskedName = `${driver.first_name} ${safeLastInitial}`.trim();
  const location = [driver.postal_code, driver.city, driver.department ? `(${driver.department})` : ""]
    .filter(Boolean)
    .join(" ");

  const text = [
    `🚀 <b>NOUVELLE INSCRIPTION TRUCKMATCH</b>`,
    `<b>Type :</b> Candidat Conducteur Routier`,
    `<b>Date & Heure :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Identifiant :</b> <code>${escapeHtml(driver.id)}</code>`,
    `<b>Conducteur :</b> ${escapeHtml(maskedName)}`,
    `<b>Localisation :</b> ${escapeHtml(location || "France")}`,
    `<b>Permis :</b> <code>${escapeHtml(expPermits)}</code>`,
    `<b>Qualifs :</b> ${escapeHtml(qualifications)}`,
    `<b>Expérience :</b> ${escapeHtml(driver.experience || "1-3 ans")}`,
    `<b>Statut :</b> ⏳ En attente de validation manuelle`,
    `<b>Source :</b> Portail Inscription Web`,
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=candidats">Accéder à l'Espace Admin</a>`,
  ].join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification : Inscription d'une Entreprise / Recruteur
 */
export async function notifyCompanyRegistered(company: {
  id: string;
  siret?: string;
  company_name: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_role?: string;
  city?: string;
  postal_code?: string;
  fleet_size?: string;
}) {
  const idempotencyKey = `comp_reg_${company.id}`;
  const shouldSend = await canSendNotification(idempotencyKey, "company_registered", { company_id: company.id });
  if (!shouldSend) return;

  const dateStr = formatParisDate();
  const safeContact = [
    company.contact_first_name,
    company.contact_last_name ? `${company.contact_last_name.charAt(0)}.` : "",
    company.contact_role ? `(${company.contact_role})` : "",
  ].filter(Boolean).join(" ");

  const location = [company.postal_code, company.city].filter(Boolean).join(" ");

  const text = [
    `🚀 <b>NOUVELLE INSCRIPTION TRUCKMATCH</b>`,
    `<b>Type :</b> Entreprise / Transporteur Recruteur`,
    `<b>Date & Heure :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Identifiant :</b> <code>${escapeHtml(company.id)}</code>`,
    `<b>Société :</b> <b>${escapeHtml(company.company_name)}</b>`,
    `<b>SIRET :</b> <code>${escapeHtml(company.siret || "Non renseigné")}</code>`,
    `<b>Contact :</b> ${escapeHtml(safeContact || "Dirigeant")}`,
    `<b>Localisation :</b> ${escapeHtml(location || "France")}`,
    `<b>Flotte de camions :</b> ${escapeHtml(company.fleet_size || "1-5 véhicules")}`,
    `<b>Statut :</b> ⏳ En attente de vérification`,
    `<b>Source :</b> Portail Inscription Entreprise`,
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=entreprises">Accéder à l'Espace Admin</a>`,
  ].join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification : Ticket Support ou Message de Contact
 */
export async function notifySupportTicket(ticket: {
  id: string;
  ticket_number: string;
  user_type: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  priority?: string;
  status?: string;
  eventType?: "created" | "priority_change" | "resolved" | "unanswered_alert";
}) {
  const event = ticket.eventType || "created";
  const idempotencyKey = `ticket_${event}_${ticket.id}_${Date.now()}`;
  const shouldSend = await canSendNotification(idempotencyKey, `ticket_${event}`, { ticket_id: ticket.id });
  if (!shouldSend) return;

  const dateStr = formatParisDate();
  const safeExcerpt = (ticket.message || "").slice(0, 160).trim() + ((ticket.message || "").length > 160 ? "…" : "");

  let header = `🆘 <b>NOUVEAU MESSAGE SUPPORT</b>`;
  if (event === "resolved") header = `✅ <b>TICKET SUPPORT RÉSOLU</b>`;
  if (event === "priority_change") header = `⚡ <b>CHANGEMENT PRIORITÉ SUPPORT</b>`;
  if (event === "unanswered_alert") header = `⏰ <b>ALERTE TICKET SANS RÉPONSE</b>`;

  const priorityBadge = ticket.priority === "urgente" ? "🔴 URGENTE" : ticket.priority === "haute" ? "🟠 HAUTE" : "🟡 NORMALE";

  const text = [
    header,
    `<b>Ticket N° :</b> <code>${escapeHtml(ticket.ticket_number)}</code>`,
    `<b>Date & Heure :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Priorité :</b> ${priorityBadge}`,
    `<b>Demandeur :</b> ${escapeHtml(ticket.user_type)} (${escapeHtml(ticket.name)})`,
    `<b>Contact :</b> <code>${escapeHtml(ticket.email)}</code> ${ticket.phone ? `• <code>${escapeHtml(ticket.phone)}</code>` : ""}`,
    `<b>Sujet :</b> <b>${escapeHtml(ticket.subject)}</b>`,
    `<b>Extrait :</b> <i>« ${escapeHtml(safeExcerpt)} »</i>`,
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=support">Consulter et Traiter le Ticket</a>`,
  ].join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification : Offre d'emploi publiée
 */
export async function notifyJobCreated(job: {
  id: string;
  title: string;
  company_name: string;
  contract_type?: string;
  location?: string;
  salary?: string;
}) {
  const idempotencyKey = `job_pub_${job.id}`;
  const shouldSend = await canSendNotification(idempotencyKey, "job_created", { job_id: job.id });
  if (!shouldSend) return;

  const dateStr = formatParisDate();
  const text = [
    `💼 <b>NOUVELLE OFFRE D'EMPLOI PUBLIÉE</b>`,
    `<b>Date & Heure :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Intitulé :</b> <b>${escapeHtml(job.title)}</b>`,
    `<b>Entreprise :</b> ${escapeHtml(job.company_name)}`,
    `<b>Contrat :</b> <code>${escapeHtml(job.contract_type || "CDI")}</code>`,
    `<b>Lieu :</b> ${escapeHtml(job.location || "France")}`,
    job.salary ? `<b>Rémunération :</b> ${escapeHtml(job.salary)}` : "",
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=offres">Gérer l'offre sur TruckMatch</a>`,
  ].filter(Boolean).join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification : Alerte de sécurité ou activité suspecte
 */
export async function notifySecurityAlert(params: {
  type: string;
  ip?: string;
  userAgent?: string;
  details: string;
}) {
  const dateStr = formatParisDate();
  const text = [
    `⚠️ <b>ALERTE SÉCURITÉ ADMIN</b>`,
    `<b>Date & Heure :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Événement :</b> <b>${escapeHtml(params.type)}</b>`,
    params.ip ? `<b>Adresse IP :</b> <code>${escapeHtml(params.ip)}</code>` : "",
    `<b>Détails :</b> ${escapeHtml(params.details)}`,
    ``,
    `🛡️ <i>Toutes les tentatives suspectes sont bloquées côté serveur.</i>`,
  ].filter(Boolean).join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification : Erreur serveur critique
 */
export async function notifyServerError(params: {
  context: string;
  error: string;
}) {
  const dateStr = formatParisDate();
  const text = [
    `🚨 <b>ERREUR SYSTÈME CRITIQUE</b>`,
    `<b>Date & Heure :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Composant :</b> <code>${escapeHtml(params.context)}</code>`,
    `<b>Message :</b> <code>${escapeHtml(params.error.slice(0, 200))}</code>`,
  ].join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}
