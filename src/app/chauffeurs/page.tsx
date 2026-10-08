import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import {
  UserCheck,
  Shield,
  Award,
  MapPin,
  ArrowRight,
  FileCheck,
  Truck,
  Clock,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Moon,
  Sun,
  Compass,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Je suis Chauffeur — Emploi & Recrutement Direct SPL, PL, Porteur et VUL",
  description:
    "Créez votre profil de conducteur routier gratuitement sur TruckMatch. Accédez aux meilleures opportunités de transport en CDI/CDD, valorisez vos permis C/CE, ADR et FIMO sans intermédiaire.",
};

export default function ChauffeursHubPage() {
  const driverTags = [
    { label: "Conducteur SPL Régional", href: "/chauffeurs/spl" },
    { label: "Chauffeur PL Distribution", href: "/chauffeurs/pl" },
    { label: "Porteur Benne & TP", href: "/chauffeurs/porteur" },
    { label: "Livreur VUL Messagerie", href: "/chauffeurs/vul" },
    { label: "Tractions de Nuit", href: "/offres-emploi" },
    { label: "ADR Citerne Pétrole", href: "/conseils/chauffeur-spl-competences-et-qualifications" },
    { label: "Retour chaque soir", href: "/offres-emploi" },
    { label: "Salaires & Frais de route", href: "#salaires-transport" },
  ];

  const salaryBenchmarks = [
    {
      title: "Conducteur SPL (CE)",
      badge: "Super Lourd",
      salary: "2 400 € — 3 250 €",
      period: "net mensuel moyen",
      frais: "Jusqu'à 850 € de frais / mois",
      features: [
        "Traction régionale ou grand routier",
        "Découchés et repas conventionnés CCNTR",
        "Ensembles tracteurs récents (Euro 6)",
        "Majoration heures de nuit et relais",
      ],
    },
    {
      title: "Chauffeur PL (C)",
      badge: "Poids Lourd",
      salary: "2 050 € — 2 650 €",
      period: "net mensuel moyen",
      frais: "Paniers repas journaliers inclus",
      features: [
        "Distribution régionale et messagerie",
        "Retour au domicile chaque soir garanti",
        "Véhicules porteurs 19T / 26T avec hayon",
        "Horaires de journée réguliers",
      ],
    },
    {
      title: "Porteur Grue & TP",
      badge: "Spécialité BTP",
      salary: "2 200 € — 2 800 €",
      period: "net mensuel moyen",
      frais: "Primes technicité CACES R490",
      features: [
        "Approvisionnement chantiers & négoce",
        "Conduite de grue auxiliaire télécommandée",
        "Retour chez soi chaque soir",
        "Reconnaissance de l'autonomie sur chantier",
      ],
    },
    {
      title: "Chauffeur Livreur VUL",
      badge: "Utilitaire (B)",
      salary: "1 700 € — 2 150 €",
      period: "net mensuel moyen",
      frais: "Primes qualité de service",
      features: [
        "Messagerie express urbaine et périurbaine",
        "Tournées sectorisées définies",
        "Accompagnement à l'évolution vers le permis C",
        "Véhicules récents et connectés",
      ],
    },
  ];

  const workRhythms = [
    {
      icon: Sun,
      title: "Régional & Retour Chaque Soir",
      desc: "Tournées dans un rayon de 150 à 250 km autour de votre dépôt. Parfait pour préserver votre vie de famille et vos temps de repos à domicile.",
      badge: "Vie de famille préservée",
    },
    {
      icon: Moon,
      title: "Tractions de Nuit & Relais",
      desc: "Liaisons régulières sur axes autoroutiers entre plateformes logistiques. Décrochage rapide d'attelage, zéro manutention et primes de nuit avantageuses.",
      badge: "Zéro manutention",
    },
    {
      icon: Compass,
      title: "Grand Routier & National",
      desc: "Liaisons interrégionales ou transfrontalières. Cabine couchette grand confort, autonomie totale sur la route et indemnités de grand déplacement maximales.",
      badge: "Rémunération maximale",
    },
    {
      icon: Zap,
      title: "Missions Urgentes & Renforts",
      desc: "Remplacements de courte durée ou pics saisonniers rémunérés à des taux très attractifs pour les conducteurs recherchant flexibilité et liberté.",
      badge: "Flexibilité totale",
    },
  ];

  const driverTestimonials = [
    {
      quote:
        "« Après 8 ans en grand national, je voulais rentrer tous les soirs chez moi dans les Hauts-de-France. Sur TruckMatch, j'ai trouvé une traction régionale en CDI en moins de 48h sans passer par une boîte d'intérim. »",
      name: "Stéphane L.",
      spec: "Conducteur Routier SPL (CE) — Nord (59)",
      initials: "SL",
    },
    {
      quote:
        "« Titulaire de l'ADR citerne et du CACES grue, je voulais une entreprise qui valorise réellement mes compétences. J'ai négocié un salaire 350€ plus élevé directement avec le patron du transporteur. »",
      name: "Karim B.",
      spec: "Chauffeur PL Grue & TP — Rhône (69)",
      initials: "KB",
    },
    {
      quote:
        "« Inscription ultra rapide depuis mon smartphone sur une aire de repos. Deux jours après, j'avais 3 propositions de lignes régulières de nuit avec du matériel neuf. Je recommande à tous les gars de la route. »",
      name: "Marc V.",
      spec: "Chauffeur SPL Relais de Nuit — Ille-et-Vilaine (35)",
      initials: "MV",
    },
  ];

  return (
    <div className="trouver-chauffeur-page">
      {/* 1. Hero Chauffeur */}
      <section className="recruiter-hero-section">
        <div className="container">
          <div className="recruiter-hero-grid">
            <div className="recruiter-hero-content">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                <span>Conducteurs & Chauffeurs Routiers • Espace Candidat</span>
              </div>

              <h1 className="hero-title">
                Trouvez la route et l'entreprise
                <span className="hero-title-highlight">qui vous correspondent</span>
              </h1>

              <p className="hero-subtitle">
                TruckMatch valorise les professionnels de la route. Créez votre profil en 2 minutes,
                affichez vos permis et habilitations, et recevez directement les meilleures propositions
                d'emploi en CDI, CDD et tractions sans commission d'intérim.
              </p>

              <div className="hero-cta-group">
                <a href="#inscription-chauffeur" className="btn btn-primary btn-lg">
                  <UserCheck size={17} />
                  <span>Créer mon profil gratuitement</span>
                </a>
                <Link href="/offres-emploi" className="btn btn-outline btn-lg">
                  <Briefcase size={17} />
                  <span>Consulter les offres d'emploi</span>
                </Link>
              </div>

              {/* Mots-clés SEO Chauffeur */}
              <div className="hero-seo-pills">
                <span className="seo-pill-label">Recherches populaires :</span>
                {driverTags.map((tag, i) => (
                  <Link key={i} href={tag.href} className="seo-pill">
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Carte métrique & réassurance Chauffeur */}
            <div className="recruiter-hero-visual">
              <div className="recruiter-visual-card">
                <div className="visual-metric-row">
                  <div className="visual-metric-icon">
                    <Shield size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">100% Gratuit & Confidentiel</p>
                    <p className="visual-metric-label">Vos coordonnées ne sont transmises qu'avec votre accord</p>
                  </div>
                </div>

                <div className="visual-metric-row">
                  <div className="visual-metric-icon" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                    <MapPin size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">Respect de vos Secteurs</p>
                    <p className="visual-metric-label">Régional, retour chaque soir, national ou tractions de nuit</p>
                  </div>
                </div>

                <div className="visual-metric-row">
                  <div className="visual-metric-icon" style={{ backgroundColor: "#e4edf6", color: "#0b192c" }}>
                    <Award size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">Vos Qualifications Valorisées</p>
                    <p className="visual-metric-label">Permis CE, C, ADR citerne, FIMO/FCO et CACES reconnus</p>
                  </div>
                </div>

                <div className="visual-metric-row">
                  <div className="visual-metric-icon" style={{ backgroundColor: "#fef7e6", color: "#f59e0b" }}>
                    <Truck size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">Contact Direct avec les Patrons</p>
                    <p className="visual-metric-label">Échangez sans intermédiaire avec les exploitants transport</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Repères de Salaires & Rémunérations Transport Routier (Boost SEO & Valeur Conducteur) */}
      <section className="salary-benchmark-section" id="salaires-transport">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-navy">Transparence Rémunération</span>
            <h2>Repères de salaires & frais de route dans le transport routier</h2>
            <p>
              Estimations moyennes constatées en France (salaire de base conventionnel CCN 3085 + indemnités de déplacement, paniers repas et primes).
            </p>
          </div>

          <div className="salary-grid-modern">
            {salaryBenchmarks.map((bench, idx) => (
              <div key={idx} className="salary-card-modern">
                <div className="salary-card-top">
                  <span className="badge badge-blue">{bench.badge}</span>
                  <DollarSign size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h3 className="salary-title">{bench.title}</h3>

                <div className="salary-range-box">
                  <p className="salary-amount">{bench.salary}</p>
                  <p className="salary-subtext">{bench.period}</p>
                </div>

                <p style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-navy)", marginBottom: "0.85rem" }}>
                  {bench.frais}
                </p>

                <ul className="salary-features-list">
                  {bench.features.map((feat, fIdx) => (
                    <li key={fIdx} className="salary-feature-item">
                      <CheckCircle2 size={15} className="salary-feature-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <a href="#inscription-chauffeur" className="btn btn-outline-primary btn-sm mt-auto w-full">
                  <span>Accéder aux postes {bench.badge}</span>
                </a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", maxWidth: "800px", margin: "0 auto" }}>
              💡 <strong>Rappel conventionnel CCNTR :</strong> Les indemnités forfaitaires de déplacement comprennent le panier repas de jour (~15,96 €), le repas unique de nuit (~9,54 €) et le découché avec petit-déjeuner (~50,16 €), non soumis aux cotisations sociales.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Choix du Rythme de Travail (4 Cartes Expérience Conducteur) */}
      <section className="work-rhythm-section">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-blue">Organisation & Mode de Vie</span>
            <h2>Quel rythme de route correspond à votre vie ?</h2>
            <p>
              Parce que chaque chauffeur a ses impératifs personnels, TruckMatch vous permet de choisir votre cadre de travail idéal.
            </p>
          </div>

          <div className="rhythm-grid-modern">
            {workRhythms.map((rhythm, idx) => {
              const Icon = rhythm.icon;
              return (
                <div key={idx} className="rhythm-card-modern">
                  <div className="rhythm-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <h3 className="rhythm-title">{rhythm.title}</h3>
                  <p className="rhythm-desc">{rhythm.desc}</p>
                  <span className="rhythm-badge-pill">{rhythm.badge}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Métiers et Spécialités par Permis */}
      <section className="categories-section">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-navy">Fiches Métiers & Permis</span>
            <h2>Explorez les opportunités par catégorie de matériel</h2>
            <p>
              Consultez les missions, matériels et exigences réglementaires selon votre permis de conduire.
            </p>
          </div>

          <div className="categories-grid-modern">
            {Object.values(CATEGORIES).map((cat) => (
              <div key={cat.id} className="cat-card-modern">
                <div className="cat-card-top">
                  <div className="cat-icon-visual-wrapper">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        width={120}
                        height={65}
                        className="cat-icon-visual-img"
                      />
                    ) : (
                      <span className="cat-icon-emoji">{cat.icon}</span>
                    )}
                  </div>
                  <span className="badge badge-blue">{cat.slug.toUpperCase()}</span>
                </div>
                <h3 className="cat-title-modern">{cat.title}</h3>
                <p className="cat-desc-modern">{cat.description}</p>
                <div className="cat-pills-wrap">
                  {cat.permits.map((p, i) => (
                    <span key={i} className="permit-pill-modern">
                      {p}
                    </span>
                  ))}
                </div>
                <Link href={`/chauffeurs/${cat.slug}`} className="btn btn-outline-primary btn-sm mt-auto">
                  <span>Voir la fiche métier {cat.title}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Témoignages Chauffeurs (Social Proof) */}
      <section className="driver-testimonials-section">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-navy">Paroles de Routiers</span>
            <h2>Ils ont trouvé leur route grâce à TruckMatch</h2>
            <p>
              Découvrez les retours d'expérience de conducteurs professionnels qui ont rejoint le réseau.
            </p>
          </div>

          <div className="testimonial-grid-modern">
            {driverTestimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card-modern">
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-driver-meta">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <h4 className="testimonial-name">{t.name}</h4>
                    <p className="testimonial-spec">{t.spec}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Formulaire d'Inscription Chauffeur Gratuit */}
      <section className="recruiter-form-section" id="inscription-chauffeur">
        <div className="container">
          <div className="recruiter-form-layout">
            <div>
              <span className="badge badge-navy">Inscription 100% Gratuite</span>
              <h2 className="hero-title" style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
                Créez votre profil chauffeur en 2 minutes
              </h2>
              <p className="hero-subtitle">
                Renseignez vos permis, vos disponibilités et votre secteur préféré. Votre profil sera
                rendu visible auprès de transporteurs vérifiés qui recrutent sur votre région.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <FileCheck size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Aucun frais d'inscription ni commission sur votre salaire</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <FileCheck size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Confidentialité garantie : vos coordonnées ne sont pas publiques</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <FileCheck size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Contact direct avec les dirigeants et exploitants transport</span>
                </div>
              </div>
            </div>

            <div className="recruiter-form-card">
              <form className="recruiter-form">
                <div className="form-field-modern">
                  <label>Nom et Prénom *</label>
                  <input type="text" placeholder="Ex: Jean Dupont" required />
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Téléphone portable *</label>
                    <input type="tel" placeholder="06 12 34 56 78" required />
                  </div>
                  <div className="form-field-modern">
                    <label>Email *</label>
                    <input type="email" placeholder="jean.dupont@email.com" required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Permis principal détenu *</label>
                    <select defaultValue="spl">
                      <option value="spl">Permis CE — Super Lourd (SPL)</option>
                      <option value="pl">Permis C — Poids Lourd (PL)</option>
                      <option value="c1">Permis C1 — Porteur léger</option>
                      <option value="b">Permis B — Utilitaire (VUL)</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Département de résidence *</label>
                    <input type="text" placeholder="Ex: 59 - Lille" required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Habilitations & Spécialités</label>
                    <select defaultValue="fimo">
                      <option value="fimo">FIMO / FCO Marchandises à jour</option>
                      <option value="adr-citerne">ADR Citerne étendue</option>
                      <option value="adr-base">ADR Base (Colis)</option>
                      <option value="caces-grue">CACES R490 Grue Auxiliaire</option>
                      <option value="frigo">Température Dirigée (Frigo)</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Rythme souhaité</label>
                    <select defaultValue="soir">
                      <option value="soir">Retour domicile chaque soir</option>
                      <option value="nuit">Tractions régulières de nuit</option>
                      <option value="national">National / Découchés acceptés</option>
                      <option value="indifferent">Indifférent / Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Disponibilité *</label>
                    <select defaultValue="immediat">
                      <option value="immediat">Disponible immédiatement</option>
                      <option value="48h">Sous 48h à 7 jours</option>
                      <option value="preavis">Sous préavis (1 mois)</option>
                      <option value="veille">En poste mais à l'écoute</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Années d'expérience au volant</label>
                    <select defaultValue="5-10">
                      <option value="debutant">Débutant (moins de 2 ans)</option>
                      <option value="2-5">2 à 5 ans</option>
                      <option value="5-10">5 à 10 ans</option>
                      <option value="plus-10">Plus de 10 ans</option>
                    </select>
                  </div>
                </div>

                <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-primary btn-lg w-full">
                    <UserCheck size={18} />
                    <span>Créer mon profil chauffeur gratuitement</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", textAlign: "center", marginTop: "0.5rem" }}>
                  En créant votre profil, vous acceptez les Conditions Générales de TruckMatch. Données protégées RGPD.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Guide SEO & FAQ Chauffeurs Routiers */}
      <section className="recruiter-seo-section">
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-blue">Guide Carrière Chauffeur</span>
              <h2>Tout savoir sur le métier et vos droits de conducteur routier</h2>
              <p>
                Règlementation sociale européenne (RSE), renouvellement des qualifications et astuces pour booster votre rémunération.
              </p>
            </div>

            <div className="seo-faq-grid">
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment renouveler sa FCO Marchandises ?</h3>
                <p className="seo-faq-a">
                  La Formation Continue Obligatoire (FCO) Marchandises doit être renouvelée tous les 5 ans.
                  D'une durée de 35 heures (5 jours consécutifs), elle est intégralement prise en charge
                  par votre employeur via l'OPCO Mobilités ou finançable par votre Compte Personnel de
                  Formation (CPF) si vous êtes en recherche d'emploi. Elle permet la réédition de votre
                  Carte de Qualification Conducteur (CQC).
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Quelles sont les règles de repos selon la RSE ?</h3>
                <p className="seo-faq-a">
                  La Règlementation Sociale Européenne (RSE) impose une coupure de 45 minutes après 4h30
                  de conduite continue (ou fractionnée en 15 min puis 30 min). Le temps de conduite
                  journalier maximal est de 9 heures (pouvant être porté à 10 heures deux fois par semaine).
                  Le repos journalier régulier est de 11 heures consécutives (ou réduit à 9 heures 3 fois par semaine).
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment négocier un salaire plus élevé en tant que chauffeur routier ?</h3>
                <p className="seo-faq-a">
                  Les conducteurs qui perçoivent les meilleures rémunérations sont ceux qui cumulent des
                  spécialisations recherchées : ADR Citerne (pétrole, produits chimiques), CACES R490 grue
                  auxiliaire pour les livraisons BTP délicates, ou encore les lignes régulières de nuit avec
                  majorations horaires. Sur TruckMatch, vos certifications sont mises en avant dès le premier contact.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Que faire si ma carte chronotachygraphe arrive à expiration ?</h3>
                <p className="seo-faq-a">
                  La carte de conducteur est valable 5 ans. Vous devez effectuer la demande de renouvellement
                  auprès de Chronoservices au minimum un mois avant sa date d'expiration pour ne pas risquer
                  l'interdiction de conduite. La conduite sans carte valide constitue une infraction de 5ème classe
                  passible d'une lourde amende et d'une immobilisation du véhicule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
