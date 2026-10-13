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

/**
 * Notification : Nouvel achat commercial confirmé sur TruckMatch
 */
export async function notifyCommercialPurchase(order: {
  orderNumber: string;
  orderType: "subscription" | "credits" | "job_post" | "job_boost" | "ad_campaign" | "search_mission" | string;
  companyName: string;
  companyEmail: string;
  productName: string;
  amountEur: number;
  paidAt?: string | Date;
  subscriptionDetails?: {
    planName: string;
    period?: string;
    startedAt?: string;
    expiresAt?: string;
  };
  searchMissionDetails?: {
    missionType: string;
    driverCount: number;
    regions?: string[];
  };
}) {
  const idempotencyKey = `purchase_${order.orderNumber}`;
  const shouldSend = await canSendNotification(idempotencyKey, "commercial_purchase", {
    order_number: order.orderNumber,
    company_name: order.companyName,
    amount_eur: order.amountEur,
  });
  if (!shouldSend) return;

  const dateStr = formatParisDate(order.paidAt ? new Date(order.paidAt) : new Date());
  const amountFormatted = Number(order.amountEur).toFixed(2).replace(".", ",");

  let typeLabel = "Achat commercial";
  if (order.orderType === "subscription") typeLabel = "Nouvel abonnement payant";
  else if (order.orderType === "credits") typeLabel = "Achat de crédits";
  else if (order.orderType === "job_post") typeLabel = "Publication d'offre d'emploi";
  else if (order.orderType === "job_boost") typeLabel = "Mise en avant d'offre";
  else if (order.orderType === "ad_campaign") typeLabel = "Campagne publicitaire";
  else if (order.orderType === "search_mission") typeLabel = "Mission de recherche de chauffeurs";

  const lines = [
    `🟢 <b>NOUVEL ACHAT TRUCKMATCH</b>`,
    ``,
    `<b>Type :</b> ${escapeHtml(typeLabel)}`,
    `<b>Entreprise :</b> <b>${escapeHtml(order.companyName)}</b>`,
    `<b>Compte :</b> <code>${escapeHtml(order.companyEmail)}</code>`,
    `<b>Produit :</b> <b>${escapeHtml(order.productName)}</b>`,
    `<b>Montant encaissé :</b> <b>${escapeHtml(amountFormatted)} €</b>`,
    `<b>Référence :</b> <code>${escapeHtml(order.orderNumber)}</code>`,
    `<b>Date :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Statut :</b> ✅ Paiement confirmé`,
  ];

  if (order.subscriptionDetails) {
    lines.push(
      ``,
      `📋 <i>Détails de l'abonnement :</i>`,
      `• <b>Forfait :</b> ${escapeHtml(order.subscriptionDetails.planName)}`,
      `• <b>Périodicité :</b> ${escapeHtml(order.subscriptionDetails.period || "Mensuel")}`,
      order.subscriptionDetails.startedAt ? `• <b>Début :</b> ${escapeHtml(order.subscriptionDetails.startedAt)}` : "",
      order.subscriptionDetails.expiresAt ? `• <b>Prochaine échéance :</b> ${escapeHtml(order.subscriptionDetails.expiresAt)}` : ""
    );
  }

  if (order.searchMissionDetails) {
    const regStr = (order.searchMissionDetails.regions || []).join(", ") || "Toute France";
    lines.push(
      ``,
      `🎯 <i>Détails de la mission de recherche :</i>`,
      `• <b>Type de mission :</b> ${escapeHtml(order.searchMissionDetails.missionType)}`,
      `• <b>Conducteurs demandés :</b> ${order.searchMissionDetails.driverCount}`,
      `• <b>Régions concernées :</b> ${escapeHtml(regStr)}`
    );
  }

  lines.push(
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=commercial">Accéder au tableau commercial</a>`
  );

  const text = lines.filter(Boolean).join("\n");
  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification : Attribution d'un abonnement offert par l'administration (0 € de CA)
 */
export async function notifyGiftedSubscription(params: {
  companyName: string;
  companyEmail: string;
  planName: string;
  reason: string;
  durationDays: number;
  adminEmail: string;
}) {
  const dateStr = formatParisDate();
  const text = [
    `🎁 <b>ABONNEMENT OFFERT PAR L'ADMINISTRATION</b>`,
    `<i>(Attention : non comptabilisé en vente ni en chiffre d'affaires)</i>`,
    ``,
    `<b>Entreprise :</b> <b>${escapeHtml(params.companyName)}</b>`,
    `<b>Compte :</b> <code>${escapeHtml(params.companyEmail)}</code>`,
    `<b>Forfait attribué :</b> <b>${escapeHtml(params.planName)}</b>`,
    `<b>Motif administratif :</b> ${escapeHtml(params.reason)}`,
    `<b>Durée accordée :</b> ${params.durationDays} jours`,
    `<b>Attribué par :</b> <code>${escapeHtml(params.adminEmail)}</code>`,
    `<b>Date :</b> ${escapeHtml(dateStr)} (Paris)`,
    `<b>Statut :</b> Offert par TruckMatch`,
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=commercial">Voir dans l'espace administration</a>`,
  ].join("\n");

  await sendTelegramMessage(text, { parseMode: "HTML" });
}

/**
 * Notification Telegram envoyée immédiatement quand un destinataire ouvre et lit un email
 */
export async function notifyEmailOpened(params: {
  recipientEmail: string;
  emailType: string;
  subject: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const idempotencyKey = `email_open_${params.recipientEmail}_${params.emailType}_${Date.now().toString().slice(0, 7)}`;
  const shouldSend = await canSendNotification(idempotencyKey, "email_open", {
    recipient_email: params.recipientEmail,
    email_type: params.emailType,
  });
  if (!shouldSend) return;

  const dateStr = formatParisDate();

  let typeLabel = "Email officiel";
  if (params.emailType === "welcome_driver") typeLabel = "Bienvenue Chauffeur / Candidat";
  else if (params.emailType === "welcome_company") typeLabel = "Bienvenue Entreprise / Recruteur";
  else if (params.emailType === "payment_subscription") typeLabel = "Remerciement Paiement Abonnement";
  else if (params.emailType === "payment_driver_boost") typeLabel = "Remerciement Paiement Boost 4,99 €";

  const lines = [
    `👁️ <b>EMAIL OUVERT &amp; LU PAR LE DESTINATAIRE</b> 📨`,
    ``,
    `👤 <b>Destinataire :</b> <code>${escapeHtml(params.recipientEmail)}</code>`,
    `📄 <b>Type d'email :</b> <b>${escapeHtml(typeLabel)}</b>`,
    `✉️ <b>Sujet :</b> ${escapeHtml(params.subject)}`,
    `🕒 <b>Date de lecture :</b> ${escapeHtml(dateStr)} (Paris)`,
    params.ipAddress ? `🌐 <b>IP :</b> <code>${escapeHtml(params.ipAddress)}</code>` : "",
  ].filter(Boolean);

  await sendTelegramMessage(lines.join("\n"), { parseMode: "HTML" });
}

/**
 * Notification Telegram envoyée lorsqu'une entreprise débloque un candidat chauffeur
 */
export async function notifyDriverUnlocked(params: {
  companyName: string;
  companyEmail: string;
  driverName: string;
  driverPermits: string;
  driverCity: string;
  creditsRemaining: number;
  planName: string;
}) {
  const dateStr = formatParisDate();
  const lines = [
    `🔓 <b>CANDIDAT CONDUCTEUR DÉBLOQUÉ</b> 🚛`,
    ``,
    `🏢 <b>Entreprise :</b> <b>${escapeHtml(params.companyName)}</b>`,
    `📧 <b>Email compte :</b> <code>${escapeHtml(params.companyEmail)}</code>`,
    `👑 <b>Forfait entreprise :</b> <b>${escapeHtml(params.planName)}</b>`,
    ``,
    `👤 <b>Conducteur contacté :</b> <b>${escapeHtml(params.driverName)}</b>`,
    `📋 <b>Permis :</b> ${escapeHtml(params.driverPermits)}`,
    `📍 <b>Localisation :</b> ${escapeHtml(params.driverCity)}`,
    ``,
    `⚡ <b>Solde crédits restant :</b> <b>${params.creditsRemaining} crédit(s)</b>`,
    `🕒 <b>Date :</b> ${escapeHtml(dateStr)} (Paris)`,
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin?tab=commercial">Accéder au suivi commercial</a>`,
  ];

  await sendTelegramMessage(lines.join("\n"), { parseMode: "HTML" });
}

