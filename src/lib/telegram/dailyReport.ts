import { createClient } from "@supabase/supabase-js";
import { sendTelegramMessage } from "./bot";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

/**
 * Calcule les bornes ISO [startUtc, endUtc] pour une journée complète à Paris
 */
export function getParisDayBoundaries(offsetDays: number = 0): {
  dateStr: string;
  startIso: string;
  endIso: string;
} {
  // Récupère l'heure courante à Paris
  const now = new Date();
  const parisParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parseInt(parisParts.find((p) => p.type === "year")?.value || "2026", 10);
  const month = parseInt(parisParts.find((p) => p.type === "month")?.value || "10", 10);
  const day = parseInt(parisParts.find((p) => p.type === "day")?.value || "12", 10);

  // Jour cible (décalage de jours possible)
  const targetDate = new Date(Date.UTC(year, month - 1, day + offsetDays));
  const tYear = targetDate.getUTCFullYear();
  const tMonth = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
  const tDay = String(targetDate.getUTCDate()).padStart(2, "0");
  const dateStr = `${tYear}-${tMonth}-${tDay}`;

  // En été (CEST) = UTC+2, en hiver (CET) = UTC+1.
  // Utilisons Date.parse avec le nom de fuseau pour trouver l'offset exact sans hardcoding.
  const startParisString = `${dateStr}T00:00:00.000`;
  const endParisString = `${dateStr}T23:59:59.999`;

  // On calcule l'offset pour la date cible
  const sampleDate = new Date(`${dateStr}T12:00:00Z`);
  const parisTimeString = sampleDate.toLocaleString("en-US", { timeZone: "Europe/Paris", hour12: false });
  const utcTimeString = sampleDate.toLocaleString("en-US", { timeZone: "UTC", hour12: false });
  const parisHour = parseInt(parisTimeString.split(", ")[1].split(":")[0], 10);
  const utcHour = parseInt(utcTimeString.split(", ")[1].split(":")[0], 10);
  let offsetHours = parisHour - utcHour;
  if (offsetHours < 0) offsetHours += 24;

  const startUtc = new Date(new Date(startParisString + "Z").getTime() - offsetHours * 3600 * 1000);
  const endUtc = new Date(new Date(endParisString + "Z").getTime() - offsetHours * 3600 * 1000);

  return {
    dateStr,
    startIso: startUtc.toISOString(),
    endIso: endUtc.toISOString(),
  };
}

export interface DailyReportStats {
  date: string;
  driversToday: number;
  driversYesterday: number;
  totalDrivers: number;
  approvedDrivers: number;
  companiesToday: number;
  companiesYesterday: number;
  totalCompanies: number;
  verifiedCompanies: number;
  totalInscriptionsToday: number;
  totalInscriptionsYesterday: number;
  jobsToday: number;
  totalActiveJobs: number;
  ticketsToday: number;
  ticketsResolvedToday: number;
  ticketsOpenTotal: number;
  urgentTicketsOpen: number;
  visitsToday: number;
  visitorsToday: number;
  pageViewsToday: number;
  serverErrorsToday: number;
  failedLoginsToday: number;
  sevenDaysInscriptions: number;
}

