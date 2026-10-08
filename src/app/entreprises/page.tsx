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

export const metadata: Metadata = {
  title: "Trouver un Chauffeur Routier — Recrutement Direct SPL, PL, Porteur & VUL",
  description:
    "Trouvez et recrutez des conducteurs routiers qualifiés SPL, PL, Porteurs et VUL sans commissions d'intérim exorbitantes. Profils vérifiés avec permis C/CE, FIMO/FCO et ADR.",
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

  const driverProfiles = [
    {
      id: "SPL-5901",
      initials: "ML",
      role: "Conducteur Routier SPL",
      permit: "Permis CE",
      exp: "14 ans d'expérience",
      location: "Nord (59) — Lille / Douai",
      availability: "Disponible immédiatement",
      availColor: "badge-green",
      desc: "Spécialiste de la traction semi-remorque en régional et national. Maîtrise des ensembles tautliner, frigo et benne. Ponctuel et autonome sur la gestion des temps de service (RSE).",
      badges: ["ADR Citerne étendue", "FCO Valide 2028", "Carte Chrono à jour", "Frigo / Temp. Dirigée"],
    },
    {
      id: "PL-6902",
      initials: "KD",
      role: "Chauffeur Distribution PL",
      permit: "Permis C",
      exp: "8 ans d'expérience",
      location: "Rhône (69) — Lyon / Saint-Priest",
      availability: "Disponible sous 48h",
      availColor: "badge-green",
      desc: "Expérience confirmée en messagerie et distribution palettes multi-points avec hayon élévateur. Excellente connaissance de l'agglomération lyonnaise et sens du contact client.",
      badges: ["FIMO / FCO à jour", "Transpalette élec.", "Éco-conduite certifiée", "Carte BTP"],
    },
    {
      id: "PRT-3803",
      initials: "TR",
      role: "Conducteur Porteur TP & Grue",
      permit: "Permis C",
      exp: "6 ans d'expérience",
      location: "Isère (38) — Grenoble / Voiron",
      availability: "Disponible immédiatement",
      availColor: "badge-green",
      desc: "Spécialisé en approvisionnement chantiers BTP, benne enrochée et livraison matériaux avec grue auxiliaire. Rigueur sécurité et contrôle des charges.",
      badges: ["CACES Grue R490", "FIMO Valide", "Travaux Publics", "Carte Chrono à jour"],
    },
    {
      id: "SPL-3504",
      initials: "YM",
      role: "Conducteur SPL Relais de Nuit",
      permit: "Permis CE",
      exp: "11 ans d'expérience",
      location: "Ille-et-Vilaine (35) — Rennes",
      availability: "Disponible immédiatement",
      availColor: "badge-green",
      desc: "Habitué aux tractions inter-plateformes de nuit sur liaisons Bretagne - Île-de-France et Normandie. Respect strict des horaires de relais et traçabilité.",
      badges: ["ADR Base", "Liaison Nuit", "FCO 2027", "Attelage / Décrochage rapide"],
    },
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
                <a href="#demande-recrutement" className="btn btn-primary btn-lg">
                  <Search size={17} />
                  <span>Déposer un besoin de chauffeur</span>
                </a>
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
                <div className="recruiter-image-badge-floating">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="stat-icon-circle" style={{ width: "36px", height: "36px", backgroundColor: "#e6f9f0", color: "#10b981" }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--color-text-light)", letterSpacing: "0.04em" }}>Flotte & Réseau Officiel</p>
                      <p style={{ fontSize: "0.95rem", fontWeight: "850", color: "var(--color-navy)" }}>100% Conducteurs Qualifiés</p>
                    </div>
                  </div>
                  <span className="badge badge-blue">Disponibilité 24/48h</span>
                </div>
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

      {/* 2. Moteur de Recherche & Filtres Rapides */}
      <section className="recruiter-filter-section" id="recherche-chauffeurs">
        <div className="container">
          <div className="recruiter-filter-box">
            <div className="filter-header-wrap">
              <h2 className="filter-title">Filtrer les conducteurs disponibles</h2>
              <p className="filter-subtitle">
                Ciblez précisément les compétences et la zone d'intervention souhaitées pour vos camions.
              </p>
            </div>

            <div className="filter-controls-grid">
              <div className="filter-field">
                <label>Permis requis</label>
                <select defaultValue="all">
                  <option value="all">Tous les permis (SPL, PL, VUL)</option>
                  <option value="spl">Permis CE — Super Lourd (SPL)</option>
                  <option value="pl">Permis C — Poids Lourd (PL)</option>
                  <option value="vul">Permis B — VUL / Utilitaire</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Région / Dépôt</label>
                <select defaultValue="all">
                  <option value="all">Toute la France</option>
                  <option value="hdf">Hauts-de-France (59, 62, 80)</option>
                  <option value="idf">Île-de-France (75, 77, 91, 93, 95)</option>
                  <option value="ara">Auvergne-Rhône-Alpes (69, 38, 01, 42)</option>
                  <option value="ge">Grand Est (67, 68, 54, 57)</option>
                  <option value="paca">PACA (13, 83, 06, 84)</option>
                  <option value="na">Nouvelle-Aquitaine (33, 40, 64)</option>
                  <option value="bzh">Bretagne & Pays de la Loire (35, 44)</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Spécialité / Habilitation</label>
                <select defaultValue="all">
                  <option value="all">Toutes habilitations</option>
                  <option value="adr">ADR Citerne ou Colis</option>
                  <option value="grue">CACES Grue R490</option>
                  <option value="frigo">Température dirigée (Frigo)</option>
                  <option value="nuit">Tractions régulières de nuit</option>
                  <option value="benne">Benne TP / Travaux publics</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Disponibilité</label>
                <select defaultValue="immediat">
                  <option value="immediat">Disponible immédiatement</option>
                  <option value="48h">Sous 48h à 7 jours</option>
                  <option value="preavis">Sous préavis (1 mois)</option>
                </select>
              </div>
            </div>

            <div className="filter-tags-quick">
              <span className="quick-tag-label">Filtres rapides :</span>
              <button type="button" className="quick-filter-btn active">Tous les profils</button>
              <button type="button" className="quick-filter-btn">Conducteurs SPL CE</button>
              <button type="button" className="quick-filter-btn">Chauffeurs PL C</button>
              <button type="button" className="quick-filter-btn">ADR Citerne</button>
              <button type="button" className="quick-filter-btn">CACES Grue</button>
              <button type="button" className="quick-filter-btn">Lignes de Nuit</button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Aperçu des Profils Chauffeurs Vérifiés */}
      <section className="driver-profiles-section" id="profils-chauffeurs">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-navy">Base de Chauffeurs Actifs</span>
            <h2>Conducteurs qualifiés prêts à prendre la route</h2>
            <p>
              Consultez des exemples de dossiers de compétences vérifiés disponibles sur notre réseau de transporteurs.
            </p>
          </div>

          <div className="driver-profiles-grid">
            {driverProfiles.map((driver) => (
              <div key={driver.id} className="driver-profile-card">
                <div className="driver-card-top">
                  <div className="driver-avatar-info">
                    <div className="driver-avatar-circle">{driver.initials}</div>
                    <div>
                      <h3 className="driver-card-title">{driver.role}</h3>
                      <div className="driver-card-meta">
                        <span className="driver-meta-item">
                          <MapPin size={14} />
                          <span>{driver.location}</span>
                        </span>
                        <span className="badge badge-blue">{driver.permit}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${driver.availColor}`}>{driver.availability}</span>
                </div>

                <div className="driver-card-badges">
                  {driver.badges.map((b, idx) => (
                    <span key={idx} className="permit-pill-modern">
                      <CheckCircle2 size={12} style={{ color: "var(--color-primary)" }} />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>

                <p className="driver-card-desc">{driver.desc}</p>

                <div className="driver-card-footer">
                  <span className="driver-experience-badge">
                    <Award size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    {driver.exp}
                  </span>

                  <div className="btn-group">
                    <a href="#demande-recrutement" className="btn btn-primary btn-sm">
                      <Briefcase size={14} />
                      <span>Demander le profil</span>
                    </a>
                    <a href="#demande-recrutement" className="btn btn-outline btn-sm">
                      <span>Contacter</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* 5. Formulaire Express Dépôt de Besoin Chauffeur */}
      <section className="recruiter-form-section" id="demande-recrutement">
        <div className="container">
          <div className="recruiter-form-layout">
            <div>
              <span className="badge badge-navy">Recrutement Rapide</span>
              <h2 className="hero-title" style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
                Déposez votre recherche de chauffeur
              </h2>
              <p className="hero-subtitle">
                Renseignez les détails de votre besoin de transport. Notre équipe vous transmet sous 24h
                les profils de conducteurs qualifiés répondant précisément à vos critères de tournée.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Prise en charge personnalisée sous 2 heures ouvrées</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Aucun engagement contractuel initial</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Respect strict de la confidentialité de votre entreprise</span>
                </div>
              </div>
            </div>

            <div className="recruiter-form-card">
              <form className="recruiter-form">
                <div className="form-field-modern">
                  <label>Raison sociale de l'entreprise *</label>
                  <input type="text" placeholder="Ex: Transports Dubois & Fils" required />
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Nom & Prénom du contact *</label>
                    <input type="text" placeholder="Ex: Marc Dubois" required />
                  </div>
                  <div className="form-field-modern">
                    <label>Téléphone professionnel *</label>
                    <input type="tel" placeholder="06 00 00 00 00" required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Email professionnel *</label>
                    <input type="email" placeholder="contact@transports-dubois.fr" required />
                  </div>
                  <div className="form-field-modern">
                    <label>Dépôt / Ville de départ *</label>
                    <input type="text" placeholder="Ex: 59000 Lille" required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Permis recherché *</label>
                    <select defaultValue="spl">
                      <option value="spl">Conducteur SPL (Permis CE)</option>
                      <option value="pl">Chauffeur PL (Permis C)</option>
                      <option value="porteur">Porteur / Grue (Permis C)</option>
                      <option value="vul">Chauffeur Livreur VUL (Permis B)</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Type de contrat souhaité</label>
                    <select defaultValue="cdi">
                      <option value="cdi">CDI</option>
                      <option value="cdd">CDD / Remplacement</option>
                      <option value="saisonnier">Renfort saisonnier</option>
                      <option value="urgent">Mission d'urgence</option>
                    </select>
                  </div>
                </div>

                <div className="form-field-modern">
                  <label>Détails de la mission (facultatif)</label>
                  <textarea placeholder="Précisez le type de matériel (Tautliner, Frigo, Benne), horaires (jour/nuit), découches ou exigences particulières..." />
                </div>

                <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-primary btn-lg w-full">
                    <span>Transmettre ma demande de chauffeur</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </form>
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
