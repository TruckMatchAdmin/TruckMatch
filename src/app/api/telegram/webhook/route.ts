import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramDirect } from "@/lib/telegram/bot";
import { computeDailyStats, formatDailyReportMessage, sendDailyReport, getParisDayBoundaries } from "@/lib/telegram/dailyReport";
import { formatParisDate } from "@/lib/telegram/notifier";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const AUTHORIZED_TELEGRAM_ID = "8376439336";

function escapeHtml(str: string = ""): string {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  try {
    // 1. Vérification optionnelle du jeton secret Telegram Webhook
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (expectedSecret && headerSecret && headerSecret !== expectedSecret) {
      console.warn("[Telegram Webhook] Rejet: secret token invalide.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await request.json();
    const message = update?.message || update?.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true }); // Accusé de réception standard Telegram
    }

    const fromId = String(message.from?.id || "");
    const chatId = message.chat?.id;
    const text = (message.text || "").trim();
    const command = text.split(" ")[0].toLowerCase();

    // 2. CONTRÔLE D'ACCÈS NUMÉRIQUE STRICT : SEUL 8376439336 EST AUTORISÉ
    if (fromId !== AUTHORIZED_TELEGRAM_ID) {
      console.warn(`[Telegram Security] Tentative non autorisée de l'ID Telegram: ${fromId}`);

      // Journalisation dans admin_audit_logs
      await supabaseAdmin.from("admin_audit_logs").insert({
        event_type: "unauthorized_attempt",
        telegram_id: fromId,
        details: {
          username: message.from?.username || null,
          command: command.slice(0, 30),
          action: "Rejet accès bot admin",
        },
      });

      // Réponse de refus ferme sans divulgation
      if (chatId) {
        await sendTelegramDirect(
          chatId,
          `⛔ <b>ACCÈS REFUSÉ</b>\nVotre identifiant Telegram (<code>${fromId}</code>) n'est pas autorisé à administrer TruckMatch.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // 3. GESTION DES COMMANDES ADMINISTRATEUR
    // ==========================================

    // Commande : /start
    if (command === "/start") {
      const welcome = [
        `🚛 <b>TRUCKMATCH — BOT DE MONITORING &amp; ADMINISTRATION</b>`,
        ``,
        `Bonjour Administrateur,`,
        `Votre identifiant numérique (<code>${fromId}</code>) est <b>vérifié et reconnu</b>.`,
        ``,
        `Ce bot est connecté en temps réel à la base Supabase et aux services de production de TruckMatch.`,
        ``,
        `Tapez /help pour afficher la liste complète des commandes d'audit et de pilotage.`,
      ].join("\n");
      await sendTelegramDirect(chatId, welcome);
      return NextResponse.json({ ok: true });
    }

    // Commande : /help
    if (command === "/help") {
      const help = [
        `📋 <b>COMMANDES DISPONIBLES — COCKPIT TRUCKMATCH</b>`,
        ``,
        `📊 <b>Statistiques &amp; Rapports :</b>`,
        `• /stats — Bilan d'activité complet du jour (Europe/Paris)`,
        `• /stats7 — Synthèse des 7 derniers jours`,
        `• /report — Générer le rapport quotidien à 21h à la demande`,
        ``,
        `👥 <b>Recrutement &amp; Modération :</b>`,
        `• /inscriptions — Dernières inscriptions (chauffeurs &amp; transporteurs)`,
        `• /support — Liste des tickets d'assistance et demandes de contact`,
        ``,
        `🛡️ <b>Observabilité &amp; Système :</b>`,
        `• /alertes — Alertes actives, tickets urgents et anomalies`,
        `• /system — Santé des services (Supabase, API, PM2, Mémoire)`,
        `• /maintenance — État du site et du mode maintenance`,
      ].join("\n");
      await sendTelegramDirect(chatId, help);
      return NextResponse.json({ ok: true });
    }

    // Commande : /stats
    if (command === "/stats") {
      const stats = await computeDailyStats();
      const resMsg = [
        `📊 <b>BILAN EN DIRECT DU JOUR (${stats.date})</b>`,
        ``,
        `👥 <b>Inscriptions :</b>`,
        `• Conducteurs inscrits aujourd'hui : <b>${stats.driversToday}</b>`,
        `• Entreprises inscrites aujourd'hui : <b>${stats.companiesToday}</b>`,
        `• Total inscrits jour : <b>${stats.totalInscriptionsToday}</b>`,
        ``,
        `💼 <b>Activité :</b>`,
        `• Offres d'emploi déposées aujourd'hui : <b>${stats.jobsToday}</b> (Actives : ${stats.totalActiveJobs})`,
        `• Tickets support aujourd'hui : <b>${stats.ticketsToday}</b> (Ouverts : ${stats.ticketsOpenTotal})`,
        ``,
        `🌐 <b>Fréquentation Réelle :</b>`,
        `• Visites / Sessions : <b>${stats.visitsToday}</b>`,
        `• Visiteurs uniques : <b>${stats.visitorsToday}</b>`,
        `• Pages vues : <b>${stats.pageViewsToday}</b>`,
        ``,
        `🔗 <a href="https://truckmatch.fr/espace-admin">Ouvrir le Cockpit Admin</a>`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande : /stats7
    if (command === "/stats7") {
      const sevenDaysAgo = getParisDayBoundaries(-7);
      const [
        { count: drivers7 },
        { count: companies7 },
        { count: jobs7 },
        { data: analytics7 },
      ] = await Promise.all([
        supabaseAdmin.from("drivers").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.startIso),
        supabaseAdmin.from("companies").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.startIso),
        supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.startIso),
        supabaseAdmin.from("site_analytics").select("visitor_id, session_id").gte("created_at", sevenDaysAgo.startIso),
      ]);

      const totalInscriptions7 = (drivers7 || 0) + (companies7 || 0);
      const visits7 = analytics7 ? new Set(analytics7.map((r) => r.session_id)).size : 0;
      const visitors7 = analytics7 ? new Set(analytics7.map((r) => r.visitor_id)).size : 0;
      const pageViews7 = analytics7?.length || 0;

      const resMsg = [
        `📈 <b>SYNTHÈSE DES 7 DERNIERS JOURS</b>`,
        `Période : Du ${sevenDaysAgo.dateStr} à aujourd'hui`,
        ``,
        `👥 <b>Inscriptions :</b>`,
        `• Candidats chauffeurs : <b>${drivers7 || 0}</b>`,
        `• Entreprises transport : <b>${companies7 || 0}</b>`,
        `• Total nouveaux comptes : <b>${totalInscriptions7}</b>`,
        ``,
        `💼 <b>Recrutement :</b>`,
        `• Nouvelles offres créées : <b>${jobs7 || 0}</b>`,
        ``,
        `🌐 <b>Audience Globale :</b>`,
        `• Sessions réelles : <b>${visits7}</b>`,
        `• Visiteurs uniques : <b>${visitors7}</b>`,
        `• Pages vues réelles : <b>${pageViews7}</b>`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande : /inscriptions
    if (command === "/inscriptions") {
      const [{ data: drivers }, { data: companies }] = await Promise.all([
        supabaseAdmin.from("drivers").select("id, first_name, last_name, postal_code, city, permits, created_at, is_approved").order("created_at", { ascending: false }).limit(3),
        supabaseAdmin.from("companies").select("id, company_name, postal_code, city, fleet_size, created_at, is_verified").order("created_at", { ascending: false }).limit(3),
      ]);

      const driverLines = (drivers || []).map((d) => {
        const name = `${d.first_name} ${d.last_name?.charAt(0) || ""}.`;
        const loc = [d.postal_code, d.city].filter(Boolean).join(" ");
        const status = d.is_approved ? "✅ Validé" : "⏳ En attente";
        const permits = (d.permits || []).join(", ") || "N/A";
        return `• 🧑 ${escapeHtml(name)} (${escapeHtml(loc)}) — Permis [${escapeHtml(permits)}] — ${status}`;
      });

      const companyLines = (companies || []).map((c) => {
        const loc = [c.postal_code, c.city].filter(Boolean).join(" ");
        const status = c.is_verified ? "✅ Vérifiée" : "⏳ En attente";
        return `• 🏢 <b>${escapeHtml(c.company_name)}</b> (${escapeHtml(loc)}) — Flotte : ${escapeHtml(c.fleet_size || "1-5")} — ${status}`;
      });

      const resMsg = [
        `👥 <b>DERNIÈRES INSCRIPTIONS SUR TRUCKMATCH</b>`,
        ``,
        `<b>Derniers Chauffeurs :</b>`,
        driverLines.length ? driverLines.join("\n") : "<i>Aucun inscrit récent</i>",
        ``,
        `<b>Dernières Entreprises :</b>`,
        companyLines.length ? companyLines.join("\n") : "<i>Aucune inscrite récente</i>",
        ``,
        `🔗 <a href="https://truckmatch.fr/espace-admin">Gérer les validations</a>`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande : /support
    if (command === "/support") {
      const { data: openTickets } = await supabaseAdmin
        .from("support_tickets")
        .select("*")
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (!openTickets || openTickets.length === 0) {
        await sendTelegramDirect(chatId, `✅ <b>AUCUN TICKET SUPPORT EN ATTENTE</b>\nTous les tickets d'assistance et demandes de contact ont été traités.`);
        return NextResponse.json({ ok: true });
      }

      const ticketLines = openTickets.map((t) => {
        const pBadge = t.priority === "urgente" ? "🔴 URGENT" : "🟡 Normal";
        return `• <code>${escapeHtml(t.ticket_number)}</code> [${pBadge}] : <b>${escapeHtml(t.subject)}</b>\n  <i>De : ${escapeHtml(t.name)} (${escapeHtml(t.user_type)})</i>`;
      });

      const resMsg = [
        `🆘 <b>TICKETS SUPPORT OUVERTS (${openTickets.length})</b>`,
        ``,
        ticketLines.join("\n\n"),
        ``,
        `🔗 <a href="https://truckmatch.fr/espace-admin?tab=support">Traiter les tickets dans l'Admin</a>`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande : /alertes
    if (command === "/alertes") {
      const [{ count: urgentCount }, { data: recentSuspicious }] = await Promise.all([
        supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]).eq("priority", "urgente"),
        supabaseAdmin.from("admin_audit_logs").select("*").in("event_type", ["2fa_failed", "unauthorized_attempt"]).order("created_at", { ascending: false }).limit(3),
      ]);

      const resMsg = [
        `🚨 <b>CENTRE D'ALERTES EN DIRECT</b>`,
        ``,
        `• Tickets urgents en attente : <b>${urgentCount || 0}</b>`,
        urgentCount && urgentCount > 0 ? `  👉 <i>Consultez immédiatement le support avec /support</i>` : `  ✅ Aucun ticket d'assistance critique`,
        ``,
        `• Sécurité &amp; Intrusions :`,
        recentSuspicious && recentSuspicious.length
          ? recentSuspicious.map((s) => `  ⚠️ ${s.event_type} (${s.ip_address || "IP inconnue"}) à ${formatParisDate(new Date(s.created_at))}`).join("\n")
          : `  ✅ Aucune tentative suspecte récente`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande : /system
    if (command === "/system") {
      const dbStart = Date.now();
      const { error: dbError } = await supabaseAdmin.from("site_analytics").select("id").limit(1);
      const dbLatency = Date.now() - dbStart;

      const memoryUsage = process.memoryUsage();
      const rssMb = Math.round(memoryUsage.rss / 1024 / 1024);
      const uptimeSec = Math.round(process.uptime());
      const uptimeHours = Math.floor(uptimeSec / 3600);
      const uptimeMin = Math.floor((uptimeSec % 3600) / 60);

      const resMsg = [
        `⚙️ <b>ÉTAT SYSTÈME &amp; INFRASTRUCTURE</b>`,
        ``,
        `• <b>Base Supabase :</b> ${dbError ? "❌ ERREUR (" + dbError.message + ")" : `✅ OPÉRATIONNELLE (${dbLatency} ms)`}`,
        `• <b>Serveur Web :</b> Next.js 15 (Production PM2)`,
        `• <b>Serveur VPS :</b> Ubuntu 152.228.137.4`,
        `• <b>Mémoire vive (RSS) :</b> ${rssMb} Mo`,
        `• <b>Temps de fonctionnement :</b> ${uptimeHours}h ${uptimeMin}m`,
        `• <b>Heure Serveur (Paris) :</b> ${formatParisDate()}`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande : /report
    if (command === "/report") {
      await sendTelegramDirect(chatId, `⏳ <i>Génération du rapport quotidien à la demande en cours...</i>`);
      const reportRes = await sendDailyReport(true); // force=true pour commande manuelle
      if (!reportRes.success) {
        await sendTelegramDirect(chatId, `❌ Erreur génération rapport : ${reportRes.error}`);
      }
      return NextResponse.json({ ok: true });
    }

    // Commande : /maintenance
    if (command === "/maintenance") {
      const resMsg = [
        `🔧 <b>ÉTAT DU MODE MAINTENANCE</b>`,
        ``,
        `• <b>Statut :</b> 🟢 Désactivé (Plateforme 100% active et accessible)`,
        `• <b>URL Publique :</b> https://truckmatch.fr`,
        `• <b>Espace Administrateur :</b> https://truckmatch.fr/espace-admin`,
      ].join("\n");
      await sendTelegramDirect(chatId, resMsg);
      return NextResponse.json({ ok: true });
    }

    // Commande inconnue
    await sendTelegramDirect(
      chatId,
      `❓ Commande non reconnue : <code>${escapeHtml(command)}</code>\nTapez /help pour afficher les commandes valides.`
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Webhook] Erreur:", err);
    return NextResponse.json({ ok: true }); // Toujours retourner 200 à Telegram pour éviter les boucles de retry
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook endpoint active" });
}
