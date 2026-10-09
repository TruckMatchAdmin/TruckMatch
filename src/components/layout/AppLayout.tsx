"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Dans les espaces dédiés (admin, candidat, entreprise), masquer le header et le footer publics
  const isEspace = pathname?.startsWith("/espace-");

  if (isEspace) {
    return <div className="espace-standalone-root">{children}</div>;
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 160px)" }}>{children}</main>
      <Footer />
    </>
  );
}
