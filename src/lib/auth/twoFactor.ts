import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { formatParisDate } from "@/lib/telegram/notifier";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const SALT = process.env.SESSION_SECRET || "truckmatch_2fa_salt_2026";
const CODE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(`${code}:${SALT}`).digest("hex");
}

/**
 * Vérifie si l'adresse email administrateur est actuellement verrouillée
 */
export async function isLockedOut(email: string): Promise<{ locked: boolean; remainingMinutes?: number }> {
  try {
    const since = new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString();
    const { count, error } = await supabaseAdmin
      .from("admin_audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("admin_email", email.toLowerCase())
      .eq("event_type", "2fa_failed")
      .gte("created_at", since);

    if (error) return { locked: false };

    if ((count || 0) >= MAX_ATTEMPTS) {
      return { locked: true, remainingMinutes: 15 };
    }
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

/**
 * Génère un code cryptographique à 4 chiffres et l'expédie via Telegram
 */
export async function generateAndSend2FACode(
  email: string,
  ip?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string; remainingSeconds?: number }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Vérification du verrouillage anti-bruteforce
  const lockout = await isLockedOut(cleanEmail);
  if (lockout.locked) {
    return {
      success: false,
      error: `Trop de tentatives infructueuses. Accès temporairement verrouillé pour ${lockout.remainingMinutes} minutes.`,
    };
  }

  // 2. Invalidation des anciens codes non utilisés
  await supabaseAdmin
    .from("admin_2fa_codes")
    .update({ used: true })
    .eq("admin_email", cleanEmail)
    .eq("used", false);

  // 3. Génération cryptographiquement sécurisée d'un code à 4 chiffres (1000 à 9999)
  const codeInt = crypto.randomInt(1000, 10000);
  const codeStr = String(codeInt);
  const codeHash = hashCode(codeStr);
  const expiresAt = new Date(Date.now() + CODE_VALIDITY_MS).toISOString();

  // 4. Enregistrement sécurisé du hash en base
  const { error: insertError } = await supabaseAdmin.from("admin_2fa_codes").insert({
    admin_email: cleanEmail,
    code_hash: codeHash,
    attempts: 0,
    max_attempts: MAX_ATTEMPTS,
    used: false,
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error("[2FA] Erreur enregistrement code:", insertError.message);
    return { success: false, error: "Impossible de générer le code temporaire." };
  }

  // 5. Expédition instantanée du code via le bot Telegram officiel
  const tgMessage = [
    `🔐 <b>CODE DE VÉRIFICATION ADMIN TRUCKMATCH</b>`,
    ``,
    `Votre code temporaire à 4 chiffres :`,
    `👉 <pre style="font-size: 20px; font-weight: bold;">${codeStr}</pre>`,
    ``,
    `⏱️ <b>Durée de validité :</b> 5 minutes`,
    `🔒 <b>Usage unique</b> — Renouvellement tous les 12 heures`,
    `📍 <b>IP demandeur :</b> <code>${ip || "Non communiquée"}</code>`,
    `📅 <b>Heure :</b> ${formatParisDate()}`,
    ``,
    `<i>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</i>`,
  ].join("\n");

  const tgRes = await sendTelegramMessage(tgMessage, { parseMode: "HTML" });

  if (!tgRes.ok) {
    console.warn("[2FA] Avertissement: échec de délivrance Telegram:", tgRes.error);
    // En développement/test, si Telegram n'est pas joignable, on signale l'erreur
    return {
      success: false,
      error: "Erreur d'envoi du code sur Telegram. Vérifiez la configuration du bot.",
    };
  }

  // 6. Journalisation dans admin_audit_logs
  await supabaseAdmin.from("admin_audit_logs").insert({
    event_type: "login_step1",
    admin_email: cleanEmail,
    ip_address: ip || null,
    user_agent: userAgent || null,
    details: { expires_at: expiresAt },
  });

  return { success: true };
}

/**
 * Valide un code 2FA saisi par l'administrateur
 */
export async function verify2FACode(
  email: string,
  code: string,
  ip?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = String(code).trim();

  if (!/^\d{4}$/.test(cleanCode)) {
    return { success: false, error: "Le code doit comporter exactement 4 chiffres." };
  }

  // 1. Vérification du verrouillage
  const lockout = await isLockedOut(cleanEmail);
  if (lockout.locked) {
    return {
      success: false,
      error: "Accès temporairement verrouillé suite à trop de tentatives erronées.",
    };
  }

  // 2. Recherche du dernier code actif
  const { data: record, error } = await supabaseAdmin
    .from("admin_2fa_codes")
    .select("*")
    .eq("admin_email", cleanEmail)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !record) {
    return { success: false, error: "Aucun code actif. Veuillez demander un nouveau code." };
  }

  // 3. Vérification de l'expiration
  const now = new Date();
  const expiresAt = new Date(record.expires_at);
  if (now > expiresAt) {
    await supabaseAdmin.from("admin_2fa_codes").update({ used: true }).eq("id", record.id);
    return { success: false, error: "Ce code a expiré. Veuillez en générer un nouveau." };
  }

  // 4. Incrémenter les tentatives
  const newAttempts = (record.attempts || 0) + 1;
  await supabaseAdmin
    .from("admin_2fa_codes")
    .update({ attempts: newAttempts })
    .eq("id", record.id);

  // 5. Comparaison cryptographique à temps constant
  const inputHash = hashCode(cleanCode);
  const isMatch = crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(record.code_hash));

  if (!isMatch) {
    // Journalisation de l'échec
    await supabaseAdmin.from("admin_audit_logs").insert({
      event_type: "2fa_failed",
      admin_email: cleanEmail,
      ip_address: ip || null,
      user_agent: userAgent || null,
      details: { attempt: newAttempts, max: record.max_attempts },
    });

    const remaining = Math.max(0, record.max_attempts - newAttempts);
    if (remaining === 0) {
      await supabaseAdmin.from("admin_2fa_codes").update({ used: true }).eq("id", record.id);
      // Alerte Telegram en cas de verrouillage
      await sendTelegramMessage(
        `🚨 <b>ALERTE BRUTEFORCE — ADMIN VERROUILLÉ</b>\n` +
          `5 tentatives 2FA erronées détectées pour <code>${cleanEmail}</code>.\n` +
          `IP : <code>${ip || "Inconnue"}</code>\n` +
          `Accès verrouillé 15 minutes.`,
        { parseMode: "HTML" }
      );
      return { success: false, error: "Nombre maximum de tentatives atteint. Accès verrouillé 15 minutes." };
    }

    return {
      success: false,
      error: `Code incorrect. Il vous reste ${remaining} tentative(s).`,
    };
  }

  // 6. Succès : marquer comme utilisé
  await supabaseAdmin.from("admin_2fa_codes").update({ used: true }).eq("id", record.id);

  // Journalisation du succès
  await supabaseAdmin.from("admin_audit_logs").insert({
    event_type: "2fa_success",
    admin_email: cleanEmail,
    ip_address: ip || null,
    user_agent: userAgent || null,
    details: { validated_at: new Date().toISOString() },
  });

  // Notification d'accès réussi sur Telegram
  await sendTelegramMessage(
    `🛡️ <b>CONNEXION ADMIN VALIDÉE</b>\n` +
      `Authentification à deux facteurs réussie pour <b>${cleanEmail}</b>.\n` +
      `⏱️ <b>Validité de session :</b> 12 heures renouvelables.\n` +
      `📍 <b>IP :</b> <code>${ip || "Non communiquée"}</code>`,
    { parseMode: "HTML" }
  );

  return { success: true };
}
