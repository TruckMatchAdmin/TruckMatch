"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteTracker } from "@/components/analytics/SiteTracker";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Dans les espaces dédiés (admin, candidat, entreprise), masquer le header et le footer publics
  const isEspace = pathname?.startsWith("/espace-");

  if (isEspace) {
    return (
      <div className="espace-standalone-root">
        <Suspense fallback={null}>
          <SiteTracker />
        </Suspense>
        {children}
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <SiteTracker />
      </Suspense>
      <a href="#contenu" className="skip-link">Aller au contenu principal</a>
      <Header />
      <main id="contenu" style={{ minHeight: "calc(100vh - 160px)" }}>{children}</main>
      <Footer />
    </>
  );
}
