import { CategoryInfo } from "../types";

export const CATEGORIES: Record<string, CategoryInfo> = {
  spl: {
    id: "spl",
    slug: "spl",
    title: "Chauffeur SPL (Super Lourd)",
    shortTitle: "Chauffeur SPL",
    icon: "🚛",
    permits: ["Permis EC", "FIMO / FCO", "Carte Conducteur"],
    description: "Conduite d'ensembles articulés de plus de 3,5 tonnes (semi-remorques, trains routiers). Transport national, régional ou international.",
    longDescription: "Le chauffeur SPL (Super Poids Lourd) pilote des ensembles routiers articulés d'un PTAC supérieur à 44 tonnes. Acteur clé de la chaîne logistique, il assure des liaisons longue distance, des tractions de nuit ou des tournées régionales de distribution.",
    keySkills: [
      "Maîtrise parfaite des manœuvres semi-remorque",
      "Respect strict de la réglementation RSE (temps de repos)",
      "Arrimage et contrôle de charge sécurisé",
      "Sens de l'orientation et gestion d'itinéraires poids lourd",
      "Gestion des lettres de voiture et documents de bord"
    ],
    typicalMissions: [
      "Tractions de nuit inter-plateformes logistiques",
      "Transport de fret industriel palettisé",
      "Lignes régulières régionales et nationales",
      "Transport sous température dirigée (frigorifique)"
    ]
  },
  pl: {
    id: "pl",
    slug: "pl",
    title: "Chauffeur PL (Poids Lourd)",
    shortTitle: "Chauffeur PL",
    icon: "🚚",
    permits: ["Permis C", "FIMO / FCO", "Carte Conducteur"],
    description: "Conduite de véhicules isolés de plus de 3,5 tonnes. Distribution régionale, livraisons urbaines, chantiers ou fret spécialisé.",
    longDescription: "Le chauffeur PL conduit un véhicule isolé de transport de marchandises de plus de 3,5 tonnes. Polyvalent et autonome, il est au contact direct des clients lors des livraisons quotidiennes.",
    keySkills: [
      "Conduite souple en milieu urbain et périurbain",
      "Utilisation des hayons élévateurs et transpalettes",
      "Relationnel client soigné lors des déchargements",
      "Contrôle de conformité de la marchandise",
      "Optimisation des tournées de livraison multi-points"
    ],
    typicalMissions: [
      "Distribution de marchandises en magasins et points de vente",
      "Approvisionnement de chantiers du BTP",
      "Livraisons alimentaires et produits frais",
      "Messagerie express et fret palettisé"
    ]
  },
  porteur: {
    id: "porteur",
    slug: "porteur",
    title: "Chauffeur Porteur",
    shortTitle: "Chauffeur Porteur",
    icon: "🚛",
    permits: ["Permis C ou EC", "FIMO / FCO", "Carte Chrono"],
    description: "Spécialiste des véhicules porteurs rigides avec ou sans remorque pour la livraison technique, benne, plateau ou frigo.",
    longDescription: "Le chauffeur sur camion porteur est souvent amené à manœuvrer des équipements spécifiques : bras de grue auxiliaire, benne TP, caisse frigorifique ou hayon lourd.",
    keySkills: [
      "Manœuvres précises sur sites industriels et chantiers",
      "Utilisation d'équipements embarqués (CACES grue si requis)",
      "Vigilance sécurité lors des opérations de chargement",
      "Entretien courant et vérifications quotidiennes du porteur"
    ],
    typicalMissions: [
      "Transport de matériaux de construction avec déchargement grue",
      "Tournées dédiées en porteur frigorifique",
      "Transport en benne pour carrières et TP",
      "Collecte et recyclage industriel"
    ]
  },
  vul: {
    id: "vul",
    slug: "vul",
    title: "Chauffeur VUL / Camionnette",
    shortTitle: "Chauffeur VUL",
    icon: "🚐",
    permits: ["Permis B"],
    description: "Véhicules Utilitaires Légers (moins de 3,5 t). Livraison du dernier kilomètre, courses express, navettes régulières.",
    longDescription: "Le chauffeur livreur en Véhicule Utilitaire Léger (VUL) est le pivot de la logistique du dernier kilomètre. Accessible avec le permis B, ce poste exige ponctualité, rigueur et dynamisme.",
    keySkills: [
      "Rapidité d'exécution et respect des créneaux horaires",
      "Utilisation des terminaux mobiles et signatures électroniques",
      "Excellente gestion du stress et du trafic urbain",
      "Service client de proximité irréprochable"
    ],
    typicalMissions: [
      "Livraison de colis e-commerce et messagerie rapide",
      "Navettes inter-sites d'entreprises",
      "Distribution de pièces détachées urgentes",
      "Approvisionnement de commerces de centre-ville"
    ]
  }
};
