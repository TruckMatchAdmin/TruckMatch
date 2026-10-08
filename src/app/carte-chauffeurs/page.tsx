"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Filter,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  Sparkles,
  X,
  Layers,
  Compass,
  Clock,
  Send,
  Eye,
  Check,
  Maximize2,
  RotateCcw,
  Users,
  Navigation,
} from "lucide-react";

// Types
interface DriverCandidate {
  id: string;
  initials: string;
  name: string; // Nom anonymisé RGPD
  role: string;
  permit: "CE" | "C" | "Porteur" | "VUL";
  permitLabel: string;
  city: string;
  zip: string;
  department: string;
  region: string;
  lat: number;
  lng: number;
  availability: "immediat" | "48h" | "15j";
  availabilityLabel: string;
  mobilityRadius: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  verifiedFco: boolean;
  verifiedChrono: boolean;
  colorType: "spl" | "pl" | "special" | "vul";
}

// 25 conducteurs répartis sur les bassins d'activité logistique en France
const CANDIDATES_DATA: DriverCandidate[] = [
  {
    id: "CH-5901",
    initials: "ML",
    name: "Michel L.",
    role: "Conducteur Routier SPL",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Lille",
    zip: "59000",
    department: "59 - Nord",
    region: "Hauts-de-France",
    lat: 50.6292,
    lng: 3.0573,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 60 km ou Régional",
    experienceYears: 14,
    specialties: ["ADR Citerne", "Tautliner", "Frigo", "FCO 2028"],
    bio: "Conducteur grand routier confirmé. Expérience significative sur semi-remorques bâchées et frigorifiques. Gestion autonome des temps de service (RSE).",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-5902",
    initials: "YB",
    name: "Yassine B.",
    role: "Chauffeur Distribution PL",
    permit: "C",
    permitLabel: "Permis C (Poids Lourd)",
    city: "Dunkerque",
    zip: "59140",
    department: "59 - Nord",
    region: "Hauts-de-France",
    lat: 51.0343,
    lng: 2.3768,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 45 km Flandres",
    experienceYears: 7,
    specialties: ["Hayon élévateur", "Distribution urbaine", "Transpalette élec."],
    bio: "Spécialiste messagerie et livraisons palettes sur Dunkerque et le littoral nord. Rigueur des émargements et excellent contact client.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-5903",
    initials: "FD",
    name: "Frédéric D.",
    role: "Conducteur SPL Relais Nuit",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Douai",
    zip: "59500",
    department: "59 - Nord",
    region: "Hauts-de-France",
    lat: 50.3714,
    lng: 3.0805,
    availability: "48h",
    availabilityLabel: "Disponible sous 48h",
    mobilityRadius: "Liaisons Hauts-de-France / Île-de-France",
    experienceYears: 11,
    specialties: ["Traction de nuit", "Décrochage rapide", "ADR Colis"],
    bio: "Habitué aux tractions inter-hubs logistiques nocturnes. Respect strict des cadences horaires et proactivité mécanique.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-7501",
    initials: "KM",
    name: "Kevin M.",
    role: "Conducteur SPL Porte-Conteneur",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Roissy-en-France",
    zip: "95700",
    department: "95 - Val-d'Oise",
    region: "Île-de-France",
    lat: 49.0042,
    lng: 2.5156,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Bassin francilien + Oise",
    experienceYears: 9,
    specialties: ["Fret Aérien", "ADR Base", "Porte-conteneur", "Badge Cargo CDG"],
    bio: "Opère sur la zone cargo de Roissy CDG et liaison Le Havre. Connaissance approfondie des accès aéroportuaires et protocoles sûreté.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-9401",
    initials: "DP",
    name: "Damien P.",
    role: "Chauffeur PL Frigo Rungis",
    permit: "C",
    permitLabel: "Permis C (Poids Lourd)",
    city: "Rungis",
    zip: "94150",
    department: "94 - Val-de-Marne",
    region: "Île-de-France",
    lat: 48.7483,
    lng: 2.3494,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 50 km Île-de-France",
    experienceYears: 6,
    specialties: ["Température Dirigée", "Prise de poste matinale", "Certificat ATP"],
    bio: "Spécialisé en approvisionnement grande distribution et métiers de bouche depuis le MIN de Rungis. Démarrage quotidien dès 4h du matin.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "special",
  },
  {
    id: "CH-7801",
    initials: "ST",
    name: "Sofiane T.",
    role: "Conducteur Porteur Benne TP",
    permit: "Porteur",
    permitLabel: "Permis C (Porteur TP)",
    city: "Trappes",
    zip: "78190",
    department: "78 - Yvelines",
    region: "Île-de-France",
    lat: 48.7766,
    lng: 2.0022,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 40 km Grand Paris",
    experienceYears: 5,
    specialties: ["Benne Enrochée", "Chantiers BTP", "Carte BTP valide"],
    bio: "Expérience sur les grands chantiers franciliens du Grand Paris. Conduite sur terrains difficiles et respect absolu des règles de sécurité.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-6901",
    initials: "KD",
    name: "Karim D.",
    role: "Conducteur Routier SPL",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Saint-Priest",
    zip: "69800",
    department: "69 - Rhône",
    region: "Auvergne-Rhône-Alpes",
    lat: 45.6961,
    lng: 4.9458,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Corridor Vallée du Rhône ou Régional",
    experienceYears: 12,
    specialties: ["ADR Citerne étendue", "Tautliner", "Éco-conduite", "FCO 2029"],
    bio: "Pilote expérimenté sur ensembles 44T. Spécialiste des tractions régionales sur le couloir rhodanien et plateformes de la Plaine de l'Ain.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-6902",
    initials: "AG",
    name: "Alexandre G.",
    role: "Chauffeur Distribution PL",
    permit: "C",
    permitLabel: "Permis C (Poids Lourd)",
    city: "Lyon",
    zip: "69007",
    department: "69 - Rhône",
    region: "Auvergne-Rhône-Alpes",
    lat: 45.7485,
    lng: 4.8467,
    availability: "48h",
    availabilityLabel: "Disponible sous 48h",
    mobilityRadius: "Métropole de Lyon (ZFE maîtrisée)",
    experienceYears: 8,
    specialties: ["Distribution Centre-Ville", "Hayon", "Sens du service"],
    bio: "Parfaite maîtrise des contraintes de livraison urbaine lyonnaise (accès ZFE, restrictions de tonnage). Vigilant et dynamique.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-3801",
    initials: "TR",
    name: "Thierry R.",
    role: "Conducteur Porteur Grue Auxiliaire",
    permit: "Porteur",
    permitLabel: "Permis C (Grue CACES)",
    city: "Grenoble",
    zip: "38000",
    department: "38 - Isère",
    region: "Auvergne-Rhône-Alpes",
    lat: 45.1885,
    lng: 5.7245,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Sillon Alpin & Isère",
    experienceYears: 9,
    specialties: ["CACES Grue R490", "Télécommande", "Négoce Matériaux"],
    bio: "Conducteur expérimenté en livraison sur chantiers de montagne et négoce de matériaux avec grue auxiliaire télécommandée.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "special",
  },
  {
    id: "CH-1301",
    initials: "RB",
    name: "Rachid B.",
    role: "Conducteur SPL Citerne Hydrocarbures",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Fos-sur-Mer",
    zip: "13270",
    department: "13 - Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
    lat: 43.4381,
    lng: 4.9452,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "PACA & Occitanie",
    experienceYears: 16,
    specialties: ["ADR Citerne Pétrole", "Protocole Sécurité Raffinerie", "GPL"],
    bio: "Habilité sur l'ensemble des dépôts pétroliers et raffineries du golfe de Fos et Étang de Berre. Rigueur chirurgicale et zéro incident.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "special",
  },
  {
    id: "CH-1302",
    initials: "LV",
    name: "Lucas V.",
    role: "Chauffeur SPL Frigo Quotidien",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Marseille",
    zip: "13015",
    department: "13 - Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
    lat: 43.3512,
    lng: 5.3582,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 80 km PACA",
    experienceYears: 6,
    specialties: ["Frigo Viande & Primeurs", "Ensemble Tracteur Euro 6", "FCO 2027"],
    bio: "Tournées régionales au départ des plateformes logistiques de Vitrolles et Cavaillon. Ponctuel et respectueux du matériel.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-0601",
    initials: "FR",
    name: "Fabrice R.",
    role: "Chauffeur PL Distribution Littoral",
    permit: "C",
    permitLabel: "Permis C (Poids Lourd)",
    city: "Nice",
    zip: "06000",
    department: "06 - Alpes-Maritimes",
    region: "Provence-Alpes-Côte d'Azur",
    lat: 43.7102,
    lng: 7.262,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 40 km Riviera",
    experienceYears: 7,
    specialties: ["Livraison Urbaine Délicate", "Hayon", "Transpalette"],
    bio: "Habitué aux contraintes de circulation et accès complexes de la Côte d'Azur (accès pentes, voies étroites). Sérénité et politesse.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-3101",
    initials: "BF",
    name: "Bastien F.",
    role: "Conducteur Routier SPL Grand Sud",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Toulouse",
    zip: "31200",
    department: "31 - Haute-Garonne",
    region: "Occitanie",
    lat: 43.6047,
    lng: 1.4442,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Occitanie & Nouvelle-Aquitaine",
    experienceYears: 10,
    specialties: ["Convoi Exceptionnel 1ère cat.", "Tautliner", "Aéronautique"],
    bio: "Expérience du transport de pièces aéronautiques et logistique sous-traitance Airbus. Précision dans l'arrimage et suivi de trajectoire.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-3401",
    initials: "NE",
    name: "Nicolas E.",
    role: "Chauffeur Distribution PL",
    permit: "C",
    permitLabel: "Permis C (Poids Lourd)",
    city: "Montpellier",
    zip: "34000",
    department: "34 - Hérault",
    region: "Occitanie",
    lat: 43.6108,
    lng: 3.8767,
    availability: "48h",
    availabilityLabel: "Disponible sous 48h",
    mobilityRadius: "Rayon 50 km littoral",
    experienceYears: 4,
    specialties: ["Distribution Boissons / CHR", "Hayon", "Diable & Transpalette"],
    bio: "Distribution auprès des professionnels de la restauration et commerces. Bonne résistance physique, dynamique et excellent contact.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-3301",
    initials: "GH",
    name: "Guillaume H.",
    role: "Conducteur SPL National & Régional",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Bordeaux",
    zip: "33000",
    department: "33 - Gironde",
    region: "Nouvelle-Aquitaine",
    lat: 44.8378,
    lng: -0.5792,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Grand Sud-Ouest ou National",
    experienceYears: 13,
    specialties: ["Porte-Engins", "ADR Base", "Benne Céréalière"],
    bio: "Conducteur polyvalent semi-remorque. Grande expérience sur l'axe Bordeaux - Paris et liaisons Espagne. Cabine soignée et conduite économique.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-3302",
    initials: "RS",
    name: "Romain S.",
    role: "Chauffeur Livreur VUL Messagerie",
    permit: "VUL",
    permitLabel: "Permis B (Utilitaire)",
    city: "Mérignac",
    zip: "33700",
    department: "33 - Gironde",
    region: "Nouvelle-Aquitaine",
    lat: 44.8385,
    lng: -0.6436,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Agglomération bordelaise",
    experienceYears: 5,
    specialties: ["Messagerie Express", "Scan PDA", "Projet permis C"],
    bio: "Livreur expérimenté en tournée urbaine dense (60 à 80 points/jour). Rigueur horaire et connaissance des parcs d'activités.",
    verifiedFco: false,
    verifiedChrono: false,
    colorType: "vul",
  },
  {
    id: "CH-3501",
    initials: "YM",
    name: "Yannick M.",
    role: "Conducteur SPL Relais Bretagne",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Rennes",
    zip: "35000",
    department: "35 - Ille-et-Vilaine",
    region: "Bretagne",
    lat: 48.1173,
    lng: -1.6778,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Bretagne, Pays de la Loire & Normandie",
    experienceYears: 15,
    specialties: ["Agroalimentaire", "Température Dirigée", "Traction Relais Nuit"],
    bio: "Spécialiste du transport de denrées agroalimentaires sous température dirigée. Connaissance des grandes plateformes bretonnes.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-2901",
    initials: "EK",
    name: "Erwan K.",
    role: "Conducteur Routier SPL Finistère",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Brest",
    zip: "29200",
    department: "29 - Finistère",
    region: "Bretagne",
    lat: 48.3904,
    lng: -4.4861,
    availability: "48h",
    availabilityLabel: "Disponible sous 48h",
    mobilityRadius: "Bretagne & Grand Ouest",
    experienceYears: 8,
    specialties: ["Frigo Marée", "Liaison Rungis", "FCO à jour"],
    bio: "Habitué aux tractions marée et produits de la mer en flux tendus. Respect absolu des heures limites de débarquement.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-4401",
    initials: "AC",
    name: "Anthony C.",
    role: "Conducteur SPL Distribution Régionale",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Nantes",
    zip: "44000",
    department: "44 - Loire-Atlantique",
    region: "Pays de la Loire",
    lat: 47.2184,
    lng: -1.5536,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 90 km",
    experienceYears: 10,
    specialties: ["Tautliner", "ADR Colis", "Livraison Plateformes", "Éco-conduite"],
    bio: "Tractionnaire régional avec retour domicile tous les soirs. Très attentif à l'entretien du véhicule et à la sécurité des usagers.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-6701",
    initials: "MW",
    name: "Markus W.",
    role: "Conducteur SPL Transfrontalier",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Strasbourg",
    zip: "67000",
    department: "67 - Bas-Rhin",
    region: "Grand Est",
    lat: 48.5734,
    lng: 7.7521,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Alsace, Lorraine & Allemagne",
    experienceYears: 17,
    specialties: ["Allemand Bilingue", "ADR Citerne", "Toll Collect", "Liaisons Rhin"],
    bio: "Habitué aux liaisons transfrontalières France-Allemagne. Gestion bilingue des bons de livraison et procédures douanières.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-5701",
    initials: "JB",
    name: "Julien B.",
    role: "Chauffeur PL Porteur TP",
    permit: "Porteur",
    permitLabel: "Permis C (Porteur Benne)",
    city: "Metz",
    zip: "57000",
    department: "57 - Moselle",
    region: "Grand Est",
    lat: 49.1193,
    lng: 6.1757,
    availability: "48h",
    availabilityLabel: "Disponible sous 48h",
    mobilityRadius: "Rayon 50 km Moselle",
    experienceYears: 6,
    specialties: ["Benne Enrochée", "CACES R482", "Travaux Publics"],
    bio: "Conducteur polyvalent carrières et chantiers routiers. Grande réactivité et respect des consignes de sécurité.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-7601",
    initials: "CN",
    name: "Christophe N.",
    role: "Conducteur SPL Conteneur Maritime",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Rouen",
    zip: "76000",
    department: "76 - Seine-Maritime",
    region: "Normandie",
    lat: 49.4432,
    lng: 1.0999,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Axe Seine (Le Havre / Rouen / Paris)",
    experienceYears: 12,
    specialties: ["Châssis Conteneur", "Portuaire", "ADR Base", "Badges Terminaux"],
    bio: "Spécialiste de la traction conteneurs le long du corridor Axe Seine. Autonome sur les démarches portuaires et douanières.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-2101",
    initials: "OP",
    name: "Olivier P.",
    role: "Conducteur SPL Frigo & Vin",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Dijon",
    zip: "21000",
    department: "21 - Côte-d'Or",
    region: "Bourgogne-Franche-Comté",
    lat: 47.322,
    lng: 5.0415,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Bourgogne & Vallée du Rhône",
    experienceYears: 11,
    specialties: ["Transport Viticole / Palettes", "Température Dirigée", "FCO Valide"],
    bio: "Tractionnaire méticuleux sur le transport de vins et spiritueux. Respect de la chaîne du froid et calage parfait des chargements sensibles.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-4501",
    initials: "SV",
    name: "Sébastien V.",
    role: "Conducteur SPL Logistique Centrale",
    permit: "CE",
    permitLabel: "Permis CE (Super Lourd)",
    city: "Orléans",
    zip: "45000",
    department: "45 - Loiret",
    region: "Centre-Val de Loire",
    lat: 47.9029,
    lng: 1.9039,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Hub Centre & Île-de-France",
    experienceYears: 9,
    specialties: ["Tautliner", "Relais Logistique", "Plateforme Saran"],
    bio: "Idéalement positionné sur le carrefour logistique orléanais (A10 / A71). Expérience confirmée sur tractions grande distribution.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
];

export default function CarteChauffeursPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<DriverCandidate | null>(CANDIDATES_DATA[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermit, setSelectedPermit] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");

  // Modale de contact
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [modalForm, setModalForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    contractType: "CDI",
    message: "",
  });

  // Référence DOM pour la carte Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Filtrage réactif
  const filteredCandidates = useMemo(() => {
    return CANDIDATES_DATA.filter((c) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          c.city.toLowerCase().includes(q) ||
          c.zip.includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedPermit !== "all" && c.permit !== selectedPermit) {
        return false;
      }

      if (selectedRegion !== "all" && c.region !== selectedRegion) {
        return false;
      }

      if (selectedAvailability !== "all" && c.availability !== selectedAvailability) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedPermit, selectedRegion, selectedAvailability]);

  // Initialisation et cycle de vie de Leaflet
  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (!mapContainerRef.current || typeof window === "undefined") return;

      const L = (await import("leaflet")).default;

      if (!isMounted) return;

      // Nettoyer si déjà initialisé
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialiser la carte centrée sur la France
      const map = L.map(mapContainerRef.current, {
        center: [46.603354, 2.352222], // Centre géographique de la France
        zoom: 6,
        minZoom: 5,
        maxZoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Fond de carte ESRI World Street Map : réseau routier ultra-net, sans filigrane, sans clé d'API
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a> | TruckMatch France',
          maxZoom: 18,
        }
      ).addTo(map);

      // Layer group pour les marqueurs
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      renderMarkers(L, map, markersLayer, filteredCandidates);
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour des marqueurs quand le filtre change
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import("leaflet")).default;
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current, filteredCandidates);
    }
    updateMarkers();
  }, [filteredCandidates]);

  // Fonction de rendu des marqueurs Leaflet
  const renderMarkers = (L: any, map: any, layer: any, candidates: DriverCandidate[]) => {
    layer.clearLayers();

    candidates.forEach((candidate) => {
      // Pin circulaire avec pulse dot et étiquette de commune
      const pulseHtml =
        candidate.availability === "immediat"
          ? `<span class="truck-pin-pulse-dot"></span>`
          : "";

      const customIcon = L.divIcon({
        className: "truck-map-pin",
        html: `
          <div class="truck-pin-circle ${candidate.colorType}">
            ${pulseHtml}
            <span>${candidate.permit}</span>
          </div>
          <div class="truck-pin-label">${candidate.city}</div>
        `,
        iconSize: [60, 54],
        iconAnchor: [30, 24],
        popupAnchor: [0, -26],
      });

      const marker = L.marker([candidate.lat, candidate.lng], { icon: customIcon });

      // Popup moderne au clic
      const popupHtml = `
        <div class="map-popup-card">
          <div class="map-popup-header">
            <div>
              <div class="map-popup-title">${candidate.name}</div>
              <div style="font-size:12px; font-weight:700; color:#0080ff;">${candidate.role}</div>
            </div>
            <span class="badge ${candidate.availability === "immediat" ? "badge-green" : "badge-blue"}" style="font-size:10px;">
              ${candidate.availability === "immediat" ? "🟢 Immédiat" : "🔵 Sous 48h"}
            </span>
          </div>
          <div class="map-popup-loc">
            <span>📍</span>
            <span><strong>${candidate.city}</strong> (${candidate.zip}) • ${candidate.mobilityRadius}</span>
          </div>
          <div class="map-popup-tags">
            ${candidate.specialties.map((s) => `<span class="map-popup-tag">${s}</span>`).join("")}
          </div>
          <div style="font-size:12px; color:#475569; margin-top:2px;">
            Expérience : <strong>${candidate.experienceYears} ans</strong>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        setSelectedCandidate(candidate);
      });

      marker.addTo(layer);
    });
  };

  // Zoom direct sur un candidat au clic depuis le volet latéral
  const handleFlyToCandidate = async (candidate: DriverCandidate) => {
    setSelectedCandidate(candidate);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([candidate.lat, candidate.lng], 10, {
        duration: 1.2,
      });
    }
  };

  // Réinitialiser la vue France entière
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([46.603354, 2.352222], 6, {
        duration: 1,
      });
    }
  };

  const handleOpenContact = (candidate: DriverCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setContactSuccess(false);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setContactSuccess(false);
    }, 2400);
  };

  return (
    <div className="trouver-chauffeur-page">
      {/* 1. Hero Recrutement Géolocalisé (Identique aux pages précédentes) */}
      <section className="recruiter-hero-section">
        <div className="container">
          <div className="recruiter-hero-grid">
            <div className="recruiter-hero-content">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                <span>Radar Recrutement France • Données Inscriptions en Temps Réel</span>
              </div>

              <h1 className="hero-title">
                Carte interactive des
                <span className="hero-title-highlight">chauffeurs disponibles</span>
              </h1>

              <p className="hero-subtitle">
                Localisez immédiatement les conducteurs routiers qualifiés (SPL, PL, Porteur, VUL)
                inscrits sur TruckMatch. Filtrez par commune de résidence, permis et habilitations pour
                engager vos recrutements en circuit court et sans intermédiaire.
              </p>

              <div className="hero-cta-group">
                <a href="#carte-interactive" className="btn btn-primary btn-lg">
                  <MapPin size={17} />
                  <span>Explorer la carte de France</span>
                </a>
                <Link href="/entreprises" className="btn btn-outline btn-lg">
                  <Building2 size={17} />
                  <span>Déposer une offre d'emploi</span>
                </Link>
              </div>

              {/* Mots-clés SEO interactifs */}
              <div className="hero-seo-pills">
                <span className="seo-pill-label">Bassins recherchés :</span>
                <span className="seo-pill" onClick={() => setSearchQuery("Lille")} style={{ cursor: "pointer" }}>
                  Chauffeur SPL Lille (59)
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Lyon")} style={{ cursor: "pointer" }}>
                  Conducteur PL Lyon (69)
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Fos-sur-Mer")} style={{ cursor: "pointer" }}>
                  ADR Citerne PACA
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Roissy")} style={{ cursor: "pointer" }}>
                  Traction Roissy CDG
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Rennes")} style={{ cursor: "pointer" }}>
                  Frigo Bretagne
                </span>
              </div>
            </div>

            {/* Carte métrique & statut en temps réel */}
            <div className="recruiter-hero-visual">
              <div className="recruiter-visual-card">
                <div className="visual-metric-row">
                  <div className="visual-metric-icon">
                    <Truck size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">1 480 Conducteurs</p>
                    <p className="visual-metric-label">Inscrits avec ville ou village certifié</p>
                  </div>
                </div>

                <div className="visual-metric-row">
                  <div className="visual-metric-icon" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">342 Disponibles</p>
                    <p className="visual-metric-label">Prêts à prendre le volant immédiatement</p>
                  </div>
                </div>

                <div className="visual-metric-row">
                  <div className="visual-metric-icon" style={{ backgroundColor: "#e8f3ff", color: "#0080ff" }}>
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">98,4% Validés</p>
                    <p className="visual-metric-label">Permis, FCO Marchandises & Cartes Chrono vérifiés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bandeau de réassurance Transport 4 métriques */}
          <div className="recruiter-metrics-strip">
            <div className="recruiter-metric-card">
              <div className="visual-metric-icon">
                <Truck size={24} />
              </div>
              <div>
                <p className="visual-metric-val">1 480 Conducteurs</p>
                <p className="visual-metric-label">Géolocalisés en France</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="visual-metric-val">342 Disponibles</p>
                <p className="visual-metric-label">Prêts à rouler immédiatement</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e8f3ff", color: "#0080ff" }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="visual-metric-val">98,4% Validés</p>
                <p className="visual-metric-label">Permis, FCO & Cartes Chrono</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}>
                <MapPin size={24} />
              </div>
              <div>
                <p className="visual-metric-val">95 Départements</p>
                <p className="visual-metric-label">Couverture nationale intégrale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filtres & Moteur de Recherche Géographique */}
      <section id="carte-interactive" className="container" style={{ marginBottom: "2rem" }}>
        <div className="jobs-filter-box">
          <div className="filter-header-wrap" style={{ marginBottom: "1.5rem" }}>
            <h2 className="filter-title">Rechercher parmi les conducteurs géolocalisés</h2>
            <p className="filter-subtitle">
              Filtrez par commune ou village de résidence, type de permis, région ou disponibilité immédiate.
            </p>
          </div>

          <div className="jobs-search-row" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr" }}>
            {/* Recherche textuelle par commune ou code postal */}
            <div className="jobs-search-input-wrap">
              <Search size={18} className="jobs-search-ico" />
              <input
                type="text"
                placeholder="Ville, village ou département (ex: Lille, Saint-Priest, Fos-sur-Mer, 59, 69)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="jobs-text-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sélecteur de Permis */}
            <div>
              <select
                value={selectedPermit}
                onChange={(e) => setSelectedPermit(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Tous les permis</option>
                <option value="CE">Permis CE (Super Lourd SPL)</option>
                <option value="C">Permis C (Poids Lourd Distribution)</option>
                <option value="Porteur">Porteur Spécialisé / Grue</option>
                <option value="VUL">Permis B (Utilitaire VUL)</option>
              </select>
            </div>

            {/* Sélecteur de Région */}
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Toutes les régions</option>
                <option value="Hauts-de-France">Hauts-de-France (59, 62...)</option>
                <option value="Île-de-France">Île-de-France (75, 93, 95...)</option>
                <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes (69, 38...)</option>
                <option value="Provence-Alpes-Côte d'Azur">PACA (13, 06...)</option>
                <option value="Occitanie">Occitanie (31, 34...)</option>
                <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine (33, 64...)</option>
                <option value="Bretagne">Bretagne (35, 29...)</option>
                <option value="Pays de la Loire">Pays de la Loire (44, 49...)</option>
                <option value="Grand Est">Grand Est (67, 57...)</option>
                <option value="Normandie">Normandie (76, 14...)</option>
                <option value="Centre-Val de Loire">Centre-Val de Loire (45, 37...)</option>
                <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté (21, 25...)</option>
              </select>
            </div>

            {/* Sélecteur de Disponibilité */}
            <div>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Toutes disponibilités</option>
                <option value="immediat">⚡ Immédiatement</option>
                <option value="48h">Sous 48 heures</option>
              </select>
            </div>
          </div>

          {/* Filtres rapides en boutons pills */}
          <div className="filter-tags-quick">
            <span className="quick-tag-label">Filtres rapides :</span>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "all" ? "active" : ""}`}
              onClick={() => setSelectedPermit("all")}
            >
              Tous ({filteredCandidates.length})
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "CE" ? "active" : ""}`}
              onClick={() => setSelectedPermit("CE")}
            >
              Conducteurs SPL
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "C" ? "active" : ""}`}
              onClick={() => setSelectedPermit("C")}
            >
              Chauffeurs PL
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "Porteur" ? "active" : ""}`}
              onClick={() => setSelectedPermit("Porteur")}
            >
              Porteurs & Grue TP
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "VUL" ? "active" : ""}`}
              onClick={() => setSelectedPermit("VUL")}
            >
              Livreurs VUL
            </button>

            {(searchQuery || selectedPermit !== "all" || selectedRegion !== "all" || selectedAvailability !== "all") && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPermit("all");
                  setSelectedRegion("all");
                  setSelectedAvailability("all");
                  handleResetMapView();
                }}
              >
                <RotateCcw size={14} />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Section Carte Interactive Pleine Fonctionnalité + Volet Candidats */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <div className="map-container-grid">
          {/* Colonne Gauche : Carte Leaflet Interactive */}
          <div style={{ position: "relative" }}>
            {/* Boutons d'action rapides au-dessus de la carte */}
            <div className="map-quick-actions">
              <button
                type="button"
                className="map-action-pill"
                onClick={handleResetMapView}
                title="Recentrer la carte sur la France entière"
              >
                <RotateCcw size={14} />
                <span>Vue France entière</span>
              </button>
            </div>

            {/* Conteneur Leaflet Réel */}
            <div ref={mapContainerRef} className="leaflet-france-container" />

            {/* Légende interactive sous la carte */}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span className="legend-item">
                  <span className="legend-dot-spl" />
                  <span>Permis CE (SPL)</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot-pl" />
                  <span>Permis C (PL)</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot-special" />
                  <span>Spécialités ADR / Frigo / CACES</span>
                </span>
                <span className="legend-item">
                  <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ea580c" }} />
                  <span>Permis B (VUL)</span>
                </span>
              </div>
              <span>💡 Zoomez avec la molette ou cliquez sur un marqueur</span>
            </div>
          </div>

          {/* Colonne Droite : Volet Latéral des Profils Disponibles */}
          <aside className="candidate-drawer-card">
            <div className="drawer-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className="drawer-title">Profils disponibles ({filteredCandidates.length})</h3>
                <span className="drawer-count-badge">Sourcing direct</span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--color-text-muted)" }}>
                Cliquez sur « Localiser » pour centrer la carte sur la commune du chauffeur.
              </p>
            </div>

            <div className="drawer-scrollable-list">
              {filteredCandidates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                  <Search size={36} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <p style={{ fontWeight: 700 }}>Aucun chauffeur ne correspond à vos filtres.</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                    Élargissez vos critères ou réinitialisez la recherche.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: "1rem" }}
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedPermit("all");
                      setSelectedRegion("all");
                      setSelectedAvailability("all");
                      handleResetMapView();
                    }}
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`candidate-compact-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleFlyToCandidate(c)}
                    >
                      <div className="candidate-compact-top">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              backgroundColor: "var(--color-primary-light)",
                              color: "var(--color-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.95rem",
                            }}
                          >
                            {c.initials}
                          </div>
                          <div>
                            <div className="candidate-compact-name">{c.name}</div>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--color-primary)" }}>
                              {c.role} ({c.permit})
                            </div>
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            c.availability === "immediat" ? "badge-green" : "badge-blue"
                          }`}
                          style={{ fontSize: "0.72rem" }}
                        >
                          {c.availability === "immediat" ? "🟢 Immédiat" : "🔵 Sous 48h"}
                        </span>
                      </div>

                      <div className="candidate-compact-meta">
                        <MapPin size={15} color="var(--color-primary)" />
                        <span>
                          <strong>{c.city}</strong> ({c.zip}) • {c.mobilityRadius}
                        </span>
                      </div>

                      <div className="candidate-badges-compact">
                        {c.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              background: "rgba(0, 128, 255, 0.08)",
                              color: "var(--color-primary)",
                              padding: "0.2rem 0.55rem",
                              borderRadius: "999px",
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                        {c.bio}
                      </p>

                      <div className="candidate-compact-footer">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: "0.78rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlyToCandidate(c);
                          }}
                        >
                          <Navigation size={13} />
                          <span>Localiser</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenContact(c);
                          }}
                        >
                          <Send size={13} />
                          <span>Contacter</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* 4. Section SEO Recrutement Local (Identique à la charte) */}
      <section className="recruiter-seo-section">
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-blue">Recrutement Géolocalisé Transport</span>
              <h2>Pourquoi cartographier vos recrutements de conducteurs routiers ?</h2>
              <p>
                Dans le transport de marchandises, la proximité géographique entre le domicile du chauffeur
                et votre base d'exploitation est le premier facteur de fidélisation et de sécurité routière.
              </p>
            </div>

            <div className="features-grid-3">
              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <MapPin size={24} />
                </div>
                <h3>Zéro fatigue de trajet domicile-travail</h3>
                <p>
                  Un conducteur qui réside à proximité immédiate de son dépôt commence sa tournée
                  en pleine possession de ses moyens. Vous réduisez les risques d'accident de trajet et préservez sa vigilance.
                </p>
              </div>

              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <Clock size={24} />
                </div>
                <h3>Respect strict de la RSE</h3>
                <p>
                  Avec un temps de navette réduit, vos chauffeurs respectent scrupuleusement les temps de repos
                  de 11h consécutives et les amplitudes journalières sans stress d'horaires.
                </p>
              </div>

              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <ShieldCheck size={24} />
                </div>
                <h3>Stabilité et baisse du turn-over</h3>
                <p>
                  Les conducteurs embauchés sur leur bassin de vie restent 3 fois plus longtemps en poste dans la même entreprise.
                  Vous pérennisez vos tournées régionales et évitez les remplacements d'urgence coûteux.
                </p>
              </div>
            </div>

            {/* FAQ Géolocalisation */}
            <div className="seo-faq-grid" style={{ marginTop: "2.5rem" }}>
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment sont validées les communes des conducteurs ?</h3>
                <p className="seo-faq-a">
                  Lors de son inscription sur TruckMatch, chaque conducteur renseigne sa commune de résidence
                  et son code postal. Ces éléments sont vérifiés lors du contrôle des justificatifs officiels
                  (Carte de Qualification Conducteur FCO et Carte Chronotachygraphe) pour garantir une géolocalisation fiable.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Puis-je recruter pour des tractions nationales avec découchés ?</h3>
                <p className="seo-faq-a">
                  Tout à fait. Sur chaque profil, le rayon de mobilité est clairement affiché (ex : retour chaque soir,
                  liaisons régionales ou grand routier national). Vous ciblez exactement le mode de vie recherché par le chauffeur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modale de Contact / Recrutement Direct */}
      {isModalOpen && selectedCandidate && (
        <div className="map-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="map-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                {selectedCandidate.initials}
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-navy)" }}>
                  Proposer un poste à {selectedCandidate.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  {selectedCandidate.role} ({selectedCandidate.permit}) à {selectedCandidate.city} ({selectedCandidate.zip})
                </p>
              </div>
            </div>

            {contactSuccess ? (
              <div
                style={{
                  padding: "2rem",
                  background: "#e6f9f0",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#10b981",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={28} />
                </div>
                <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#065f46" }}>
                  Proposition envoyée avec succès !
                </h4>
                <p style={{ fontSize: "0.88rem", color: "#047857" }}>
                  Votre prise de contact a été notifiée à {selectedCandidate.name}. Le candidat prendra directement
                  contact avec vous par téléphone ou email dans un délai moyen de 2 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Entreprise de transport *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Transports Express Ouest"
                      value={modalForm.companyName}
                      onChange={(e) => setModalForm({ ...modalForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-field-modern">
                    <label>Responsable recrutement *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: David M., Responsable Exploitation"
                      value={modalForm.contactName}
                      onChange={(e) => setModalForm({ ...modalForm, contactName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Téléphone direct *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 06 12 34 56 78"
                      value={modalForm.phone}
                      onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-field-modern">
                    <label>Email professionnel *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: exploitation@transports.fr"
                      value={modalForm.email}
                      onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Type de contrat</label>
                    <select
                      value={modalForm.contractType}
                      onChange={(e) => setModalForm({ ...modalForm, contractType: e.target.value })}
                    >
                      <option value="CDI">CDI (Temps plein)</option>
                      <option value="CDD">CDD (Saisonnier / Remplacement)</option>
                      <option value="Relais">Traction ponctuelle / Relais</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Prise de poste</label>
                    <input type="text" placeholder="Ex: Immédiate ou sous 15 jours" />
                  </div>
                </div>

                <div className="form-field-modern">
                  <label>Précisions sur la tournée ou le matériel (facultatif)</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Recherche chauffeur pour liaison régulière de nuit en tautliner au départ de notre agence..."
                    value={modalForm.message}
                    onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                  />
                </div>

                <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary btn-lg w-full">
                    <Send size={18} />
                    <span>Envoyer la proposition au conducteur</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.76rem", color: "var(--color-text-light)", textAlign: "center" }}>
                  🔒 Contact 100% direct et confidentiel. Aucun intermédiaire ni commission d'agence.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
