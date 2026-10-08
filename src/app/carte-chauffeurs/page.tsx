"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";

// Types
interface DriverCandidate {
  id: string;
  name: string; // Prénom + Initiale (anonymisé pour conformité RGPD)
  role: string;
  permit: "CE" | "C" | "Porteur" | "VUL";
  city: string;
  zip: string;
  department: string;
  region: string;
  lat: number;
  lng: number;
  availability: "immediat" | "48h" | "15j" | "preavis";
  availabilityLabel: string;
  mobilityRadius: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  verifiedFco: boolean;
  verifiedChrono: boolean;
  colorType: "spl" | "pl" | "special" | "vul";
}

// Données candidates enregistrées lors de l'inscription
const CANDIDATES_DATA: DriverCandidate[] = [
  {
    id: "CH-5901",
    name: "Michel L.",
    role: "Conducteur Routier SPL",
    permit: "CE",
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
    name: "Yassine B.",
    role: "Chauffeur Distribution PL",
    permit: "C",
    city: "Dunkerque",
    zip: "59140",
    department: "59 - Nord",
    region: "Hauts-de-France",
    lat: 51.0343,
    lng: 2.3768,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 45 km",
    experienceYears: 7,
    specialties: ["Hayon élévateur", "Distribution urbaine", "Transpalette élec."],
    bio: "Spécialiste messagerie et livraisons palettes sur Dunkerque et Flandres maritimes. Rigueur des émargements et bon contact client.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-5903",
    name: "Frédéric D.",
    role: "Conducteur SPL Relais Nuit",
    permit: "CE",
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
    name: "Kevin M.",
    role: "Conducteur SPL Porte-Conteneur",
    permit: "CE",
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
    specialties: ["Fret Aérien", "ADR Base", "Porte-conteneur", "Badge Aéroportuaire"],
    bio: "Opère sur la plateforme cargo de Roissy CDG et liaison Le Havre. Connaissance approfondie des accès aéroportuaires et protocoles sûreté.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-7502",
    name: "Damien P.",
    role: "Chauffeur PL Frigo Rungis",
    permit: "C",
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
    id: "CH-7803",
    name: "Sofiane T.",
    role: "Conducteur Benne & TP",
    permit: "C",
    city: "Trappes",
    zip: "78190",
    department: "78 - Yvelines",
    region: "Île-de-France",
    lat: 48.7766,
    lng: 2.0022,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Rayon 40 km",
    experienceYears: 5,
    specialties: ["Benne Enrochée", "Chantiers BTP", "Carte BTP valide"],
    bio: "Expérience sur les grands chantiers franciliens du Grand Paris. Conduite sur terrains difficiles et respect absolu des règles de sécurité.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "pl",
  },
  {
    id: "CH-6901",
    name: "Karim D.",
    role: "Conducteur Routier SPL",
    permit: "CE",
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
    name: "Alexandre G.",
    role: "Chauffeur PL Distribution",
    permit: "C",
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
    name: "Thierry R.",
    role: "Conducteur Porteur Grue Auxiliaire",
    permit: "C",
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
    name: "Rachid B.",
    role: "Conducteur SPL Citerne Hydrocarbures",
    permit: "CE",
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
    name: "Lucas V.",
    role: "Chauffeur SPL Frigo Quotidien",
    permit: "CE",
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
    id: "CH-3101",
    name: "Bastien F.",
    role: "Conducteur Routier SPL Grand Sud",
    permit: "CE",
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
    name: "Nicolas E.",
    role: "Chauffeur Distribution PL",
    permit: "C",
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
    name: "Guillaume H.",
    role: "Conducteur SPL National & Régional",
    permit: "CE",
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
    name: "Romain S.",
    role: "Chauffeur Livreur VUL Messagerie",
    permit: "VUL",
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
    specialties: ["Messagerie Express", "Scan PDA", "Projet permis C en cours"],
    bio: "Livreur expérimenté en tournée urbaine dense (60 à 80 points/jour). Rigueur horaire et connaissance des secteurs d'affaires.",
    verifiedFco: false,
    verifiedChrono: false,
    colorType: "vul",
  },
  {
    id: "CH-3501",
    name: "Yannick M.",
    role: "Conducteur SPL Relais Bretagne",
    permit: "CE",
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
    name: "Erwan K.",
    role: "Conducteur Routier SPL Finistère",
    permit: "CE",
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
    name: "Anthony C.",
    role: "Conducteur SPL Distribution Régionale",
    permit: "CE",
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
    name: "Markus W.",
    role: "Conducteur SPL Transfrontalier",
    permit: "CE",
    city: "Strasbourg",
    zip: "67000",
    department: "67 - Bas-Rhin",
    region: "Grand Est",
    lat: 48.5734,
    lng: 7.7521,
    availability: "immediat",
    availabilityLabel: "Disponible immédiatement",
    mobilityRadius: "Alsace, Lorraine & Allemagne (Bade-Wurtemberg)",
    experienceYears: 17,
    specialties: ["Allemand Bilingue", "ADR Citerne", "Toll Collect", "Liaisons Rhin"],
    bio: "Habitué aux liaisons transfrontalières France-Allemagne. Gestion bilingue des bons de livraison et procédures douanières.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-5701",
    name: "Julien B.",
    role: "Chauffeur PL Porteur TP",
    permit: "C",
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
    name: "Christophe N.",
    role: "Conducteur SPL Conteneur Maritime",
    permit: "CE",
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
    name: "Olivier P.",
    role: "Conducteur SPL Frigo & Vin",
    permit: "CE",
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
    name: "Sébastien V.",
    role: "Conducteur SPL Logistique Centrale",
    permit: "CE",
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
    specialties: ["Tautliner", "Relais Logistique", "Plateforme Saran / Artenay"],
    bio: "Idéalement positionné sur le carrefour logistique orléanais (A10 / A71). Expérience confirmée sur tractions grande distribution.",
    verifiedFco: true,
    verifiedChrono: true,
    colorType: "spl",
  },
  {
    id: "CH-0601",
    name: "Fabrice R.",
    role: "Chauffeur PL Distribution Littoral",
    permit: "C",
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
];

// Projection mathématique des coordonnées GPS vers le canevas SVG 860x780
function projectGpsToSvg(lat: number, lng: number): { x: number; y: number } {
  // Bornes géographiques France métropolitaine
  const minLng = -5.1;
  const maxLng = 9.3;
  const minLat = 42.1;
  const maxLat = 51.3;

  const width = 760;
  const height = 680;
  const offsetX = 50;
  const offsetY = 50;

  const x = ((lng - minLng) / (maxLng - minLng)) * width + offsetX;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height + offsetY;

  return { x: Math.round(x), y: Math.round(y) };
}

// Régions avec chemins stylisés
const FRANCE_REGIONS = [
  { id: "hauts-de-france", name: "Hauts-de-France", d: "M 420,50 L 520,70 L 530,150 L 460,190 L 380,180 L 370,120 Z" },
  { id: "ile-de-france", name: "Île-de-France", d: "M 390,190 L 460,195 L 450,260 L 385,255 Z" },
  { id: "normandie", name: "Normandie", d: "M 230,120 L 370,130 L 385,220 L 260,230 L 210,180 Z" },
  { id: "bretagne", name: "Bretagne", d: "M 50,210 L 210,185 L 230,280 L 130,290 L 60,250 Z" },
  { id: "pays-de-la-loire", name: "Pays de la Loire", d: "M 230,240 L 340,240 L 330,360 L 210,340 Z" },
  { id: "centre-val-de-loire", name: "Centre-Val de Loire", d: "M 340,240 L 440,260 L 420,400 L 330,370 Z" },
  { id: "grand-est", name: "Grand Est", d: "M 470,120 L 710,140 L 730,270 L 580,310 L 470,240 Z" },
  { id: "bourgogne-franche-comte", name: "Bourgogne-Franche-Comté", d: "M 460,270 L 600,290 L 660,370 L 570,440 L 440,390 Z" },
  { id: "nouvelle-aquitaine", name: "Nouvelle-Aquitaine", d: "M 220,360 L 390,380 L 410,540 L 280,640 L 210,480 Z" },
  { id: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", d: "M 430,410 L 580,420 L 650,470 L 590,590 L 450,560 Z" },
  { id: "occitanie", name: "Occitanie", d: "M 300,560 L 460,560 L 520,630 L 460,700 L 330,670 Z" },
  { id: "provence-alpes-cote-d-azur", name: "Provence-Alpes-Côte d'Azur", d: "M 540,540 L 670,540 L 700,640 L 550,650 Z" },
  { id: "corse", name: "Corse", d: "M 740,580 L 770,580 L 775,670 L 745,660 Z" },
];

export default function CarteChauffeursPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<DriverCandidate | null>(CANDIDATES_DATA[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermit, setSelectedPermit] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [hoveredCandidate, setHoveredCandidate] = useState<DriverCandidate | null>(null);

  // Modale contact / recrutement direct
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

  // Filtrage réactif des candidats
  const filteredCandidates = useMemo(() => {
    return CANDIDATES_DATA.filter((c) => {
      // Recherche textuelle (ville, nom, département, région)
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

      // Filtre Permis
      if (selectedPermit !== "all") {
        if (selectedPermit === "CE" && c.permit !== "CE") return false;
        if (selectedPermit === "C" && c.permit !== "C") return false;
        if (selectedPermit === "Porteur" && c.permit !== "Porteur") return false;
        if (selectedPermit === "VUL" && c.permit !== "VUL") return false;
      }

      // Filtre Disponibilité
      if (selectedAvailability !== "all") {
        if (c.availability !== selectedAvailability) return false;
      }

      // Filtre Spécialité
      if (selectedSpecialty !== "all") {
        const hasSpec = c.specialties.some((s) =>
          s.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );
        if (!hasSpec) return false;
      }

      return true;
    });
  }, [searchQuery, selectedPermit, selectedAvailability, selectedSpecialty]);

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
    }, 2500);
  };

  return (
    <div className="carte-page-wrapper">
      {/* 1. Hero En-tête Moderne Pleine Largeur */}
      <section className="chauffeur-hero-section" style={{ paddingBottom: "2rem" }}>
        <div className="container">
          <div className="hero-tag">
            <span className="live-dot" />
            <span>Radar Recrutement France • Données Inscriptions en Temps Réel</span>
          </div>

          <h1 className="hero-title">
            Carte interactive des <span className="hero-title-highlight">Chauffeurs Disponibles</span>
          </h1>

          <p className="hero-subtitle">
            Localisez instantanément les conducteurs routiers (SPL, PL, Porteur, VUL) inscrits sur TruckMatch.
            Filtrez par ville ou village, habilitation ADR, FIMO ou CACES et entrez directement en contact sans intermédiaire.
          </p>

          {/* Bandeau Statistiques Réseau */}
          <div className="map-stats-strip" style={{ marginTop: "2rem" }}>
            <div className="map-stat-card">
              <div className="map-stat-icon-wrap">
                <Truck size={24} />
              </div>
              <div>
                <div className="map-stat-value">1 480</div>
                <div className="map-stat-label">Chauffeurs Inscrits</div>
              </div>
            </div>

            <div className="map-stat-card">
              <div className="map-stat-icon-wrap green">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="map-stat-value">342</div>
                <div className="map-stat-label">Disponibles Immédiatement</div>
              </div>
            </div>

            <div className="map-stat-card">
              <div className="map-stat-icon-wrap navy">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="map-stat-value">98,4%</div>
                <div className="map-stat-label">FCO & Cartes Validées</div>
              </div>
            </div>

            <div className="map-stat-card">
              <div className="map-stat-icon-wrap orange">
                <MapPin size={24} />
              </div>
              <div>
                <div className="map-stat-value">95 Dép.</div>
                <div className="map-stat-label">Couverture Nationale</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filtres Interactifs & Recherche */}
      <div className="container">
        <div className="map-filter-card">
          <div className="map-filter-top-row">
            {/* Barre de recherche par ville / code postal */}
            <div className="map-search-box">
              <Search size={18} color="var(--color-primary)" />
              <input
                type="text"
                placeholder="Rechercher une ville, un village (ex: Lille, Saint-Priest, Fos-sur-Mer, 59, 69)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ background: "transparent", cursor: "pointer", color: "var(--color-text-muted)" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Compteur de candidats trouvés */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-navy)" }}>
              <span className="live-dot" />
              <span>{filteredCandidates.length} chauffeur(s) géolocalisé(s)</span>
            </div>
          </div>

          {/* Filtres par boutons Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
            {/* Permis */}
            <div className="filter-chips-group">
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Permis :</span>
              <button
                type="button"
                className={`filter-chip-btn ${selectedPermit === "all" ? "active" : ""}`}
                onClick={() => setSelectedPermit("all")}
              >
                Tous
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedPermit === "CE" ? "active" : ""}`}
                onClick={() => setSelectedPermit("CE")}
              >
                Permis CE (SPL)
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedPermit === "C" ? "active" : ""}`}
                onClick={() => setSelectedPermit("C")}
              >
                Permis C (Poids Lourd)
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedPermit === "VUL" ? "active" : ""}`}
                onClick={() => setSelectedPermit("VUL")}
              >
                VUL (Messagerie)
              </button>
            </div>

            {/* Disponibilité */}
            <div className="filter-chips-group">
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Disponibilité :</span>
              <button
                type="button"
                className={`filter-chip-btn ${selectedAvailability === "all" ? "active" : ""}`}
                onClick={() => setSelectedAvailability("all")}
              >
                Toutes
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedAvailability === "immediat" ? "active" : ""}`}
                onClick={() => setSelectedAvailability("immediat")}
              >
                ⚡ Immédiate
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedAvailability === "48h" ? "active" : ""}`}
                onClick={() => setSelectedAvailability("48h")}
              >
                Sous 48h
              </button>
            </div>

            {/* Spécialité */}
            <div className="filter-chips-group">
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Spécialité :</span>
              <button
                type="button"
                className={`filter-chip-btn ${selectedSpecialty === "all" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("all")}
              >
                Toutes
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedSpecialty === "ADR" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("ADR")}
              >
                ADR (Matières Dangereuses)
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedSpecialty === "Frigo" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("Frigo")}
              >
                Frigo / Temp. Dirigée
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${selectedSpecialty === "Grue" ? "active" : ""}`}
                onClick={() => setSelectedSpecialty("Grue")}
              >
                CACES Grue R490
              </button>
            </div>
          </div>
        </div>

        {/* 3. Carte de France Interactive & Volet des Candidats */}
        <div className="map-container-grid">
          {/* Bloc Carte SVG */}
          <div className="map-view-card">
            <div className="map-card-head">
              <div className="map-head-title-wrap">
                <h2 className="map-head-title">Carte Interactive de France</h2>
                <p className="map-head-subtitle">
                  Cliquez sur un marqueur de ville ou village pour voir le profil du chauffeur.
                </p>
              </div>

              {/* Légende */}
              <div className="map-legend-pills">
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
                  <span>Spécialité ADR / Frigo / Grue</span>
                </span>
              </div>
            </div>

            {/* Canevas SVG de la Carte de France */}
            <div className="france-svg-wrapper">
              <svg
                viewBox="0 0 860 780"
                className="france-svg-map"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Ombre portée subtile pour les marqueurs */}
                  <filter id="marker-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0b192c" floodOpacity="0.25" />
                  </filter>
                  <linearGradient id="regionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>
                </defs>

                {/* Régions de France (Fonds Vectoriels) */}
                <g className="regions-layer">
                  {FRANCE_REGIONS.map((region) => (
                    <path
                      key={region.id}
                      d={region.d}
                      className="region-path"
                      id={`region-${region.id}`}
                    >
                      <title>{region.name}</title>
                    </path>
                  ))}
                </g>

                {/* Marqueurs Villes / Candidats avec Coordonnées GPS Projetées */}
                <g className="pins-layer">
                  {filteredCandidates.map((candidate) => {
                    const { x, y } = projectGpsToSvg(candidate.lat, candidate.lng);
                    const isSelected = selectedCandidate?.id === candidate.id;
                    const isHovered = hoveredCandidate?.id === candidate.id;

                    // Couleur du marqueur selon type de permis
                    let pinColor = "#0080ff"; // SPL Bleu
                    if (candidate.colorType === "pl") pinColor = "#0b192c"; // PL Navy
                    if (candidate.colorType === "special") pinColor = "#10b981"; // Spécial Vert
                    if (candidate.colorType === "vul") pinColor = "#ea580c"; // VUL Orange

                    return (
                      <g
                        key={candidate.id}
                        className="city-marker-group"
                        transform={`translate(${x}, ${y})`}
                        onClick={() => setSelectedCandidate(candidate)}
                        onMouseEnter={() => setHoveredCandidate(candidate)}
                        onMouseLeave={() => setHoveredCandidate(null)}
                      >
                        {/* Radar Ping Animation si disponible immédiatement */}
                        {candidate.availability === "immediat" && (
                          <circle
                            r="18"
                            fill={pinColor}
                            opacity="0.3"
                            className="city-pin-outer"
                          />
                        )}

                        {/* Cercle principal de la ville */}
                        <circle
                          r={isSelected ? "14" : isHovered ? "12" : "9"}
                          fill={pinColor}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          filter="url(#marker-shadow)"
                          style={{
                            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                            cursor: "pointer",
                          }}
                        />

                        {/* Point central blanc */}
                        <circle
                          r={isSelected ? "5" : "3.5"}
                          fill="#ffffff"
                          style={{ pointerEvents: "none" }}
                        />

                        {/* Nom de la Ville / Village en étiquette */}
                        <g transform="translate(0, -18)">
                          <rect
                            x={-candidate.city.length * 3.8 - 8}
                            y="-11"
                            width={candidate.city.length * 7.6 + 16}
                            height="18"
                            rx="9"
                            fill="#ffffff"
                            filter="url(#marker-shadow)"
                          />
                          <text
                            x="0"
                            y="2"
                            textAnchor="middle"
                            fontSize="9.5"
                            fontWeight="800"
                            fill="#0b192c"
                            style={{ pointerEvents: "none", letterSpacing: "-0.01em" }}
                          >
                            {candidate.city}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Conseils d'utilisation rapides sous la carte */}
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              <span>📍 Les marqueurs représentent des chauffeurs actifs enregistrés dans leur commune de résidence.</span>
              <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>Mise à jour en continu</span>
            </div>
          </div>

          {/* Volet Latéral : Liste & Fiche Détaillée des Candidats */}
          <aside className="candidate-drawer-card">
            <div className="drawer-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className="drawer-title">Profils disponibles ({filteredCandidates.length})</h3>
                <span className="drawer-count-badge">Direct Recruteur</span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--color-text-muted)" }}>
                Sélectionnez un candidat pour examiner son dossier et demander un contact.
              </p>
            </div>

            {/* Liste défilante des candidats filtrés */}
            <div className="drawer-scrollable-list">
              {filteredCandidates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                  <Search size={36} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <p style={{ fontWeight: 700 }}>Aucun chauffeur ne correspond à vos filtres.</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                    Essayez d'élargir votre recherche ou de réinitialiser les filtres.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: "1rem" }}
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedPermit("all");
                      setSelectedAvailability("all");
                      setSelectedSpecialty("all");
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`candidate-compact-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedCandidate(c)}
                    >
                      <div className="candidate-compact-top">
                        <div>
                          <div className="candidate-compact-name">{c.name}</div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)" }}>
                            {c.role} ({c.permit})
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
                        <span style={{ fontSize: "0.78rem", color: "var(--color-text-light)" }}>
                          Expérience : <strong>{c.experienceYears} ans</strong>
                        </span>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenContact(c);
                          }}
                        >
                          <Send size={14} />
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
      </div>

      {/* 4. Pourquoi Recruter Localement sur TruckMatch ? (Section SEO Forte) */}
      <section className="recruiter-seo-section" style={{ marginTop: "4rem" }}>
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-blue">Recrutement Géolocalisé Chauffeur</span>
              <h2>Pourquoi cartographier vos recrutements de conducteurs routiers ?</h2>
              <p>
                Dans le transport et la logistique, la proximité géographique entre le domicile du chauffeur
                et votre dépôt d'exploitation est le critère n°1 de fidélisation et de sécurité routière.
              </p>
            </div>

            <div className="features-grid-3">
              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <MapPin size={24} />
                </div>
                <h3>Zéro fatigue de trajet domicile-travail</h3>
                <p>
                  Un chauffeur qui habite à moins de 25 minutes de sa base logistique commence sa tournée
                  frais et disponible. Vous réduisez le risque d'accidents de trajet et préservez son capital vigilance.
                </p>
              </div>

              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <Clock size={24} />
                </div>
                <h3>Respect optimal de la RSE</h3>
                <p>
                  Grâce à un rayon d'action maîtrisé, vos conducteurs respectent scrupuleusement les amplitudes
                  journalières et temps de repos de 11h consécutives sans être pénalisés par de longs retours au domicile.
                </p>
              </div>

              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <ShieldCheck size={24} />
                </div>
                <h3>Fidélisation durable des équipes</h3>
                <p>
                  Les chauffeurs locaux restent en moyenne 3 fois plus longtemps en poste dans la même entreprise
                  de transport. Vous stabilisez vos plannings de traction et supprimez le turn-over récurrent.
                </p>
              </div>
            </div>

            {/* FAQ Locale */}
            <div className="seo-faq-grid" style={{ marginTop: "2.5rem" }}>
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment sont vérifiées les coordonnées des chauffeurs ?</h3>
                <p className="seo-faq-a">
                  Lors de son inscription sur TruckMatch, chaque conducteur renseigne sa commune de résidence
                  et son code postal. Ces informations sont confrontées aux justificatifs de domicile et permis
                  de conduire lors de la vérification de la Carte Chrono et de la FCO pour garantir une localisation authentique.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Puis-je recruter un conducteur pour du découché ou du grand routier ?</h3>
                <p className="seo-faq-a">
                  Oui. Sur chaque fiche de conducteur, le rayon de mobilité est explicitement précisé (ex : retour
                  chaque soir, national avec découchés hebdomadaires, ou tractions inter-régionales). Vous filtrez selon
                  vos exigences d'exploitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modale de Contact Direct Chauffeur */}
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

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
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
                {selectedCandidate.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-navy)" }}>
                  Contacter {selectedCandidate.name}
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
                  Demande de contact transmise !
                </h4>
                <p style={{ fontSize: "0.88rem", color: "#047857" }}>
                  Votre proposition d'embauche a été notifiée à {selectedCandidate.name}. Le candidat vous
                  recontactera par téléphone ou email dans un délai moyen de 2 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Nom de votre entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Transports Dubois"
                      value={modalForm.companyName}
                      onChange={(e) => setModalForm({ ...modalForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-field-modern">
                    <label>Votre Nom & Fonction *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Marc L., Exploitant"
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
                      placeholder="Ex: recrutement@transports-dubois.fr"
                      value={modalForm.email}
                      onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Type de contrat proposé</label>
                    <select
                      value={modalForm.contractType}
                      onChange={(e) => setModalForm({ ...modalForm, contractType: e.target.value })}
                    >
                      <option value="CDI">Contrat à Durée Indéterminée (CDI)</option>
                      <option value="CDD">Contrat à Durée Déterminée (CDD)</option>
                      <option value="Saisonnier">Mission Saisonnière / Renfort</option>
                      <option value="Relais">Traction ponctuelle / Relais</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Démarrage souhaité</label>
                    <input type="text" placeholder="Ex: Dès que possible ou sous 15 jours" />
                  </div>
                </div>

                <div className="form-field-modern">
                  <label>Message ou détails du poste (facultatif)</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Nous cherchons un conducteur SPL pour liaison régionale de nuit au départ de notre agence..."
                    value={modalForm.message}
                    onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                  />
                </div>

                <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary btn-lg w-full">
                    <Send size={18} />
                    <span>Envoyer ma proposition de recrutement</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.76rem", color: "var(--color-text-light)", textAlign: "center" }}>
                  🔒 Contact direct et confidentiel. Vos coordonnées ne sont transmises qu'au candidat ciblé.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
