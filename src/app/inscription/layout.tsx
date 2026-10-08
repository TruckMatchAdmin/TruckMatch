import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Créer mon profil — Inscription Chauffeur & Entreprise Transport | TruckMatch",
  description:
    "Rejoignez TruckMatch en quelques secondes. Inscription chauffeur routier (SPL, PL, Porteur, VUL) ou entreprise de transport. Validation automatique de l'adresse et du SIRET via les registres officiels de l'État.",
  alternates: {
    canonical: "https://truckmatch.fr/inscription",
  },
  openGraph: {
    title: "Créer mon profil TruckMatch — Chauffeurs et Entreprises",
    description:
      "La plateforme indépendante de mise en relation directe dans le transport routier. Inscription gratuite et vérifiée.",
    url: "https://truckmatch.fr/inscription",
    images: ["/images/hero-home.png"],
  },
};

export default function InscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
