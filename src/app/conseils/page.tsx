"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ARTICLES } from "@/lib/constants/articles";
import {
  Clock,
  ArrowRight,
  BookOpen,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award,
  Truck,
  Building2,
  UserPlus,
  HelpCircle,
  FileText,
  Compass,
  AlertCircle,
  Scale,
  Sparkles,
  MapPin,
  X,
} from "lucide-react";

export default function ConseilsHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filtrage réactif des articles
  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((art) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.category_label.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedCategory !== "all" && art.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  const featuredArticle = ARTICLES[0]; // Article phare SPL

  // Données structurées SEO Google (FAQPage + BreadcrumbList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://truckmatch.fr"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Conseils & Recrutement Transport",
            "item": "https://truckmatch.fr/conseils"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Quelles sont les qualifications obligatoires pour recruter un chauffeur SPL en France ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le conducteur doit être titulaire du permis CE valide, d'une FIMO ou FCO Marchandises à jour (renouvelée tous les 5 ans), d'une carte conducteur numérique pour le chronotachygraphe et d'une visite médicale d'aptitude périodique."
            }
          },
          {
            "@type": "Question",
            "name": "Quelles sont les règles de repos imposées par la Règlementation Sociale Européenne (RSE) ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La RSE impose une coupure de 45 minutes après 4h30 de conduite continue. La conduite journalière maximale est de 9h (pouvant être portée à 10h deux fois par semaine). Le repos journalier régulier est de 11h consécutives."
            }
          },
          {
            "@type": "Question",
            "name": "Comment financer la formation FCO Marchandises d'un conducteur ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La FCO Marchandises (35 heures) est financée par l'employeur via l'OPCO Mobilités dans le cadre du plan de développement des compétences, ou mobilisable via le Compte Personnel de Formation (CPF) pour les personnes en recherche d'emploi."
            }
          },
          {
            "@type": "Question",
            "name": "Quelle est la différence entre un chauffeur PL et un chauffeur SPL ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le chauffeur PL (Permis C) conduit des véhicules porteurs rigides de plus de 3,5 tonnes avec remorque de moins de 750 kg. Le chauffeur SPL (Permis CE) conduit des ensembles articulés (tracteur + semi-remorque ou porteur + remorque lourde) jusqu'à 44 tonnes."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="conseils-page-modern">
      {/* Balise SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Hero En-tête Moderne Centre de Ressources */}
      <section className="conseils-hero-section">
        <div className="container">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            <span>Centre de Ressources Transport & Logistique • Guides Experts 2026</span>
          </div>

          <h1 className="hero-title">
            Conseils, réglementation et
            <span className="hero-title-highlight">recrutement transport</span>
          </h1>

          <p className="hero-subtitle">
            Tout ce que les transporteurs, exploitants et conducteurs routiers doivent maîtriser :
            règles sociales européennes (RSE), renouvellement FIMO/FCO, convention collective CCNTR,
            grilles salariales et méthodes de sourcing direct sans commission d'intérim.
          </p>

          <div className="hero-cta-group">
            <a href="#guides-pratiques" className="btn btn-primary btn-lg">
              <BookOpen size={17} />
              <span>Consulter les guides d'embauche</span>
            </a>
            <Link href="/carte-chauffeurs" className="btn btn-outline btn-lg">
              <MapPin size={17} />
              <span>Carte des chauffeurs disponibles</span>
            </Link>
          </div>

          {/* Mots-clés SEO interactifs */}
          <div className="hero-seo-pills">
            <span className="seo-pill-label">Thématiques clés :</span>
            <span className="seo-pill" onClick={() => setSearchQuery("SPL")} style={{ cursor: "pointer" }}>
              Chauffeur SPL (CE)
            </span>
            <span className="seo-pill" onClick={() => setSearchQuery("FCO")} style={{ cursor: "pointer" }}>
              FCO Marchandises
            </span>
            <span className="seo-pill" onClick={() => setSearchQuery("RSE")} style={{ cursor: "pointer" }}>
              Temps de repos RSE
            </span>
            <span className="seo-pill" onClick={() => setSearchQuery("ADR")} style={{ cursor: "pointer" }}>
              ADR Citerne & Colis
            </span>
            <span className="seo-pill" onClick={() => setSearchQuery("Permis C")} style={{ cursor: "pointer" }}>
              Chauffeur PL Distribution
            </span>
          </div>
        </div>
      </section>

      {/* 2. Article à la Une (Flagship Guide SPL) */}
      <section className="container">
        <div className="featured-guide-card">
          <div className="featured-guide-content">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge badge-blue">Guide à la Une</span>
              <span className="badge badge-navy">{featuredArticle.category_label}</span>
              <span style={{ fontSize: "0.84rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Clock size={14} /> Lecture : {featuredArticle.read_time}
              </span>
            </div>

            <h2 className="featured-guide-title">
              <Link href={`/conseils/${featuredArticle.slug}`}>
                {featuredArticle.title}
              </Link>
            </h2>

            <p className="featured-guide-summary">
              {featuredArticle.summary} Retrouvez les étapes indispensables pour sécuriser vos
              recrutements de conducteurs super lourd : contrôle des permis, examen des cartes chrono et fidélisation.
            </p>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <Link href={`/conseils/${featuredArticle.slug}`} className="btn btn-primary btn-md">
                <span>Lire le guide complet</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Encadré Points Clés */}
          <div className="featured-takeaways-box">
            <div className="featured-takeaways-title">Points clés à retenir :</div>
            <div className="featured-takeaway-item">
              <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Contrôle strict : Permis EC, FCO 35h à jour, Carte Chrono valide.</span>
            </div>
            <div className="featured-takeaway-item">
              <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Définition précise du rythme : découches, traction nuit ou régional.</span>
            </div>
            <div className="featured-takeaway-item">
              <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>Économie moyenne de 30% en évitant les surcoûts d'agences d'intérim.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Moteur de Recherche & Filtres Thématiques */}
      <section id="guides-pratiques" className="container">
        <div className="jobs-filter-box">
          <div className="filter-header-wrap" style={{ marginBottom: "1.25rem" }}>
            <h2 className="filter-title">Tous les dossiers et fiches pratiques transport</h2>
            <p className="filter-subtitle">
              Filtrez par thématique ou recherchez directement un mot-clé technique (ex: FIMO, RSE, Citerne, CACES...).
            </p>
          </div>

          <div className="jobs-search-row" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <div className="jobs-search-input-wrap">
              <Search size={18} className="jobs-search-ico" />
              <input
                type="text"
                placeholder="Rechercher un dossier, une réglementation, un permis (ex: SPL, RSE, FCO, Salaire)..."
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

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Toutes les thématiques ({ARTICLES.length})</option>
                <option value="recrutement">Recrutement transport (3)</option>
                <option value="carriere">Carrière & Formations (1)</option>
                <option value="permis">Réglementation & Permis (1)</option>
              </select>
            </div>
          </div>

          {/* Filtres Pilules Rapides */}
          <div className="filter-tags-quick">
            <span className="quick-tag-label">Catégories :</span>
            <button
              type="button"
              className={`quick-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              Tous les articles ({ARTICLES.length})
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedCategory === "recrutement" ? "active" : ""}`}
              onClick={() => setSelectedCategory("recrutement")}
            >
              Recrutement transport
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedCategory === "carriere" ? "active" : ""}`}
              onClick={() => setSelectedCategory("carriere")}
            >
              Carrière & Formations
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedCategory === "permis" ? "active" : ""}`}
              onClick={() => setSelectedCategory("permis")}
            >
              Réglementation & Permis
            </button>

            {(searchQuery || selectedCategory !== "all") && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. Grille des Guides Détaillés */}
      <section className="container">
        <div className="advice-grid-modern">
          {filteredArticles.map((art) => (
            <article key={art.slug} className="advice-card-modern">
              <div className="advice-card-meta">
                <span
                  className={`badge ${
                    art.category === "recrutement"
                      ? "badge-blue"
                      : art.category === "carriere"
                      ? "badge-navy"
                      : "badge-green"
                  }`}
                >
                  {art.category_label}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Clock size={13} /> {art.read_time}
                </span>
              </div>

              <h3 className="advice-card-title">
                <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
              </h3>

              <p className="advice-card-excerpt">{art.summary}</p>

              <div className="advice-card-footer">
                <Link href={`/conseils/${art.slug}`} className="btn btn-outline-primary btn-sm w-full">
                  <span>Lire le guide complet</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Mémentos Réglementaires / Fiches Pratiques Transport (Boost SEO + Utilité) */}
      <section className="container" style={{ marginTop: "1rem" }}>
        <div className="section-head-modern" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <span className="badge badge-blue">Fiches Pratiques Express</span>
          <h2>Mémento réglementaire pour les professionnels du transport</h2>
          <p>
            Les règles incontournables résumées pour vous assurer d'une conformité totale lors de vos recrutements et de vos contrôles sur route.
          </p>
        </div>

        <div className="regulatory-strip-grid">
          {/* Fiche 1 : Permis & Catégories */}
          <div className="regulatory-card">
            <div className="regulatory-card-head">
              <div className="visual-metric-icon">
                <Truck size={24} />
              </div>
              <h3>Grille des Permis Poids Lourd</h3>
            </div>
            <ul className="regulatory-list">
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Permis B :</strong> Véhicules utilitaires (VUL) jusqu'à 3,5 tonnes de PTAC.</span>
              </li>
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Permis C :</strong> Porteurs rigides de plus de 3,5 tonnes (remorque ≤ 750 kg).</span>
              </li>
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Permis CE :</strong> Super Poids Lourd (SPL) avec semi-remorque jusqu'à 44 tonnes.</span>
              </li>
            </ul>
          </div>

          {/* Fiche 2 : Formations & Validités */}
          <div className="regulatory-card">
            <div className="regulatory-card-head">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                <ShieldCheck size={24} />
              </div>
              <h3>Certifications Obligatoires</h3>
            </div>
            <ul className="regulatory-list">
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>FIMO Marchandises :</strong> Formation initiale obligatoire de 140 heures.</span>
              </li>
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>FCO Marchandises :</strong> Recyclage de 35 heures obligatoire tous les 5 ans.</span>
              </li>
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Carte Chrono :</strong> Carte conducteur numérique personnelle, valable 5 ans.</span>
              </li>
            </ul>
          </div>

          {/* Fiche 3 : RSE Temps de Conduite */}
          <div className="regulatory-card">
            <div className="regulatory-card-head">
              <div className="visual-metric-icon" style={{ backgroundColor: "#0b192c", color: "#ffffff" }}>
                <Scale size={24} />
              </div>
              <h3>Règles RSE Essentielles</h3>
            </div>
            <ul className="regulatory-list">
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Conduite continue :</strong> Coupure de 45 min obligatoire après 4h30 au volant.</span>
              </li>
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Conduite journalière :</strong> 9 heures max (extension à 10h 2 fois par semaine).</span>
              </li>
              <li className="regulatory-list-item">
                <CheckCircle2 size={16} color="#0080ff" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>Repos journalier :</strong> 11 heures consécutives (réductible à 9h 3 fois/semaine).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Section FAQ Référencement Naturel Google (SEO) */}
      <section className="recruiter-seo-section">
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-blue">Foire Aux Questions</span>
              <h2>Questions fréquentes sur l'embauche et les carrières transport</h2>
              <p>
                Retrouvez les réponses certifiées de nos experts transport pour sécuriser vos démarches.
              </p>
            </div>

            <div className="seo-faq-grid">
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment vérifier la validité de la FCO d'un candidat ?</h3>
                <p className="seo-faq-a">
                  La validité de la FCO Marchandises figure directement sur la Carte de Qualification de Conducteur (CQC),
                  au verso du document avec la date d'échéance officielle. Vous pouvez également demander l'attestation
                  délivrée par le centre de formation agréé (AFT-IFTIM, Promotrans, ECF, Forget Formation...).
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Quel est le coût moyen d'un recrutement via TruckMatch ?</h3>
                <p className="seo-faq-a">
                  Sur TruckMatch, vous accédez directement aux coordonnées des conducteurs sans aucune marge d'intermédiaire
                  ni commission sur les heures de conduite. Comparé à une agence d'intérim qui applique un coefficient
                  de 1,9 à 2,2, vous réalisez une économie moyenne de 800 € à 1 500 € par mois et par chauffeur.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Qu'est-ce que l'habilitation ADR de base et l'ADR Citerne ?</h3>
                <p className="seo-faq-a">
                  L'ADR de base permet le transport de matières dangereuses en colis ou en benne (hors explosifs et radioactifs).
                  L'ADR Citerne étendue est une spécialisation supplémentaire obligatoire pour conduire des semi-remorques citernes
                  contenant des hydrocarbures, produits chimiques liquides ou gaz liquéfiés.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Quelles sont les obligations de l'employeur concernant la carte conducteur ?</h3>
                <p className="seo-faq-a">
                  L'employeur a l'obligation légale de télécharger les données de la carte conducteur au moins une fois
                  tous les 28 jours, et celles du chronotachygraphe du véhicule tous les 90 jours. Les données doivent
                  être archivées en toute sécurité pendant une durée minimale d'un an pour contrôle de l'Inspection du Travail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bannière d'Action Finale Chauffeur / Entreprise */}
      <section className="container">
        <div className="recruiter-cta-banner">
          <div className="cta-banner-content">
            <span className="badge badge-blue">Rejoignez TruckMatch</span>
            <h2>Prêt à accélérer vos recrutements ou trouver votre mission ?</h2>
            <p>
              Plus de 1 480 conducteurs qualifiés et des centaines d'entreprises de transport échangent
              déjà en direct sans intermédiaire superflu.
            </p>
            <div className="cta-banner-actions">
              <Link href="/entreprises" className="btn btn-primary btn-lg">
                <Building2 size={18} />
                <span>Je suis une entreprise</span>
              </Link>
              <Link href="/chauffeurs" className="btn btn-outline btn-lg">
                <UserPlus size={18} />
                <span>Je suis un chauffeur</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
