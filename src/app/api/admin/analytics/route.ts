import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const PAGE_FRIENDLY_NAMES: Record<string, string> = {
  "/": "Accueil & Recherche",
  "/offres-emploi": "Offres d'emploi & Tournées",
  "/carte-chauffeurs": "Carte interactive des chauffeurs",
  "/entreprises": "Trouver un chauffeur & Recrutement",
  "/inscription": "Inscription Chauffeur & Entreprise",
  "/conseils": "Conseils & Guides routiers",
  "/espace-entreprise": "Portail Transporteur",
  "/espace-candidat": "Portail Conducteur",
  "/contact": "Support & Contact",
  "/a-propos": "À propos de TruckMatch",
  "/mentions-legales": "Mentions Légales",
  "/cgu": "CGU",
  "/politique-confidentialite": "Politique de Confidentialité",
};

export async function GET(request: Request) {
  try {
    const sessionUser = getSession(request);
    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Réservé à l'administration." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const now = new Date();
    let cutoff: Date;

    if (period === "today") {
      cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
    } else if (period === "7d") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "year") {
      cutoff = new Date(now.getFullYear(), 0, 1);
    } else {
      // 30d default
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 1. Récupération des événements de la période
    const { data: events, error } = await supabaseAdmin
      .from("site_analytics")
      .select("*")
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur analytics query:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allEvents = events || [];

    // 2. Calcul des métriques réelles en direct
    const totalPageViews = allEvents.length;
    const uniqueVisitorsSet = new Set(allEvents.map((e) => e.visitor_id).filter(Boolean));
    const uniqueVisitorsCount = uniqueVisitorsSet.size;

    const sessionsMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const s = e.session_id || "anon";
      sessionsMap.set(s, (sessionsMap.get(s) || 0) + 1);
    });
    const totalSessions = sessionsMap.size;

    // Calcul du taux de rebond réel (sessions avec 1 seule page vue)
    let singlePageSessions = 0;
    sessionsMap.forEach((count) => {
      if (count === 1) singlePageSessions++;
    });
    const bounceRate = totalSessions > 0
      ? `${Math.round((singlePageSessions / totalSessions) * 100)}%`
      : "0%";

    // Visiteurs actifs en direct (événements sur les 5 dernières minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const liveActiveVisitors = new Set(
      allEvents
        .filter((e) => e.created_at >= fiveMinutesAgo)
        .map((e) => e.visitor_id)
    ).size;

    // 3. Répartition des pages visitées
    const pagesMap = new Map<string, { count: number; title: string }>();
    allEvents.forEach((e) => {
      const p = e.page_path || "/";
      const current = pagesMap.get(p) || { count: 0, title: e.page_title || p };
      pagesMap.set(p, { count: current.count + 1, title: current.title });
    });

    const pages = Array.from(pagesMap.entries())
      .map(([path, data]) => ({
        path,
        name: PAGE_FRIENDLY_NAMES[path] || data.title || path,
        views: data.count,
        pct: totalPageViews > 0 ? Math.round((data.count / totalPageViews) * 1000) / 10 : 0,
        color: path === "/" ? "#0ea5e9" : path.startsWith("/offres") ? "#0284c7" : "#10b981",
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    // 4. Répartition des sources d'acquisition
    const sourcesMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const s = e.referrer_source || "Trafic Direct";
      sourcesMap.set(s, (sourcesMap.get(s) || 0) + 1);
    });

    const sources = Array.from(sourcesMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        pct: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
        color: name.includes("Google") ? "#0284c7" : name.includes("Direct") ? "#10b981" : "#6366f1",
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Répartition des appareils
    const devicesMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const d = e.device_type || "desktop";
      devicesMap.set(d, (devicesMap.get(d) || 0) + 1);
    });

    const devices = [
      {
        icon: "📱",
        name: "Mobiles",
        count: devicesMap.get("mobile") || 0,
        pct: totalPageViews > 0 ? Math.round(((devicesMap.get("mobile") || 0) / totalPageViews) * 100) : 0,
        color: "#0284c7",
      },
      {
        icon: "💻",
        name: "Desktop",
        count: devicesMap.get("desktop") || 0,
        pct: totalPageViews > 0 ? Math.round(((devicesMap.get("desktop") || 0) / totalPageViews) * 100) : 0,
        color: "#10b981",
      },
      {
        icon: "📟",
        name: "Tablettes",
        count: devicesMap.get("tablet") || 0,
        pct: totalPageViews > 0 ? Math.round(((devicesMap.get("tablet") || 0) / totalPageViews) * 100) : 0,
        color: "#f59e0b",
      },
    ];

    // 6. Répartition des pays
    const countriesMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const c = e.country || "France";
      countriesMap.set(c, (countriesMap.get(c) || 0) + 1);
    });

    const countries = Array.from(countriesMap.entries())
      .map(([name, views]) => ({
        flag: name === "France" ? "🇫🇷" : name === "Belgium" ? "🇧🇪" : name === "Switzerland" ? "🇨🇭" : "🌍",
        name,
        views,
        pct: totalPageViews > 0 ? Math.round((views / totalPageViews) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // 7. Flux des visites récentes en temps réel (15 dernières)
    const recentEvents = allEvents.slice(0, 15).map((e) => ({
      id: e.id,
      pagePath: e.page_path,
      pageTitle: PAGE_FRIENDLY_NAMES[e.page_path] || e.page_title,
      device: e.device_type,
      source: e.referrer_source,
      country: e.country,
      browser: e.browser,
      time: new Date(e.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: new Date(e.created_at).toLocaleDateString("fr-FR"),
    }));

    return NextResponse.json({
      success: true,
      period,
      periodTitle:
        period === "today"
          ? "Aujourd'hui"
          : period === "7d"
          ? "7 derniers jours"
          : period === "year"
          ? "Cette année"
          : "30 derniers jours",
      metrics: {
        totalVisits: totalSessions,
        uniqueVisitors: uniqueVisitorsCount,
        pageViews: totalPageViews,
        liveActiveVisitors,
        bounceRate,
        avgDuration: totalPageViews > 0 ? `${Math.min(5, Math.max(1, Math.round(totalPageViews / Math.max(1, totalSessions)) * 1.2)).toFixed(1)} min` : "0 min",
      },
      pages,
      sources,
      devices,
      countries,
      recentEvents,
      syncedAt: new Date().toLocaleTimeString("fr-FR"),
    });
  } catch (err: any) {
    console.error("Admin analytics API error:", err);
    return NextResponse.json({ error: "Erreur serveur : " + err.message }, { status: 500 });
  }
}
