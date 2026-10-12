import React from "react";
import type { Metadata } from "next";
import { CategoryLanding } from "@/components/chauffeurs/CategoryLanding";

export const metadata: Metadata = {
  title: "Chauffeur Porteur (Grue, Benne, Ampliroll) — Recrutement & Profils | TruckMatch",
  description:
    "Recrutez un chauffeur porteur rigide qualifié ou proposez vos compétences : benne TP, plateau grue auxiliaire, ampliroll, frigo, hayon. Contact direct sans intermédiaire.",
  alternates: {
    canonical: "https://truckmatch.fr/chauffeurs/porteur",
  },
};

export default function ChauffeurPorteurPage() {
  return (
    <CategoryLanding
      id="porteur"
      title="Chauffeur Camion Porteur"
      shortTitle="Chauffeur Porteur"
      badgePermit="Permis C / EC • FIMO / FCO • CACES Grue"
      badgeWeight="Porteurs rigides 19t, 26t (6x2/6x4) & 32t (8x4)"
      icon="🏗️"
      heroDescription="Le chauffeur porteur pilote des véhicules rigides lourds dotés d'équipements techniques spécialisés (bras grue auxiliaire, système ampliroll, bi-benne TP, malaxeur béton). Spécialiste du transport technique, il intervient sur chantiers, carrières, travaux publics et sites industriels complexes."
      salaryRange="2 300 € — 3 000 € net / mois (+ primes techniques CACES)"
      experienceAvg="2 ans à 15+ ans d'expérience"
      keySkills={[
        "Maniement précis de grue auxiliaire de chargement (CACES R490) avec télécommande",
        "Conduite tout-terrain sur pistes chantiers, carrières et accès non stabilisés",
        "Maîtrise des systèmes hydrauliques : vérins de benne, bras ampliroll et béquilles",
        "Respect strict des protocoles de sécurité BTP et port des EPI complets",
        "Contrôle de la répartition des charges sur les essieux et bâchage sécurisé",
      ]}
      typicalMissions={[
        "Livraison de matériaux sur chantiers du bâtiment et travaux publics (BTP)",
        "Rotation benne TP (évacuation de déblais, approvisionnement gravats et enrobés)",
        "Dépôt et enlèvement de bennes industrielles par système ampliroll",
        "Livraison avec déchargement à la grue (palettes de parpaings, tuiles, charpentes)",
      ]}
      equipmentList={[
        "Porteur Plateau Grue Auxiliaire (R490)",
        "Bi-Benne & Tri-Benne TP (6x4 / 8x4)",
        "Bras Ampliroll / Multibenne",
        "Toupie Béton Malaxeur (PUMI)",
        "Porteur Frigorifique Gros Volume",
      ]}
      faqItems={[
        {
          q: "Quelles sont les qualifications recommandées pour un chauffeur porteur ?",
          a: "En plus du permis C et de la FIMO/FCO, les habilitations CACES R490 (grue auxiliaire de chargement) ou CACES R482 sont particulièrement recherchées et valorisées sur le marché.",
        },
        {
          q: "Quelle est la différence entre un chauffeur PL classique et un chauffeur porteur ?",
          a: "Le porteur intègre généralement un équipement de manutention ou de bennage propre (grue de levage, compas hydraulique, ampliroll) nécessitant une double compétence de conduite et d'opération technique sur site.",
        },
        {
          q: "Comment trouver rapidement une mission ou un chauffeur porteur qualifié ?",
          a: "Via TruckMatch, les entreprises filtrent instantanément les profils selon les équipements maîtrisés (grue, benne, hayon) et contactent directement le conducteur sans commission d'agence.",
        },
      ]}
    />
  );
}
