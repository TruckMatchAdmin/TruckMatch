import React from "react";
import type { Metadata } from "next";
import { CategoryLanding } from "@/components/chauffeurs/CategoryLanding";

export const metadata: Metadata = {
  title: "Chauffeur SPL (Super Poids Lourd) — Recrutement & Profils Conducteurs EC",
  description:
    "Trouvez un chauffeur SPL (Permis EC, FIMO/FCO, carte conducteur) ou déposez votre profil conducteur super lourd. Tractions de nuit, national, régional et frigo sans intermédiaire.",
  alternates: {
    canonical: "https://truckmatch.fr/chauffeurs/spl",
  },
};

export default function ChauffeurSplPage() {
  return (
    <CategoryLanding
      id="spl"
      title="Chauffeur SPL (Super Poids Lourd)"
      shortTitle="Chauffeur SPL"
      badgePermit="Permis EC • FIMO / FCO • Carte Chrono"
      badgeWeight="Ensembles articulés &gt; 44 tonnes"
      icon="🚛"
      heroDescription="Le chauffeur SPL (Super Poids Lourd) pilote des ensembles routiers articulés (tracteur + semi-remorque). Pilier central de la chaîne logistique, il assure des liaisons nationales, des tractions de nuit régulières et du transport régional de fret palettisé ou frigorifique."
      salaryRange="2 450 € — 3 200 € net / mois (+ frais RSE)"
      experienceAvg="2 ans à 15+ ans d'expérience"
      keySkills={[
        "Maîtrise complète des manœuvres semi-remorque (mise à quai, recul complexe)",
        "Respect scrupuleux de la réglementation RSE (temps de conduite et de repos)",
        "Arrimage sécurisé, contrôle des charges et vérification des scellés",
        "Gestion autonome des lettres de voiture (CMR) et documents de bord électroniques",
        "Éco-conduite et vigilance sécurité sur les réseaux autoroutiers et zones denses",
      ]}
      typicalMissions={[
        "Tractions de nuit inter-plateformes logistiques (relais sans découché)",
        "Lignes régulières régionales et nationales en semi-remorque tautliner",
        "Transport sous température dirigée (frigorifique, surgelés, agroalimentaire)",
        "Transport de fret industriel lourd et matières conditionnées",
      ]}
      equipmentList={[
        "Semi-remorque Tautliner",
        "Frigorifique Bi-Température",
        "Fond Mouvant (FMA)",
        "Citerne",
        "Porte-Conteneur",
      ]}
      faqItems={[
        {
          q: "Quelles sont les qualifications obligatoires pour conduire un camion SPL ?",
          a: "Le permis EC en cours de validité, complété par la FIMO (ou FCO Marchandises à jour tous les 5 ans) ainsi que la carte de conducteur pour chronotachygraphe numérique.",
        },
        {
          q: "Comment les transporteurs recrutent-ils des chauffeurs SPL sur TruckMatch ?",
          a: "Les entreprises consultent directement les profils vérifiés selon leur secteur géographique et contactent directement le conducteur par appel ou SMS sans intermédiaire.",
        },
        {
          q: "Y a-t-il des postes SPL sans découché disponibles ?",
          a: "Oui, de nombreuses tractions de nuit en relais ou tournées régionales permettent un retour quotidien au domicile.",
        },
      ]}
    />
  );
}
