import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Offres d'Emploi Chauffeur Routier (CDI, CDD, Relais) — TruckMatch",
  description:
    "Consultez les offres d'emploi pour conducteurs routiers SPL, PL, Porteurs et livreurs VUL partout en France. Postulez directement auprès des entreprises de transport sans intermédiaire.",
  openGraph: {
    title: "Offres d'Emploi Conducteur Routier & Transport | TruckMatch",
    description:
      "Toutes les annonces d'emploi dans le transport de marchandises : tractions de nuit, distribution régionale, benne, TP, frigo. Contact direct avec les recruteurs.",
    url: "https://truckmatch.fr/offres-emploi",
    siteName: "TruckMatch",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/hero-offres-emploi.png",
        width: 1200,
        height: 630,
        alt: "Offres d'emploi chauffeur routier TruckMatch",
      },
    ],
  },
  alternates: {
    canonical: "https://truckmatch.fr/offres-emploi",
  },
};

export default function OffresEmploiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
