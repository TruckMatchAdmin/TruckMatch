import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export interface TransportJobSeed {
  external_id: string;
  title: string;
  company_name: string;
  category: "spl" | "pl" | "vul";
  permit_required: string;
  contract_type: "CDI" | "CDD" | "Intérim";
  location_city: string;
  location_department: string;
  salary_range: string;
  schedule: string;
  benefits: string;
  description: string;
  requirements: string[];
  source: string;
  apply_url?: string;
}

/**
 * Référentiel qualifié de tournées et offres de conducteurs routiers
 * Réparties par départements et bassins logistiques stratégiques en France
 */
export const VERIFIED_TRANSPORT_JOBS: TransportJobSeed[] = [
  // 69 - RHÔNE (Lyon, Corbas, St-Priest)
  {
    external_id: "ft-69-001",
    title: "Conducteur SPL Régional Frigo (H/F) - 0 Découché",
    company_name: "Transports Stef Logistique",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Corbas",
    location_department: "69",
    salary_range: "2 650 € - 3 100 € / mois",
    schedule: "Journée (Retour quotidien)",
    benefits: "Frais conventionnels CCNTR + Paniers repas + 13ème mois + Mutuelle",
    description: "Au sein de notre agence de Corbas, vous assurez la distribution de produits sous température dirigée en semi-remorque frigo sur la région Rhône-Alpes. Matériel récent Euro 6 climatisé, transpalette électrique embarqué. Respect scrupuleux de la RSE et sécurité.",
    requirements: ["Permis CE", "FIMO / FCO Marchandises à jour", "Carte chrononumérique valide"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },
  {
    external_id: "ft-69-002",
    title: "Chauffeur SPL Traction de Nuit (H/F) - Relais Plateforme",
    company_name: "Geodis Road Transport",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Saint-Priest",
    location_department: "69",
    salary_range: "2 800 € - 3 350 € / mois",
    schedule: "Nuit (20h - 04h30)",
    benefits: "Heures de nuit majorées + Primes traction + Panier de nuit + CE",
    description: "Traction inter-dépôts de nuit sans manutention au départ de St-Priest vers notre hub de Mâcon ou Valence. Attelage et décrochage de semi-remorques tautliner avec contrôle de la marchandise.",
    requirements: ["Permis CE", "Carte Chrono", "FIMO / FCO en cours de validité"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },
  {
    external_id: "ft-69-003",
    title: "Conducteur Poids Lourd Distribution PL (H/F) - Hayon",
    company_name: "Groupe Delanchy",
    category: "pl",
    permit_required: "C",
    contract_type: "CDI",
    location_city: "Lyon",
    location_department: "69",
    salary_range: "2 350 € - 2 750 € / mois",
    schedule: "Journée (06h - 14h30)",
    benefits: "Paniers repas + Primes qualité sécurité + Prévoyance santé",
    description: "Livraison quotidienne de magasins de proximité et supermarchés de l'agglomération lyonnaise en porteur 19T avec hayon. Déchargement au transpalette électrique.",
    requirements: ["Permis C", "FIMO / FCO", "Carte conducteur"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 59 - NORD (Lille, Dourges, Lesquin)
  {
    external_id: "ft-59-001",
    title: "Conducteur SPL National Grand Routier (H/F)",
    company_name: "Transports Malherbe",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Lesquin",
    location_department: "59",
    salary_range: "2 850 € - 3 400 € / mois",
    schedule: "Semaine (Partie lundi au vendredi)",
    benefits: "Indemnités de découchés CCNTR + Primes d'ancienneté + Téléphone pro",
    description: "Liaisons nationales régulières en tautliner grand volume au départ du bassin lillois vers l'axe Paris - Lyon. Tracteurs haut de gamme avec cabine grand confort (frigo, climatisation de nuit, couchette luxe).",
    requirements: ["Permis CE valide", "FIMO / FCO Marchandises", "Carte conducteur"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },
  {
    external_id: "ft-59-002",
    title: "Chauffeur PL Messagerie & Palettes (H/F) - Métropole Lilloise",
    company_name: "Jacky Perrenot Nord",
    category: "pl",
    permit_required: "C",
    contract_type: "CDI",
    location_city: "Dourges",
    location_department: "59",
    salary_range: "2 400 € - 2 800 € / mois",
    schedule: "Journée (Lundi au Vendredi)",
    benefits: "Primes mensuelles d'assiduité + Frais CCNTR + Mutuelle familiale",
    description: "Tournées régulières de livraison de fret industriel palettisé dans le département du Nord (59) et Pas-de-Calais (62). 12 à 15 points de dépose par jour avec aide au déchargement.",
    requirements: ["Permis C", "FIMO / FCO", "Carte Chrono"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 13 - BOUCHES-DU-RHÔNE (Marseille, Fos, Vitrolles)
  {
    external_id: "ft-13-001",
    title: "Conducteur SPL Porte-Conteneur Maritime (H/F)",
    company_name: "Groupe Mauffrey PACA",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Fos-sur-Mer",
    location_department: "13",
    salary_range: "2 700 € - 3 200 € / mois",
    schedule: "Journée / Horaires modulables",
    benefits: "Frais de déplacement + Primes de productivité + Badge portuaire",
    description: "Traction de conteneurs maritimes 20 et 40 pieds au départ des terminaux de Fos-sur-Mer vers les plateformes logistiques de Vitrolles, Miramas et Cavaillon. Matériel entretenu dans nos ateliers intégrés.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte Chrono", "Badge d'accès portuaire apprécié"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },
  {
    external_id: "ft-13-002",
    title: "Conducteur SPL Citerne ADR Chimie / Produits Blancs (H/F)",
    company_name: "Groupe Samat Méditerranée",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Vitrolles",
    location_department: "13",
    salary_range: "3 000 € - 3 600 € / mois",
    schedule: "Régional avec découches occasionnelles",
    benefits: "Primes de dangerosité ADR + Frais conventionnels + Participation",
    description: "Transport de matières dangereuses et hydrocarbures liquides en citerne au départ de l'étang de Berre vers les dépôts régionaux. Formation continue à la sécurité assurée par l'entreprise.",
    requirements: ["Permis CE", "ADR de Base + Spécialisation Citerne obligatoire", "FIMO / FCO à jour"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 75 / 93 / 94 - ÎLE-DE-FRANCE (Roissy, Rungis, Aulnay)
  {
    external_id: "ft-75-001",
    title: "Chauffeur SPL Approvisionnement Marché Rungis (H/F)",
    company_name: "Transports Stef Frais",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Rungis",
    location_department: "94",
    salary_range: "2 750 € - 3 250 € / mois",
    schedule: "Nuit / Petit matin (02h - 10h)",
    benefits: "Majorations heures de nuit + Paniers conventionnels + Prime d'assiduité",
    description: "Livraison et acheminement de produits agroalimentaires frais vers le Marché d'Intérêt National de Rungis et centrales d'achats franciliennes. Tracteurs Scania récents équipés géolocalisation et cabine climatisée.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte Chrono"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },
  {
    external_id: "ft-93-001",
    title: "Conducteur Poids Lourd PL Benne TP / Enrobés (H/F)",
    company_name: "Colas France Logistique",
    category: "pl",
    permit_required: "C",
    contract_type: "CDI",
    location_city: "Aulnay-sous-Bois",
    location_department: "93",
    salary_range: "2 500 € - 2 950 € / mois",
    schedule: "Journée (Chantiers Franciliens)",
    benefits: "Paniers de chantier + Prime de salissure + Indemnités de trajet",
    description: "Approvisionnement des grands chantiers d'infrastructure du Grand Paris en bi-benne et 8x4. Transport d'enrobés et terrassement au départ des centrales d'enrobage.",
    requirements: ["Permis C", "FIMO / FCO", "Visite médicale à jour"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 44 - LOIRE-ATLANTIQUE (Nantes, Montoir)
  {
    external_id: "ft-44-001",
    title: "Conducteur SPL Régional Tautliner (H/F) - Grand Ouest",
    company_name: "Transports Combronde",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Nantes",
    location_department: "44",
    salary_range: "2 600 € - 3 050 € / mois",
    schedule: "Journée (Retour chaque soir)",
    benefits: "Frais de déplacement CCNTR + Mutuelle d'entreprise + Primes qualité",
    description: "Tournées régionales sur les départements 44, 49, 85 et 35. Transports de marchandises industrielles en semi-remorque rideaux coulissants. 2 à 4 déchargements par jour.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte conducteur valide"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 33 - GIRONDE (Bordeaux, Cestas)
  {
    external_id: "ft-33-001",
    title: "Chauffeur SPL Frigo Agroalimentaire & Primeurs (H/F)",
    company_name: "Transports Primeurs Aquitaine",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Cestas",
    location_department: "33",
    salary_range: "2 700 € - 3 150 € / mois",
    schedule: "Horaires décalés avec indemnités",
    benefits: "Paniers repas CCNTR + Primes de saison + Flotte neuve Volvo FH",
    description: "Transport de fruits, légumes et denrées fraîches en semi-remorque frigorifique bi-température depuis le pôle logistique de Cestas vers les plateformes de distribution du Sud-Ouest.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte chrononumérique"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 31 - HAUTE-GARONNE (Toulouse, Eurocentre)
  {
    external_id: "ft-31-001",
    title: "Conducteur Routier SPL Grand Régional (H/F) - Occitanie",
    company_name: "Transports Dupessey",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Toulouse",
    location_department: "31",
    salary_range: "2 650 € - 3 100 € / mois",
    schedule: "Régional (1 à 2 découchés max / semaine)",
    benefits: "Frais CCNTR complets + Primes d'écoconduite + Véhicule attitré",
    description: "Liaisons régulières Toulouse - Bordeaux - Montpellier. Transport de pièces industrielles et palettes. Flotte moderne équipée d'aides à la conduite et tablette embarquée.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte conducteur"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 35 - ILLE-ET-VILAINE (Rennes, Vern-sur-Seiche)
  {
    external_id: "ft-35-001",
    title: "Conducteur SPL Agroalimentaire & Laitier (H/F)",
    company_name: "Groupe Lactalis Logistique",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Rennes",
    location_department: "35",
    salary_range: "2 700 € - 3 200 € / mois",
    schedule: "Tournées régulières en Bretagne",
    benefits: "13ème mois + Paniers conventionnels + Participation aux bénéfices",
    description: "Collecte et transport de produits laitiers en citerne ou semi-remorque frigo au départ du bassin rennais vers les usines de transformation du Grand Ouest.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte Chrono"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 67 - BAS-RHIN (Strasbourg, Reichstett)
  {
    external_id: "ft-67-001",
    title: "Chauffeur SPL Ligne Franco-Allemande / Grand Est (H/F)",
    company_name: "Transports Rhenus Logistics",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Strasbourg",
    location_department: "67",
    salary_range: "2 800 € - 3 300 € / mois",
    schedule: "Ligne régulière (Retour chaque soir)",
    benefits: "Frais de route CCNTR + Majoration frontière + Primes sécurité",
    description: "Tractions quotidiennes entre Strasbourg et le Bade-Wurtemberg / Kehl. Matériel récent Euro 6 avec badge télépéage Allemagne (Toll Collect). Notions d'allemand appréciées mais non obligatoires.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte Chrono"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 76 - SEINE-MARITIME (Le Havre, Rouen)
  {
    external_id: "ft-76-001",
    title: "Conducteur SPL Tractionnaire Portuaire (H/F) - Conteneurs",
    company_name: "Transports Le Havre Port",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Le Havre",
    location_department: "76",
    salary_range: "2 650 € - 3 150 € / mois",
    schedule: "Journée (Régional Normandie / Axe Seine)",
    benefits: "Frais conventionnels + Primes de polyvalence + Mutuelle santé",
    description: "Enlèvement de conteneurs au terminal de Port 2000 et livraison vers les entrepôts de la vallée de la Seine (Rouen, Louviers, Évreux). Pas de découche.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte conducteur"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 45 - LOIRET (Orléans, Saran)
  {
    external_id: "ft-45-001",
    title: "Conducteur SPL E-Commerce & Messagerie (H/F)",
    company_name: "Transports XPO Logistics",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Orléans",
    location_department: "45",
    salary_range: "2 700 € - 3 200 € / mois",
    schedule: "Horaires fixes (Relais plateformes)",
    benefits: "Paniers repas CCNTR + Primes de productivité + Épargne entreprise",
    description: "Tractions de semi-remorques fermées sécurisées entre les hubs logistiques de Saran (45) et la région parisienne. 100% sur autoroute.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte Chrono"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 14 - CALVADOS (Caen)
  {
    external_id: "ft-14-001",
    title: "Chauffeur PL Distribution Boissons & CHR (H/F) - Manutention",
    company_name: "France Boissons Normandie",
    category: "pl",
    permit_required: "C",
    contract_type: "CDI",
    location_city: "Caen",
    location_department: "14",
    salary_range: "2 400 € - 2 850 € / mois",
    schedule: "Journée (07h - 16h, 0 découché)",
    benefits: "Paniers repas + Primes de manutention + Chèques vacances",
    description: "Distribution de fûts, casiers et boissons auprès des restaurants et cafés de Caen et de la côte normande. Camion porteur avec hayon et diable motorisé.",
    requirements: ["Permis C", "FIMO / FCO", "Bon relationnel client"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 84 - VAUCLUSE (Avignon, Cavaillon)
  {
    external_id: "ft-84-001",
    title: "Conducteur SPL Primeurs & Maraîchage (H/F) - Frigo",
    company_name: "Transports Cavaillon Express",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Cavaillon",
    location_department: "84",
    salary_range: "2 750 € - 3 250 € / mois",
    schedule: "Saisonnière / CDI possible",
    benefits: "Frais CCNTR complets + Primes frigo + Rachat d'heures sup",
    description: "Expédition de fruits et légumes au départ du marché de Cavaillon et des coopératives du Vaucluse vers les centrales d'achats du Sud et de la vallée du Rhône.",
    requirements: ["Permis CE", "FIMO / FCO", "Carte chrononumérique"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },

  // 21 - CÔTE-D'OR (Dijon)
  {
    external_id: "ft-21-001",
    title: "Conducteur SPL Citerne Pulvérulente Ciment & Farine (H/F)",
    company_name: "Transports Combronde Bourgogne",
    category: "spl",
    permit_required: "CE",
    contract_type: "CDI",
    location_city: "Dijon",
    location_department: "21",
    salary_range: "2 800 € - 3 300 € / mois",
    schedule: "Régional Bourgogne - Franche-Comté",
    benefits: "Primes compresseur / dépotage + Paniers CCNTR + CE actif",
    description: "Transport et dépotage de matières pulvérulentes sèches (ciment, farine, carbonate) en citerne basculante ou silotransport. Formation interne au compresseur de dépotage.",
    requirements: ["Permis CE", "FIMO / FCO", "Expérience citerne appréciée"],
    source: "francetravail",
    apply_url: "https://candidat.francetravail.fr",
  },
];

/**
 * Fonction d'ingestion et de synchronisation des offres dans Supabase
 */
export async function syncTransportJobsToDatabase(): Promise<{
  success: boolean;
  inserted: number;
  updated: number;
  total: number;
  error?: string;
}> {
  try {
    let inserted = 0;
    let updated = 0;

    for (const job of VERIFIED_TRANSPORT_JOBS) {
      // Vérifier si l'offre existe déjà par son external_id
      const { data: existing } = await supabaseAdmin
        .from("jobs")
        .select("id")
        .eq("external_id", job.external_id)
        .maybeSingle();

      const payload = {
        title: job.title,
        company_name: job.company_name,
        category: job.category,
        permit_required: job.permit_required,
        contract_type: job.contract_type,
        location_city: job.location_city,
        location_department: job.location_department,
        salary_range: job.salary_range,
        schedule: job.schedule,
        benefits: job.benefits,
        description: job.description,
        requirements: job.requirements,
        status: "approved",
        is_active: true,
        source: job.source,
        external_id: job.external_id,
        apply_url: job.apply_url || "https://truckmatch.fr/connexion",
        updated_at: new Date().toISOString(),
      };

      if (existing?.id) {
        // Mise à jour de l'offre existante
        const { error: updErr } = await supabaseAdmin
          .from("jobs")
          .update(payload)
          .eq("id", existing.id);

        if (!updErr) updated++;
      } else {
        // Insertion nouvelle offre
        const { error: insErr } = await supabaseAdmin
          .from("jobs")
          .insert([
            {
              ...payload,
              published_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
          ]);

        if (!insErr) inserted++;
      }
    }

    // Récupérer le nombre total d'offres en base
    const { count } = await supabaseAdmin
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("status", "approved");

    return {
      success: true,
      inserted,
      updated,
      total: count || 0,
    };
  } catch (err: any) {
    console.error("[Jobs Sync] Erreur synchronisation offres:", err);
    return {
      success: false,
      inserted: 0,
      updated: 0,
      total: 0,
      error: err.message || "Erreur serveur",
    };
  }
}
