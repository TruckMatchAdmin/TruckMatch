/**
 * Module centralisé Telegram Bot pour TruckMatch
 * - Expédition sécurisée de messages vers l'administrateur unique (ID: 8376439336)
 * - Validation stricte des secrets et requêtes
 * - Formatage et gestion des erreurs
 */

interface SendTelegramOptions {
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disablePreview?: boolean;
  replyMarkup?: any;
}

export async function sendTelegramMessage(
  text: string,
  options: SendTelegramOptions = {}
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] Variables TELEGRAM_BOT_TOKEN ou TELEGRAM_ADMIN_CHAT_ID manquantes.");
    return { ok: false, error: "Configuration Telegram incomplète" };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const payload: Record<string, any> = {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode || "HTML",
    disable_web_page_preview: options.disablePreview ?? true,
  };

  if (options.replyMarkup) {
    payload.reply_markup = options.replyMarkup;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error("[Telegram] Erreur API sendMessage:", data.description || res.statusText);
      return { ok: false, error: data.description || "Erreur Telegram" };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    console.error("[Telegram] Échec réseau sendMessage:", err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Envoie un message directement à un chatId spécifique (utilisé pour les réponses du webhook)
 */
export async function sendTelegramDirect(
  chatId: string | number,
  text: string,
  options: SendTelegramOptions = {}
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "Token bot manquant" };

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parseMode || "HTML",
        disable_web_page_preview: options.disablePreview ?? true,
        reply_markup: options.replyMarkup,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.description || "Erreur Telegram" };
    }
    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Configure le webhook officiel auprès de l'API Telegram
 */
export async function setupTelegramWebhook(
  webhookUrl: string,
  secretToken: string
): Promise<{ ok: boolean; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: "Token bot manquant" };

  const url = `https://api.telegram.org/bot${token}/setWebhook`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: false,
      }),
    });

    const data = await res.json();
    return { ok: Boolean(data.ok), description: data.description };
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
}
