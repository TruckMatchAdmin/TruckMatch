import nodemailer, { type Transporter } from "nodemailer";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import {
  renderWelcomeDriverEmail,
  renderWelcomeCompanyEmail,
  renderPaymentCompanyEmail,
  renderPaymentDriverBoostEmail,
  renderNewSupportMessageEmail,
  renderCandidateApplicationEmail,
  renderCandidateApplicationReceiptEmail,
  EmailTrackingPayload,
} from "./templates";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Configuration du transporteur SMTP OVH officiel (jobs@truckmatch.fr)
const SMTP_HOST = process.env.SMTP_HOST || "ssl0.ovh.net";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== "false";
const SMTP_USER = process.env.SMTP_USER || "jobs@truckmatch.fr";
const SMTP_PASS = process.env.SMTP_PASS || "Gabin.02350";
const SMTP_FROM = process.env.SMTP_FROM || "TruckMatch <jobs@truckmatch.fr>";

let transporterInstance: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporterInstance;
}

/**
 * Encode un jeton de tracking sécurisé pour l'ouverture
 */
export function createTrackingToken(payload: EmailTrackingPayload): string {
  const jsonStr = JSON.stringify(payload);
  return Buffer.from(jsonStr, "utf8").toString("base64url");
}

/**
 * Décode un jeton de tracking
 */
export function decodeTrackingToken(token: string): EmailTrackingPayload | null {
  try {
    const jsonStr = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(jsonStr) as EmailTrackingPayload;
  } catch (err) {
    console.error("Erreur décodage tracking token:", err);
    return null;
  }
}

/**
 * Envoi générique d'un email avec enregistrement Supabase & tracking
 */
async function sendTrackedEmail({
  to,
  subject,
  html,
  emailType,
  recipientType,
  metadata = {},
}: {
  to: string;
  subject: string;
  html: string;
  emailType: EmailTrackingPayload["emailType"];
  recipientType: "driver" | "company" | "admin" | "other";
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const trackingId = `trk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const transporter = getTransporter();

    // Chemin du logo local pour attachement optionnel
    const logoPath = path.join(process.cwd(), "public", "images", "logo-email.png");
    const attachments: any[] = [];
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "truckmatch-logo.png",
        path: logoPath,
        cid: "truckmatch-logo", // Accessible via cid:truckmatch-logo si souhaité
      });
    }

    // 1. Enregistrement dans email_logs Supabase
    try {
      await supabaseAdmin.from("email_logs").insert({
        tracking_id: trackingId,
        recipient_email: to.toLowerCase().trim(),
        recipient_type: recipientType,
        email_type: emailType,
        subject,
        status: "sent",
        metadata: { ...metadata, smtp_user: SMTP_USER },
      });
    } catch (logErr) {
      console.warn("Erreur insertion email_logs (non bloquant):", logErr);
    }

    // 2. Envoi réel via OVH SMTP
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: to.trim(),
      subject,
      html,
      attachments,
      headers: {
        "X-Mailer": "TruckMatch Official Mailer",
        "X-Tracking-ID": trackingId,
      },
    });

    console.log(`[Mailer OVH] Email envoyé avec succès à ${to} [MessageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Mailer OVH] Échec d'envoi à ${to}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Envoi Email de Bienvenue Chauffeur
 */
export async function sendWelcomeDriverEmail({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}) {
  const trackingId = `drv_${Date.now()}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: email,
    emailType: "welcome_driver",
    subject: `Bienvenue sur TruckMatch, ${firstName} !`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderWelcomeDriverEmail({
    firstName,
    email,
    trackingToken,
  });

  return sendTrackedEmail({
    to: email,
    subject,
    html,
    emailType: "welcome_driver",
    recipientType: "driver",
    metadata: { firstName },
  });
}

/**
 * 2. Envoi Email de Bienvenue Entreprise
 */
export async function sendWelcomeCompanyEmail({
  email,
  companyName,
  contactName,
}: {
  email: string;
  companyName: string;
  contactName?: string;
}) {
  const trackingId = `cmp_${Date.now()}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: email,
    emailType: "welcome_company",
    subject: `Bienvenue sur TruckMatch, ${companyName} !`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderWelcomeCompanyEmail({
    companyName,
    contactName,
    email,
    trackingToken,
  });

  return sendTrackedEmail({
    to: email,
    subject,
    html,
    emailType: "welcome_company",
    recipientType: "company",
    metadata: { companyName, contactName },
  });
}

/**
 * 3. Envoi Email de Remerciement Paiement Abonnement ou Crédits Entreprise
 */
export async function sendPaymentCompanyEmail({
  email,
  companyName,
  orderNumber,
  productName,
  amountEur,
  paidAt = new Date().toLocaleDateString("fr-FR"),
  credits,
}: {
  email: string;
  companyName: string;
  orderNumber: string;
  productName: string;
  amountEur: number;
  paidAt?: string;
  credits?: number;
}) {
  const trackingId = `pay_cmp_${orderNumber}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: email,
    emailType: "payment_subscription",
    subject: `Confirmation de commande #${orderNumber} — ${productName}`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderPaymentCompanyEmail({
    companyName,
    email,
    orderNumber,
    productName,
    amountEur,
    paidAt,
    credits,
    trackingToken,
  });

  return sendTrackedEmail({
    to: email,
    subject,
    html,
    emailType: "payment_subscription",
    recipientType: "company",
    metadata: { companyName, orderNumber, amountEur, productName },
  });
}

