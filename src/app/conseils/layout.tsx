import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Conseils & Guides Recrutement Transport Routier | TruckMatch",
  description:
    "Centre de ressources officielles et guides pratiques pour recruter un chauffeur SPL, PL, VUL : réglementation FIMO/FCO, convention collective transport CCNTR, RSE et sourcing direct sans intérim.",
  openGraph: {
    title: "Conseils & Guides Recrutement Transport Routier | TruckMatch",
    description:
      "Guides complets pour recruter un chauffeur SPL, PL ou VUL, réussir son parcours de conducteur routier, réglementation FIMO/FCO et astuces d'embauche transport.",
    url: "https://truckmatch.fr/conseils",
    siteName: "TruckMatch",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://truckmatch.fr/images/hero-conseils.png",
        width: 1024,
        height: 369,
        alt: "Conseils, réglementation RSE et guides de recrutement transport - TruckMatch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conseils & Guides Recrutement Transport Routier | TruckMatch",
    description:
      "Guides complets pour recruter un chauffeur SPL, PL ou VUL, réglementation FIMO/FCO et astuces d'embauche transport.",
    images: ["https://truckmatch.fr/images/hero-conseils.png"],
  },
  alternates: {
    canonical: "https://truckmatch.fr/conseils",
  },
};

export default function ConseilsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
