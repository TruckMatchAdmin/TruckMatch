import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Carte des Chauffeurs Disponibles en France — TruckMatch",
  description:
    "Explorez la carte interactive des conducteurs routiers disponibles en France (SPL, PL, Porteur, VUL). Filtrez par région, département et permis pour contacter directement les meilleurs candidats.",
  openGraph: {
    title: "Carte interactive des Chauffeurs Routiers | TruckMatch",
    description:
      "Visualisez et contactez en direct les chauffeurs routiers disponibles près de vos dépôts et entrepôts logistiques.",
    url: "https://truckmatch.fr/carte-chauffeurs",
    siteName: "TruckMatch",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/hero-carte-chauffeurs.png",
        width: 1200,
        height: 630,
        alt: "Carte interactive des chauffeurs routiers TruckMatch",
      },
    ],
  },
  alternates: {
    canonical: "https://truckmatch.fr/carte-chauffeurs",
  },
};

export default function CarteChauffeursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