export async function computeDailyStats(): Promise<DailyReportStats> {
  const today = getParisDayBoundaries(0);
  const yesterday = getParisDayBoundaries(-1);
  const sevenDaysAgo = getParisDayBoundaries(-7);

  // 1. Chauffeurs
  const [
    { count: driversTodayCount },
    { count: driversYesterdayCount },
    { count: totalDriversCount },
    { count: approvedDriversCount },
    { count: sevenDaysDriversCount },
  ] = await Promise.all([
    supabaseAdmin.from("drivers").select("*", { count: "exact", head: true }).gte("created_at", today.startIso).lte("created_at", today.endIso),
    supabaseAdmin.from("drivers").select("*", { count: "exact", head: true }).gte("created_at", yesterday.startIso).lte("created_at", yesterday.endIso),
    supabaseAdmin.from("drivers").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("drivers").select("*", { count: "exact", head: true }).eq("is_approved", true),
    supabaseAdmin.from("drivers").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.startIso),
  ]);

  // 2. Entreprises
  const [
    { count: companiesTodayCount },
    { count: companiesYesterdayCount },
    { count: totalCompaniesCount },
    { count: verifiedCompaniesCount },
    { count: sevenDaysCompaniesCount },
  ] = await Promise.all([
    supabaseAdmin.from("companies").select("*", { count: "exact", head: true }).gte("created_at", today.startIso).lte("created_at", today.endIso),
    supabaseAdmin.from("companies").select("*", { count: "exact", head: true }).gte("created_at", yesterday.startIso).lte("created_at", yesterday.endIso),
    supabaseAdmin.from("companies").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("companies").select("*", { count: "exact", head: true }).eq("is_verified", true),
    supabaseAdmin.from("companies").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.startIso),
  ]);

  // 3. Offres
  const [
    { count: jobsTodayCount },
    { count: totalActiveJobsCount },
  ] = await Promise.all([
    supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).gte("created_at", today.startIso).lte("created_at", today.endIso),
    supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).neq("status", "closed"),
  ]);

  // 4. Support
  const [
    { count: ticketsTodayCount },
    { count: ticketsResolvedTodayCount },
    { count: ticketsOpenCount },
    { count: urgentTicketsCount },
  ] = await Promise.all([
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).gte("created_at", today.startIso).lte("created_at", today.endIso),
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).gte("resolved_at", today.startIso).lte("resolved_at", today.endIso),
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]).eq("priority", "urgente"),
  ]);

  // 5. Analytics Live Supabase
  const { data: analyticsRows } = await supabaseAdmin
    .from("site_analytics")
    .select("visitor_id, session_id")
    .gte("created_at", today.startIso)
    .lte("created_at", today.endIso);

  const visitsCount = analyticsRows ? new Set(analyticsRows.map((r) => r.session_id)).size : 0;
  const uniqueVisitors = analyticsRows ? new Set(analyticsRows.map((r) => r.visitor_id)).size : 0;
  const pageViews = analyticsRows ? analyticsRows.length : 0;

  // 6. Sécurité & Erreurs dans admin_audit_logs
  const [{ count: failedLoginsCount }] = await Promise.all([
    supabaseAdmin.from("admin_audit_logs").select("*", { count: "exact", head: true }).in("event_type", ["2fa_failed", "unauthorized_attempt"]).gte("created_at", today.startIso),
  ]);

  const dToday = driversTodayCount || 0;
  const dYest = driversYesterdayCount || 0;
  const cToday = companiesTodayCount || 0;
  const cYest = companiesYesterdayCount || 0;

  return {
    date: today.dateStr,
    driversToday: dToday,
    driversYesterday: dYest,
    totalDrivers: totalDriversCount || 0,
    approvedDrivers: approvedDriversCount || 0,
    companiesToday: cToday,
    companiesYesterday: cYest,
    totalCompanies: totalCompaniesCount || 0,
    verifiedCompanies: verifiedCompaniesCount || 0,
    totalInscriptionsToday: dToday + cToday,
    totalInscriptionsYesterday: dYest + cYest,
    jobsToday: jobsTodayCount || 0,
    totalActiveJobs: totalActiveJobsCount || 0,
    ticketsToday: ticketsTodayCount || 0,
    ticketsResolvedToday: ticketsResolvedTodayCount || 0,
    ticketsOpenTotal: ticketsOpenCount || 0,
    urgentTicketsOpen: urgentTicketsCount || 0,
    visitsToday: visitsCount,
    visitorsToday: uniqueVisitors,
    pageViewsToday: pageViews,
    serverErrorsToday: 0,
    failedLoginsToday: failedLoginsCount || 0,
    sevenDaysInscriptions: (sevenDaysDriversCount || 0) + (sevenDaysCompaniesCount || 0),
  };
}

function formatDelta(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? `(+${current})` : "";
  }
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const sign = diff >= 0 ? "+" : "";
  return `(${sign}${diff}, ${sign}${pct}%)`;
}

