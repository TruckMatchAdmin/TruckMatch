import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Zap,
  MapPin,
  Calendar,
  Award,
  ArrowRight,
  Filter,
  FileCheck,
  Truck,
  Users,
  Briefcase,
} from "lucide-react";

import { QualifiedDriversSection } from "@/components/entreprises/QualifiedDriversSection";

export const metadata: Metadata = {
  title: "Trouver un Chauffeur Routier — Recrutement Direct SPL, PL, Porteur & VUL",
  description:
    "Trouvez et recrutez des conducteurs routiers qualifiés SPL, PL, Porteurs et VUL sans commissions d'intérim exorbitantes. Profils vérifiés avec permis C/CE, FIMO/FCO et ADR.",
  alternates: {
    canonical: "https://truckmatch.fr/entreprises",
  },
  openGraph: {
    title: "Recrutez vos Chauffeurs Routiers sans intermédiaire | TruckMatch",
    description:
      "Accédez aux profils de conducteurs disponibles immédiatement en France. Permis CE, C, ADR, FIMO vérifiés.",
    url: "https://truckmatch.fr/entreprises",
    images: ["/images/hero-trouver-chauffeur.png"],
  },
};

export default function EntreprisesPage() {
  const seoTags = [
    { label: "Chauffeur SPL (CE)", href: "/chauffeurs/spl" },
    { label: "Conducteur PL (C)", href: "/chauffeurs/pl" },
    { label: "Porteur Benne / Grue", href: "/chauffeurs/porteur" },
    { label: "Livreur VUL Express", href: "/chauffeurs/vul" },
    { label: "Habilitation ADR Citerne", href: "/conseils/chauffeur-spl-competences-et-qualifications" },
    { label: "Traction de nuit / Relais", href: "/offres-emploi" },
    { label: "Frigo & Distribution", href: "/offres-emploi" },
    { label: "CACES Grue R490", href: "/conseils/comment-recruter-un-chauffeur-spl" },
  ];

  return (
    <div className="trouver-chauffeur-page">
      {/* 1. Hero Recrutement Chauffeur */}
      <section className="recruiter-hero-section">
        <div className="container">
          <div className="recruiter-hero-grid">
            <div className="recruiter-hero-content">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                <span>Espace Transporteurs & Logistique • Recrutement Direct</span>
              </div>

              <h1 className="hero-title">
                Recrutez des conducteurs fiables,
                <span className="hero-title-highlight">qualifiés et prêts à rouler</span>
              </h1>

              <p className="hero-subtitle">
                Fini les annonces sans retour et les commissions d'intérim exorbitantes. Accédez
                directement à une base de chauffeurs SPL, PL, Porteurs et VUL qualifiés sur vos bassins
                d'activité pour sécuriser vos tournées.
              </p>

              <div className="hero-cta-group">
                <Link href="/inscription?type=entreprise" className="btn btn-primary btn-lg">
                  <Building2 size={17} />
                  <span>Créer mon espace entreprise</span>
                </Link>
                <a href="#profils-chauffeurs" className="btn btn-outline btn-lg">
                  <Users size={17} />
                  <span>Consulter les profils disponibles</span>
                </a>
              </div>

              {/* Mots-clés SEO interactifs recrutement */}
              <div className="hero-seo-pills">
                <span className="seo-pill-label">Profils recherchés :</span>
                {seoTags.map((tag, i) => (
                  <Link key={i} href={tag.href} className="seo-pill">
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Colonne droite : Visuel Photoréaliste Flotte TruckMatch */}
            <div className="recruiter-hero-visual">
              <div className="recruiter-image-card">
                <Image
                  src="/images/hero-trouver-chauffeur.png"
                  alt="Flotte de camions professionnels TruckMatch - Les entreprises trouvent leurs chauffeurs"
                  width={1024}
                  height={381}
                  priority
                  className="recruiter-main-img"
                />
              </div>
            </div>
          </div>

          {/* Bandeau de réassurance Transport 4 métriques */}
          <div className="recruiter-metrics-strip">
            <div className="recruiter-metric-card">
              <div className="visual-metric-icon">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="visual-metric-val">100% Titres Contrôlés</p>
                <p className="visual-metric-label">Permis C/CE, FIMO/FCO et carte chrono</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                <Clock size={24} />
              </div>
              <div>
                <p className="visual-metric-val">Réactivité sous 24h</p>
                <p className="visual-metric-label">Remplacement urgent ou renfort de flotte</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e4edf6", color: "#0b192c" }}>
                <Zap size={24} />
              </div>
              <div>
                <p className="visual-metric-val">0% Marge d'Intérim</p>
                <p className="visual-metric-label">Recrutement direct en CDI ou CDD</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#fef7e6", color: "#f59e0b" }}>
                <MapPin size={24} />
              </div>
              <div>
                <p className="visual-metric-val">Ciblage de Proximité</p>
                <p className="visual-metric-label">Chauffeurs proches de vos dépôts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 & 3. Filtres et Vivier de Conducteurs Qualifiés Réels */}
      <QualifiedDriversSection />

      {/* 4. Avantages Modèle Direct vs Intérim */}
      <section className="recruiter-advantages-section">
        <div className="container">
          <div className="recruiter-adv-box">
            <div className="section-header-centered">
              <span className="badge badge-blue">Optimisation Opérationnelle</span>
              <h2>Pourquoi les transporteurs recrutent avec TruckMatch</h2>
              <p>
                Une solution sur-mesure pour réduire les coûts d'intermédiation et accélérer vos embauches.
              </p>
            </div>

            <div className="adv-grid-modern">
              <div className="adv-card-modern">
                <div className="adv-icon-circle">
                  <Zap size={22} />
                </div>
                <h3 className="adv-card-title">Zéro commission d'intérim</h3>
                <p className="adv-card-desc">
                  Ne payez plus de coefficient horaire multiplicateur à chaque heure de conduite. Embauchez
                  directement selon vos propres grilles conventionnelles.
                </p>
              </div>

              <div className="adv-card-modern">
                <div className="adv-icon-circle">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="adv-card-title">Habilitations contrôlées</h3>
                <p className="adv-card-desc">
                  Permis poids lourds, FIMO/FCO, cartes de qualification conducteur (CQC) et certificats
                  ADR sont rigoureusement répertoriés avant mise en relation.
                </p>
              </div>

              <div className="adv-card-modern">
                <div className="adv-icon-circle">
                  <Clock size={22} />
                </div>
                <h3 className="adv-card-title">Remplacement express</h3>
                <p className="adv-card-desc">
                  Un arrêt imprévu ou un pic de volume logistique ? Trouvez un conducteur disponible sous
                  24h à proximité de votre base de départ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section Recrutement Entreprise */}
      <section className="cta-section-modern" id="demande-recrutement">
        <div className="container">
          <div className="cta-banner-modern">
            <div className="cta-banner-content">
              <span className="badge badge-navy">Recrutement Direct & Sans Intermédiaire</span>
              <h2 className="cta-banner-title">
                Accédez immédiatement aux chauffeurs disponibles
              </h2>
              <p className="cta-banner-desc">
                Inscrivez votre entreprise avec votre numéro SIRET en 2 minutes : trouvez des conducteurs vérifiés (SPL, PL, Porteur, VUL) proches de vos dépôts, sans commission d'agence d'intérim.
              </p>

              <div className="cta-points-row">
                <div className="cta-point-item">
                  <CheckCircle2 size={18} />
                  <span>Vérification officielle SIRET gouvernementale</span>
                </div>
                <div className="cta-point-item">
                  <CheckCircle2 size={18} />
                  <span>Recherche géolocalisée par commune & permis</span>
                </div>
                <div className="cta-point-item">
                  <CheckCircle2 size={18} />
                  <span>Prise de contact directe et immédiate</span>
                </div>
              </div>

              <div className="cta-actions-row">
                <Link href="/inscription?type=entreprise" className="btn btn-primary btn-lg">
                  <Building2 size={18} />
                  <span>Créer mon espace entreprise</span>
                  <ArrowRight size={17} />
                </Link>
                <Link href="/carte-chauffeurs" className="btn btn-outline btn-lg">
                  <MapPin size={18} />
                  <span>Consulter la carte des chauffeurs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Guide SEO Recrutement Transport & FAQ */}
      <section className="recruiter-seo-section">
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-blue">Guide Recrutement Transport</span>
              <h2>Comment recruter efficacement un conducteur routier qualifié ?</h2>
              <p>
                Face aux tensions de recrutement dans le secteur du transport et de la logistique,
                découvrez les clés pour attirer et fidéliser des chauffeurs SPL et PL de confiance.
              </p>
            </div>

            <div className="seo-faq-grid">
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Quels documents vérifier lors de l'embauche d'un chauffeur SPL ou PL ?</h3>
                <p className="seo-faq-a">
                  Tout recrutement dans le transport routier de marchandises exige la vérification du
                  permis de conduire valide (C ou CE), de la Carte de Qualification Conducteur (CQC)
                  attestant de la FIMO ou FCO à jour, de la Carte Numérique Chronotachygraphe ainsi que
                  de l'avis médical d'aptitude délivré par un médecin agréé par la préfecture. Pour les
                  matières dangereuses, le certificat ADR spécifique (colis ou citerne) est requis.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Pourquoi privilégier la mise en relation directe plutôt que l'intérim ?</h3>
                <p className="seo-faq-a">
                  L'intérim applique des coefficients multiplicateurs lourds (souvent entre 1.8 et 2.2 sur le taux horaire brut),
                  ce qui pénalise fortement la marge opérationnelle du transporteur. Avec TruckMatch, vous accédez
                  directement à des conducteurs disponibles pour un recrutement pérenne en CDI ou CDD, créant
                  une meilleure implication du conducteur au volant de vos ensembles routiers.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment gérer les remplacements urgents de conducteurs ?</h3>
                <p className="seo-faq-a">
                  Grâce au filtrage par disponibilité immédiate et proximité kilométrique de votre dépôt,
                  TruckMatch vous permet de solliciter sous 24h des conducteurs résidant sur votre bassin d'emploi,
                  évitant l'immobilisation coûteuse de vos tracteurs et le mécontentement de vos donneurs d'ordres.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Quelles sont les qualifications les plus recherchées par les transporteurs ?</h3>
                <p className="seo-faq-a">
                  Outre les permis C et CE, les habilitations les plus demandées concernent l'ADR citerne
                  (produits pétroliers et chimiques), la maîtrise de la chaîne du froid en transport frigorifique,
                  le CACES R490 grue auxiliaire pour le négoce de matériaux, ainsi que la polyvalence sur
                  les tournées régulières de nuit en relais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
