"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { JobOffer } from "@/lib/types";
import { PartnerMarquee } from "@/components/ui/PartnerMarquee";
import {
  Briefcase,
  MapPin,
  Building,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  DollarSign,
  UserCheck,
  Building2,
  Calendar,
} from "lucide-react";

export default function OffresEmploiPage() {
  const [dbJobs, setDbJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedContract, setSelectedContract] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const seoTags = [
    { label: "Chauffeur SPL Régional CDI", href: "/chauffeurs/spl" },
    { label: "Conducteur PL Distribution", href: "/chauffeurs/pl" },
    { label: "Traction de Nuit Relais", href: "/offres-emploi" },
    { label: "Porteur TP & Grue R490", href: "/chauffeurs/porteur" },
    { label: "Habilitation ADR Citerne", href: "/conseils/chauffeur-spl-competences-et-qualifications" },
    { label: "Frigo Agroalimentaire", href: "/offres-emploi" },
    { label: "CDI Transport Routier", href: "/offres-emploi" },
    { label: "Salaires & Paniers Repas", href: "/chauffeurs#salaires-transport" },
  ];

  // Offres de transport de référence qualifiées (affichées pour enrichir le référencement naturel et guider les candidats)
  const defaultJobOffers = [
    {
      id: "ref-spl-59",
      title: "Conducteur Routier SPL — Tractions Régionales",
      company: "Transports Dubois & Logistique",
      city: "Lille",
      dept: "59",
      category: "spl",
      contract: "CDI",
      salary: "2 600 € — 3 100 € net / mois",
      frais: "Paniers repas conventionnés + primes de non-accident",
      schedule: "Retour domicile chaque soir",
      desc: "Recherche conducteur SPL pour tractions semi-remorque Tautliner sur les axes Hauts-de-France et Belgique limitrophe. Matériel récent Euro 6, respect scrupuleux de la RSE et des temps de repos.",
      badges: ["Permis CE", "FCO Valide", "Carte Chrono", "Tautliner"],
    },
    {
      id: "ref-pl-69",
      title: "Chauffeur Distribution PL — Messagerie Palettes",
      company: "Rhône Alpes Fret Express",
      city: "Lyon / Saint-Priest",
      dept: "69",
      category: "pl",
      contract: "CDI",
      salary: "2 150 € — 2 600 € net / mois",
      frais: "Paniers repas journaliers inclus",
      schedule: "Horaires de journée réguliers (7h - 16h)",
      desc: "Livraisons et ramasses régulières de 15 à 20 points sur l'agglomération lyonnaise. Porteur 19T récent avec hayon élévateur et transpalette électrique. Tournée sectorisée fixe.",
      badges: ["Permis C", "FIMO / FCO", "Hayon élévateur", "Journée"],
    },
    {
      id: "ref-spl-35",
      title: "Conducteur SPL Ligne & Relais de Nuit",
      company: "Traction Ouest Messagerie",
      city: "Rennes",
      dept: "35",
      category: "spl",
      contract: "CDI",
      salary: "2 850 € — 3 350 € net / mois",
      frais: "Majoration de nuit + repas unique + découché éventuel",
      schedule: "Horaires réguliers de nuit (21h - 5h)",
      desc: "Traction inter-plateformes logistiques Bretagne — Normandie / Île-de-France. Attelage et décrochage rapide de semi fourgon, aucune manutention de charge, confort cabine optimal.",
      badges: ["Permis CE", "ADR de base", "Liaison Nuit", "Zéro manutention"],
    },
    {
      id: "ref-tp-38",
      title: "Chauffeur Porteur Grue Auxiliaire R490 & Benne TP",
      company: "Matériaux Dauphiné Travaux",
      city: "Grenoble",
      dept: "38",
      category: "porteur",
      contract: "CDI",
      salary: "2 300 € — 2 800 € net / mois",
      frais: "Prime de technicité CACES + paniers BTP",
      schedule: "Retour domicile chaque soir",
      desc: "Approvisionnement de chantiers en matériaux et enrochement. Porteur 6x4 et 8x4 équipé d'une grue auxiliaire de manutention télécommandée. Chauffeur autonome et rigoureux sur la sécurité.",
      badges: ["Permis C", "CACES Grue R490", "Benne TP", "Carte BTP"],
    },
    {
      id: "ref-vul-75",
      title: "Chauffeur Livreur VUL — Distribution Express",
      company: "Île-de-France Express Logistique",
      city: "Paris / Roissy CDG",
      dept: "93",
      category: "vul",
      contract: "CDD / CDI",
      salary: "1 800 € — 2 200 € net / mois",
      frais: "Primes assiduité & qualité",
      schedule: "Du lundi au vendredi",
      desc: "Tournées de livraison de colis express sur le nord francilien au départ du hub aéroportuaire. Véhicule utilitaire récent fourni (Iveco Daily 14m3). Possibilité d'évolution permis C.",
      badges: ["Permis B", "Messagerie", "Smartphone pro fourni"],
    },
  ];

  useEffect(() => {
    async function loadJobs() {
      try {
        let query = supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;
        if (error || !data) {
          setDbJobs([]);
        } else {
          setDbJobs(data as any[]);
        }
      } catch {
        setDbJobs([]);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [selectedCategory]);

  // Fusion intelligente : offres réelles Supabase (approuvées) + offres de référence transport
  const allAvailableOffers = [
    ...dbJobs.map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company_name,
      city: j.location_city,
      dept: j.location_department,
      category: j.category,
      contract: j.contract_type,
      salary: j.salary_range || "Selon convention CCNTR",
      frais: j.benefits || "Frais conventionnels inclus",
      schedule: j.schedule || "Temps plein",
      desc: j.description,
      badges: [
        `Permis ${j.permit_required || (j.category ? j.category.toUpperCase() : "CE")}`,
        j.contract_type,
        ...(Array.isArray(j.requirements) ? j.requirements.slice(0, 2) : []),
      ].filter(Boolean),
    })),
    ...defaultJobOffers,
  ];

  const filteredJobs = allAvailableOffers.filter((j) => {
    // Filtre catégorie
    if (selectedCategory !== "all" && j.category !== selectedCategory) {
      return false;
    }
    // Filtre contrat
    if (selectedContract !== "all" && !j.contract.toLowerCase().includes(selectedContract.toLowerCase())) {
      return false;
    }
    // Filtre texte
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.city.toLowerCase().includes(q) ||
      j.dept.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="jobs-page-modern">
      {/* 1. Hero Recrutement Offres d'emploi */}
      <section className="recruiter-hero-section">
        <div className="container">
          <div className="recruiter-hero-grid">
            <div className="recruiter-hero-content">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                <span>Bourse d'Emploi Transport Routier • CDI, CDD, Tractions</span>
              </div>

              <h1 className="hero-title">
                Offres d'emploi conducteurs &
                <span className="hero-title-highlight">chauffeurs routiers qualifiés</span>
              </h1>

              <p className="hero-subtitle">
                Postulez directement auprès des entreprises de transport et logistique. CDI, CDD, tractions
                de nuit et missions régionales vérifiées, sans intermédiaire ni commission d'agence d'intérim.
              </p>

              <div className="hero-cta-group">
                <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                  <UserCheck size={17} />
                  <span>Créer mon profil pour être chassé</span>
                </Link>
                <Link href="/entreprises" className="btn btn-outline btn-lg">
                  <Building2 size={17} />
                  <span>Publier une offre de recrutement</span>
                </Link>
              </div>

              {/* Mots-clés SEO interactifs */}
              <div className="hero-seo-pills">
                <span className="seo-pill-label">Recherches ciblées :</span>
                {seoTags.map((tag, i) => (
                  <Link key={i} href={tag.href} className="seo-pill">
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Colonne droite : Visuel Bourse d'Emploi & Recrutement Routier */}
            <div className="recruiter-hero-visual">
              <div className="recruiter-image-card">
                <Image
                  src="/images/hero-offres-emploi.png"
                  alt="Bourse d'emploi conducteurs et chauffeurs routiers qualifiés - TruckMatch"
                  width={1024}
                  height={369}
                  priority
                  className="recruiter-main-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bannière Défilante Partenaires (Ils nous font déjà confiance) */}
      <PartnerMarquee />

      {/* 2. Moteur de Recherche & Filtres Rapides */}
      <section className="jobs-filter-section">
        <div className="container">
          <div className="jobs-filter-box">
            <div className="filter-header-wrap">
              <h2 className="filter-title">Rechercher parmi les offres d'emploi disponibles</h2>
              <p className="filter-subtitle">
                Filtrez par type de permis, ville, département ou nature de contrat de transport.
              </p>
            </div>

            <div className="jobs-search-row">
              <div className="jobs-search-input-wrap">
                <Search size={18} className="jobs-search-ico" />
                <input
                  type="text"
                  placeholder="Métier (SPL, PL, Grue), ville, département (59, 69...)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="jobs-text-input"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="jobs-select-field"
                >
                  <option value="all">Tous les permis (SPL, PL, VUL)</option>
                  <option value="spl">Conducteur SPL (Permis CE)</option>
                  <option value="pl">Chauffeur PL (Permis C)</option>
                  <option value="porteur">Porteur / Grue TP</option>
                  <option value="vul">Livreur VUL (Permis B)</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="jobs-select-field"
                >
                  <option value="all">Tous les contrats</option>
                  <option value="cdi">Contrat CDI</option>
                  <option value="cdd">Contrat CDD</option>
                  <option value="relais">Tractions de nuit / Relais</option>
                </select>
              </div>
            </div>

            <div className="filter-tags-quick">
              <span className="quick-tag-label">Filtres rapides :</span>
              <button
                type="button"
                className={`quick-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Toutes les offres ({filteredJobs.length})
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${selectedCategory === "spl" ? "active" : ""}`}
                onClick={() => setSelectedCategory("spl")}
              >
                Chauffeurs SPL
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${selectedCategory === "pl" ? "active" : ""}`}
                onClick={() => setSelectedCategory("pl")}
              >
                Chauffeurs PL
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${selectedCategory === "porteur" ? "active" : ""}`}
                onClick={() => setSelectedCategory("porteur")}
              >
                Porteurs & TP
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${selectedCategory === "vul" ? "active" : ""}`}
                onClick={() => setSelectedCategory("vul")}
              >
                Livreurs VUL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Liste des Offres d'Emploi */}
      <section className="jobs-list-section">
        <div className="container">
          <div className="jobs-list-grid">
            {filteredJobs.length === 0 ? (
              <div className="job-card-modern text-center" style={{ padding: "4rem 2rem" }}>
                <Briefcase size={44} style={{ color: "var(--color-primary)", margin: "0 auto 1.25rem" }} />
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-navy)", marginBottom: "0.5rem" }}>
                  Aucune offre ne correspond exactement à votre recherche
                </h3>
                <p style={{ color: "var(--color-text-muted)", maxWidth: "550px", margin: "0 auto 1.75rem" }}>
                  Essayez d'élargir vos filtres ou créez votre profil chauffeur pour recevoir des propositions
                  directes dès qu'un poste se libère sur votre secteur.
                </p>
                <div className="btn-group" style={{ justifyContent: "center" }}>
                  <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedContract("all"); }} className="btn btn-outline btn-lg">
                    <span>Réinitialiser les filtres</span>
                  </button>
                  <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                    <UserCheck size={18} />
                    <span>Créer mon profil chauffeur</span>
                  </Link>
                </div>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="job-card-modern">
                  <div className="job-card-top-row">
                    <div className="job-card-title-group">
                      <Link href={`/contact?job=${encodeURIComponent(job.title)}`} className="job-title-link">
                        {job.title}
                      </Link>
                      <div className="job-company-location">
                        <span className="job-meta-item">
                          <Building size={16} style={{ color: "var(--color-primary)" }} />
                          <strong>{job.company}</strong>
                        </span>
                        <span className="job-meta-item">
                          <MapPin size={16} />
                          <span>{job.city} ({job.dept})</span>
                        </span>
                        <span className="job-meta-item">
                          <Calendar size={16} />
                          <span>{job.schedule}</span>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className="badge badge-navy">{job.contract}</span>
                      <span className="badge badge-blue">{job.category.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="job-badges-bar">
                    {job.badges.map((b, idx) => (
                      <span key={idx} className="permit-pill-modern">
                        <CheckCircle2 size={12} style={{ color: "var(--color-primary)" }} />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>

                  <p className="job-desc-snippet">{job.desc}</p>

                  <div className="job-card-bottom-bar">
                    <div className="job-salary-display">
                      <p className="job-salary-main">{job.salary}</p>
                      <p className="job-salary-sub">{job.frais}</p>
                    </div>

                    <div className="job-actions-wrap">
                      <Link href={`/contact?job=${encodeURIComponent(job.title)}`} className="btn btn-primary btn-sm">
                        <span>Postuler en direct</span>
                        <ArrowRight size={14} />
                      </Link>
                      <Link href={`/contact?job=${encodeURIComponent(job.title)}`} className="btn btn-outline btn-sm">
                        <span>Demander des infos</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Bannière Alerte Emploi & Candidature Spontanée */}
      <section className="job-alert-section">
        <div className="container">
          <div className="job-alert-banner">
            <div>
              <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>Alerte Emploi Pro</span>
              <h2 className="job-alert-title">Vous ne trouvez pas votre route idéale ?</h2>
              <p className="job-alert-desc">
                Des dizaines d'entreprises de transport cherchent des conducteurs sans publier d'annonces
                publiques. Créez votre profil en 2 minutes : les exploitants transport de votre région
                vous contactent directement avec des propositions de CDI sur-mesure.
              </p>
            </div>

            <div className="btn-group" style={{ justifyContent: "flex-end" }}>
              <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                <UserCheck size={18} />
                <span>Créer mon profil candidat gratuit</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Guide Recrutement & FAQ Offres d'Emploi Transport (SEO Boost) */}
      <section className="recruiter-seo-section">
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-navy">Conseils Emploi Transport</span>
              <h2>Comment décrocher le meilleur poste de chauffeur routier ?</h2>
              <p>
                Conseils d'experts pour valoriser vos compétences, comprendre votre contrat de travail et optimiser vos revenus sur la route.
              </p>
            </div>

            <div className="seo-faq-grid">
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Pourquoi choisir le recrutement direct plutôt que l'intérim ?</h3>
                <p className="seo-faq-a">
                  L'embauche directe en CDI ou CDD auprès d'un transporteur vous garantit une stabilité
                  professionnelle, un matériel de transport attitré, ainsi que la participation aux accords
                  d'entreprise (intéressement, mutuelle de groupe performante). De plus, vous construisez
                  une relation de confiance avec votre exploitant sans dépendre de contrats renouvelés chaque semaine.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment sont calculés les frais de déplacement sur les offres ?</h3>
                <p className="seo-faq-a">
                  Dans le transport routier de marchandises, les indemnités forfaitaires de déplacement
                  (CCNTR) viennent s'ajouter au salaire brut de base. Elles comprennent l'indemnité de repas
                  de jour (~15,96 €), le repas unique de nuit (~9,54 €) et l'indemnité de grand déplacement
                  avec découché (~50,16 €). Ces montants sont nets d'impôts et non soumis aux cotisations sociales.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Peut-on postuler si sa FCO arrive à échéance prochainement ?</h3>
                <p className="seo-faq-a">
                  Oui, la plupart des entreprises de transport organisent et financent elles-mêmes le
                  renouvellement de votre FCO Marchandises via leur budget de formation continue OPCO Mobilités
                  lors de votre prise de poste. Mentionnez simplement la date d'échéance de votre CQC lors de
                  votre candidature.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Quelles sont les opportunités pour les conducteurs débutants ?</h3>
                <p className="seo-faq-a">
                  De nombreux transporteurs proposent des postes en distribution régionale PL ou en relais
                  guidé pour les nouveaux diplômés des titres professionnels (Titre Pro Porteur ou Tous Véhicules).
                  Ces postes permettent d'acquérir une première expérience sur des tournées balisées avant de
                  basculer vers le grand routier ou les tractions spécialisées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
