"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getOrSetStorage(storage: Storage, key: string, generateVal: () => string): string {
  try {
    let val = storage.getItem(key);
    if (!val) {
      val = generateVal();
      storage.setItem(key, val);
    }
    return val;
  } catch {
    return generateVal();
  }
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUa = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

  if (width < 768 || (isMobileUa && width < 768)) return "mobile";
  if (width <= 1024 || isMobileUa) return "tablet";
  return "desktop";
}

function detectReferrerSource(referrer: string): string {
  if (!referrer) return "Trafic Direct";
  try {
    const refHost = new URL(referrer).hostname.toLowerCase();
    if (refHost.includes("google.")) return "Google Search (SEO)";
    if (refHost.includes("linkedin.")) return "LinkedIn Pro";
    if (refHost.includes("facebook.") || refHost.includes("instagram.") || refHost.includes("t.co")) {
      return "Réseaux Sociaux";
    }
    if (refHost.includes("francetravail") || refHost.includes("pole-emploi") || refHost.includes("jobtransport")) {
      return "Partenaires Emploi";
    }
    if (typeof window !== "undefined" && refHost.includes(window.location.hostname)) {
      return "Navigation Interne";
    }
    return refHost;
  } catch {
    return "Autre";
  }
}

function detectBrowser(): string {
  if (typeof window === "undefined") return "Web";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Autre";
}

export function SiteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;

    // Ignorer les pages d'administration pour ne mesurer que les visiteurs réels du site
    if (pathname.startsWith("/espace-admin") || pathname.startsWith("/api")) {
      return;
    }

    const fullPath = searchParams && searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Éviter les doubles enregistrements
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    const visitorId = getOrSetStorage(localStorage, "tm_vid", generateUUID);
    const sessionId = getOrSetStorage(sessionStorage, "tm_sid", generateUUID);
    const deviceType = detectDevice();
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const referrerSource = detectReferrerSource(referrer);
    const browser = detectBrowser();
    const pageTitle = typeof document !== "undefined" ? document.title : pathname;

    const payload = JSON.stringify({
      sessionId,
      visitorId,
      pagePath: pathname,
      pageTitle,
      referrer,
      referrerSource,
      deviceType,
      browser,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Ignore silent error
    }
  }, [pathname, searchParams]);

  return null;
}