/**
 * 4. Envoi Email de Remerciement Paiement Boost Visibilité Candidat 4,99 €
 */
export async function sendPaymentDriverBoostEmail({
  email,
  driverName,
  orderNumber,
  amountEur = 4.99,
  paidAt = new Date().toLocaleDateString("fr-FR"),
  expiresAt,
}: {
  email: string;
  driverName: string;
  orderNumber: string;
  amountEur?: number;
  paidAt?: string;
  expiresAt?: string;
}) {
  const finalExpiresAt = expiresAt || (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toLocaleDateString("fr-FR");
  })();

  const trackingId = `pay_drv_${orderNumber}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: email,
    emailType: "payment_driver_boost",
    subject: `Boost Visibilité Candidat Activé (4,99 €)`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderPaymentDriverBoostEmail({
    driverName,
    email,
    orderNumber,
    amountEur,
    paidAt,
    expiresAt: finalExpiresAt,
    trackingToken,
  });

  return sendTrackedEmail({
    to: email,
    subject,
    html,
    emailType: "payment_driver_boost",
    recipientType: "driver",
    metadata: { driverName, orderNumber, amountEur },
  });
}

/**
 * 5. Envoi Notification Email d'un nouveau message reçu pour le candidat
 */
export async function sendNewSupportMessageToDriverEmail({
  email,
  driverName,
  messagePreview,
  senderName = "L'équipe Support TruckMatch",
}: {
  email: string;
  driverName: string;
  messagePreview: string;
  senderName?: string;
}) {
  const trackingId = `msg_drv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: email,
    emailType: "support_message_notification",
    subject: `Nouveau message sur votre espace candidat TruckMatch`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderNewSupportMessageEmail({
    driverName,
    messagePreview,
    senderName,
    trackingToken,
  });

  return sendTrackedEmail({
    to: email,
    subject,
    html,
    emailType: "support_message_notification",
    recipientType: "driver",
    metadata: { driverName, messagePreviewSnippet: messagePreview.substring(0, 100) },
  });
}

/**
 * 6. Envoi de la candidature du chauffeur directement à l'entreprise / recruteur
 */
export async function sendCandidateApplicationEmail({
  to,
  companyName,
  jobTitle,
  candidateName,
  candidateEmail,
  candidatePhone,
  candidateCity,
  permits = [],
  fimo = false,
  fco = false,
  chronoCard = false,
  experience = "",
  message = "",
  resumeUrl,
  targetCompanyEmail,
}: {
  to: string;
  companyName: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateCity?: string;
  permits?: string[];
  fimo?: boolean;
  fco?: boolean;
  chronoCard?: boolean;
  experience?: string;
  message?: string;
  resumeUrl?: string;
  targetCompanyEmail?: string;
}) {
  const trackingId = `app_ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: to,
    emailType: "candidate_application",
    subject: `Candidature TruckMatch : ${candidateName} pour ${jobTitle}`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderCandidateApplicationEmail({
    companyName,
    jobTitle,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateCity,
    permits,
    fimo,
    fco,
    chronoCard,
    experience,
    message,
    resumeUrl,
    targetCompanyEmail,
    trackingToken,
  });

  return sendTrackedEmail({
    to,
    subject,
    html,
    emailType: "candidate_application",
    recipientType: "company",
    metadata: { companyName, jobTitle, candidateName, candidateEmail, candidatePhone },
  });
}

/**
 * 7. Envoi de l'accusé de réception au candidat
 */
export async function sendCandidateApplicationReceiptEmail({
  to,
  candidateName,
  jobTitle,
  companyName,
  destinationEmail,
}: {
  to: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  destinationEmail?: string;
}) {
  const trackingId = `app_drv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const trackingToken = createTrackingToken({
    trackingId,
    recipientEmail: to,
    emailType: "candidate_application_receipt",
    subject: `Candidature confirmée pour ${jobTitle}`,
    sentAt: new Date().toISOString(),
  });

  const { subject, html } = renderCandidateApplicationReceiptEmail({
    candidateName,
    jobTitle,
    companyName,
    destinationEmail,
    trackingToken,
  });

  return sendTrackedEmail({
    to,
    subject,
    html,
    emailType: "candidate_application_receipt",
    recipientType: "driver",
    metadata: { jobTitle, companyName, destinationEmail },
  });
}

/**
 * Vérifier la connexion SMTP
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { ok: true, message: "Connexion OVH SMTP valide et opérationnelle." };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}
