import React from "react";
import type { Metadata } from "next";
import { CategoryLanding } from "@/components/chauffeurs/CategoryLanding";

export const metadata: Metadata = {
  title: "Chauffeur VUL / Livreur Utilitaire — Dernier Kilomètre & Express | TruckMatch",
  description:
    "Recrutez un chauffeur livreur VUL qualifié (Permis B) ou trouvez vos missions de distribution urbaine, courses express et messagerie du dernier kilomètre sans intermédiaire.",
  alternates: {
    canonical: "https://truckmatch.fr/chauffeurs/vul",
  },
};

export default function ChauffeurVulPage() {
  return (
    <CategoryLanding
      id="vul"
      title="Chauffeur VUL / Véhicule Utilitaire Léger"
      shortTitle="Chauffeur VUL"
      badgePermit="Permis B • Mobilité Urbaine Express"
      badgeWeight="Fourgons & Utilitaires légers < 3,5 tonnes"
      icon="🚐"
      heroDescription="Le chauffeur VUL (Véhicule Utilitaire Léger) est l'artisan clé de la logistique du dernier kilomètre et du transport express. Au volant de fourgons maniables (12m³ à 20m³), il relie les hubs régionaux aux clients finaux avec ponctualité, rigueur et un sens aigu du service client."
      salaryRange="1 850 € — 2 300 € net / mois (+ primes qualité & paniers)"
      experienceAvg="Débutant accepté à 10+ ans d'expérience"
      keySkills={[
        "Conduite dynamique et sûre en circulation urbaine dense et ruelles étroites",
        "Sens poussé de l'orientation et utilisation des outils GPS / PDA de traçabilité",
        "Cadence de livraison soutenue tout en préservant l'intégrité des colis",
        "Excellente présentation, courtoisie et aisance relationnelle face aux clients",
        "Rigueur dans le contrôle des signatures électroniques et gestion des retours",
      ]}
      typicalMissions={[
        "Messagerie express et colis e-commerce (40 à 80 stops / jour selon zone)",
        "Livraison sous température dirigée (produits frais, traiteur, pharmacie)",
        "Courses urgentes dédiées de pièces détachées et documents sensibles",
        "Approvisionnement quotidien de boutiques de centre-ville et pharmacies",
      ]}
      equipmentList={[
        "Fourgon 12m³ — 14m³ (Trafic, Master, Sprinter)",
        "Grand Volume 20m³ avec Hayon",
        "Fourgonnette Frigorifique ATP",
        "Véhicule 100% Électrique ZFE",
        "Pick-up / Navette Express",
      ]}
      faqItems={[
        {
          q: "Quel permis est exigé pour conduire un véhicule utilitaire léger (VUL) ?",
          a: "Le permis B standard en cours de validité suffit pour conduire les véhicules de moins de 3,5 tonnes de PTAC. Aucune FIMO n'est obligatoire.",
        },
        {
          q: "Quelles sont les opportunités d'embauche pour les livreurs VUL ?",
          a: "Le secteur du dernier kilomètre et du e-commerce recrute continuellement en CDI, CDD et missions régulières dans toutes les agglomérations françaises.",
        },
        {
          q: "Comment être contacté par des employeurs pour des tournées VUL ?",
          a: "Créez votre profil sur TruckMatch en indiquant votre ville de résidence, vos disponibilités et votre expérience. Les entreprises vous contactent directement sans passer par une agence d'intérim.",
        },
      ]}
    />
  );
}
