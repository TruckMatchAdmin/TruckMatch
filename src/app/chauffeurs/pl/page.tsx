import React from "react";
import type { Metadata } from "next";
import { CategoryLanding } from "@/components/chauffeurs/CategoryLanding";

export const metadata: Metadata = {
  title: "Chauffeur PL (Poids Lourd) — Recrutement & Profils Distribution | TruckMatch",
  description:
    "Trouvez un chauffeur PL qualifié (Permis C, FIMO/FCO, carte conducteur) ou créez votre profil conducteur poids lourd. Distribution régionale, livraisons urbaines, chantiers en direct.",
  alternates: {
    canonical: "https://truckmatch.fr/chauffeurs/pl",
  },
};

export default function ChauffeurPlPage() {
  return (
    <CategoryLanding
      id="pl"
      title="Chauffeur PL (Poids Lourd)"
      shortTitle="Chauffeur PL"
      badgePermit="Permis C • FIMO / FCO • Carte Chrono"
      badgeWeight="Véhicules rigides isolés > 3,5 tonnes"
      icon="🚚"
      heroDescription="Le chauffeur PL (Poids Lourd) assure les tournées de distribution urbaine, régionale et les approvisionnements de chantiers. Maître des manœuvres en zone encombrée, il gère la relation client sur site, le déchargement sécurisé et la conformité des livraisons au quotidien."
      salaryRange="2 100 € — 2 700 € net / mois (+ primes & paniers)"
      experienceAvg="1 an à 12+ ans d'expérience"
      keySkills={[
        "Conduite de précision en milieu urbain, zones artisanales et accès restreints",
        "Utilisation experte du hayon élévateur, transpalette électrique et diable",
        "Optimisation de l'ordre de chargement en fonction des étapes de la tournée",
        "Émargement rigoureux des bons de livraison et gestion des réserves transport",
        "Sens du contact client et respect des créneaux horaires stricts",
      ]}
      typicalMissions={[
        "Distribution régionale multi-clients (10 à 25 points de livraison / jour)",
        "Livraison magasins, grandes surfaces (GMS) et commerces de centre-ville",
        "Navettes inter-dépôts et approvisionnement logistique en flux tendus",
        "Transport de matériaux de construction et livraisons sur chantiers",
      ]}
      equipmentList={[
        "Fourgon Poids Lourd avec Hayon",
        "Caisse Frigorifique Régionale",
        "Rideaux Coulissants (Savoyarde)",
        "Plateau Ridelles",
        "Bâché Distribution Urbaine",
      ]}
      faqItems={[
        {
          q: "Quels permis sont requis pour conduire un camion PL ?",
          a: "Le permis C (poids lourd isolé de plus de 3,5 tonnes), accompagné de la FIMO ou FCO Marchandises en cours de validité et de la carte chrono.",
        },
        {
          q: "Les postes de chauffeurs PL permettent-ils de rentrer tous les soirs chez soi ?",
          a: "Oui, la grande majorité des postes en PL sont des tournées de distribution régionale de jour, garantissant un retour au domicile chaque soir.",
        },
        {
          q: "Comment postuler ou trouver une mission en tant que chauffeur PL sur TruckMatch ?",
          a: "Inscrivez-vous en 2 minutes sur l'Espace Chauffeur. Votre profil est immédiatement visible par les transporteurs de votre département qui vous contactent directement.",
        },
      ]}
    />
  );
}