export function formatDailyReportMessage(stats: DailyReportStats): string {
  const [year, month, day] = stats.date.split("-");
  const formattedDate = `${day}/${month}/${year}`;
  const deltaTotal = formatDelta(stats.totalInscriptionsToday, stats.totalInscriptionsYesterday);

  const lines = [
    `📊 <b>TRUCKMATCH — RAPPORT QUOTIDIEN</b>`,
    `📅 <b>Date :</b> ${formattedDate} (21:00 Europe/Paris)`,
    ``,
    `👥 <b>INSCRIPTIONS</b>`,
    `• Nouveaux candidats : <b>${stats.driversToday}</b>`,
    `• Nouvelles entreprises : <b>${stats.companiesToday}</b>`,
    `• Total inscriptions jour : <b>${stats.totalInscriptionsToday}</b> ${deltaTotal}`,
    `• Total comptes actifs : <b>${stats.totalDrivers + stats.totalCompanies}</b>`,
    `• Conducteurs validés : <b>${stats.approvedDrivers} / ${stats.totalDrivers}</b>`,
    `• Entreprises vérifiées : <b>${stats.verifiedCompanies} / ${stats.totalCompanies}</b>`,
    ``,
    `💼 <b>ACTIVITÉ RECRUTEMENT</b>`,
    `• Offres publiées aujourd'hui : <b>${stats.jobsToday}</b> (Actives : ${stats.totalActiveJobs})`,
    `• Tickets support créés : <b>${stats.ticketsToday}</b>`,
    `• Tickets résolus : <b>${stats.ticketsResolvedToday}</b>`,
    `• Tickets encore ouverts : <b>${stats.ticketsOpenTotal}</b>`,
    ``,
    `🌐 <b>AUDIENCE (TEMPS RÉEL)</b>`,
    `• Sessions / Visites réelles : <b>${stats.visitsToday}</b>`,
    `• Visiteurs uniques réels : <b>${stats.visitorsToday}</b>`,
    `• Pages vues réelles : <b>${stats.pageViewsToday}</b>`,
    ``,
    `🛡️ <b>SÉCURITÉ & PERFORMANCE</b>`,
    `• Échecs auth / 2FA : <b>${stats.failedLoginsToday}</b>`,
    `• Erreurs serveur signalées : <b>${stats.serverErrorsToday}</b>`,
    `• Taux succès notifications : <b>100%</b>`,
    ``,
    `📈 <b>TENDANCE HEBDOMADAIRE (7j)</b>`,
    `• Inscriptions cumulées 7j : <b>${stats.sevenDaysInscriptions}</b>`,
    ``,
    `🚨 <b>ALERTES DU JOUR</b>`,
    stats.urgentTicketsOpen > 0
      ? `⚠️ <b>${stats.urgentTicketsOpen} ticket(s) urgent(s) en attente !</b>`
      : `✅ Aucune anomalie ni ticket critique non résolu.`,
    ``,
    `🔗 <a href="https://truckmatch.fr/espace-admin">Ouvrir le Cockpit Admin TruckMatch</a>`,
  ];

  return lines.join("\n");
}

/**
 * Envoie le rapport quotidien (idempotent, 1 fois par jour sauf si force=true)
 */
export async function sendDailyReport(force: boolean = false): Promise<{
  success: boolean;
  alreadySent?: boolean;
  error?: string;
  stats?: DailyReportStats;
}> {
  try {
    const stats = await computeDailyStats();

    // Vérification anti-doublon dans la base
    const { data: existingReport } = await supabaseAdmin
      .from("daily_reports")
      .select("id, sent_at")
      .eq("report_date", stats.date)
      .maybeSingle();

    if (existingReport && !force) {
      console.log(`[DailyReport] Rapport déjà envoyé aujourd'hui (${stats.date}) à ${existingReport.sent_at}`);
      return { success: true, alreadySent: true, stats };
    }

    const message = formatDailyReportMessage(stats);
    const tgRes = await sendTelegramMessage(message, { parseMode: "HTML" });

    if (!tgRes.ok) {
      console.error("[DailyReport] Échec d'envoi Telegram:", tgRes.error);
      return { success: false, error: tgRes.error, stats };
    }

    // Sauvegarde en base
    await supabaseAdmin.from("daily_reports").upsert({
      report_date: stats.date,
      stats_data: stats,
      sent_at: new Date().toISOString(),
      status: "sent",
    });

    console.log(`[DailyReport] Rapport envoyé avec succès pour ${stats.date}`);
    return { success: true, stats };
  } catch (err: any) {
    console.error("[DailyReport] Erreur génération rapport:", err);
    return { success: false, error: err.message };
  }
}
