import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import { UserCheck, Shield, Award, MapPin, ArrowRight, FileCheck, Truck, Clock, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace Chauffeur — Créez votre profil et trouvez votre route",
  description:
    "Rejoignez TruckMatch gratuitement. Mettez en avant vos permis SPL, PL, VUL, vos qualifications FIMO/FCO et soyez visible auprès des meilleures entreprises de transport.",
};

export default function ChauffeursHubPage() {
  const driverTags = [
    { label: "Conducteur SPL Régional", href: "/chauffeurs/spl" },
    { label: "Chauffeur PL Distribution", href: "/chauffeurs/pl" },
    { label: "Porteur Benne & TP", href: "/chauffeurs/porteur" },
    { label: "Livreur VUL Messagerie", href: "/chauffeurs/vul" },
    { label: "Tractions de Nuit", href: "/offres-emploi" },
    { label: "ADR Citerne", href: "/conseils/chauffeur-spl-competences-et-qualifications" },
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
                TruckMatch valorise les professionnels de la route. Créez votre profil qualifié en
                quelques minutes, affichez vos habilitations et accédez aux meilleures opportunités en
                CDI, CDD et tractions sans intermédiaire.
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

              {/* Mots-clés SEO chauffeur */}
              <div className="hero-seo-pills">
                <span className="seo-pill-label">Spécialités :</span>
                {driverTags.map((tag, i) => (
                  <Link key={i} href={tag.href} className="seo-pill">
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Carte métrique Chauffeur */}
            <div className="recruiter-hero-visual">
              <div className="recruiter-visual-card">
                <div className="visual-metric-row">
                  <div className="visual-metric-icon">
                    <Shield size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">100% Gratuit & Confidentiel</p>
                    <p className="visual-metric-label">Vos coordonnées ne sont partagées qu'avec votre accord</p>
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
                    <p className="visual-metric-val">Vos Compétences Reconnues</p>
                    <p className="visual-metric-label">Valorisation de vos permis CE, C, ADR et CACES grue</p>
                  </div>
                </div>

                <div className="visual-metric-row">
                  <div className="visual-metric-icon" style={{ backgroundColor: "#fef7e6", color: "#f59e0b" }}>
                    <Truck size={26} />
                  </div>
                  <div>
                    <p className="visual-metric-val">Embauche Directe</p>
                    <p className="visual-metric-label">Échangez en direct avec les dirigeants et exploitants transport</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Profils et métiers par permis */}
      <section className="categories-section">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-navy">Métiers du Transport Routier</span>
            <h2>Quel type de conducteur êtes-vous ?</h2>
            <p>
              Consultez les opportunités, salaires moyens et équipements selon votre catégorie de permis.
            </p>
          </div>

          <div className="categories-grid-modern">
            {Object.values(CATEGORIES).map((cat) => (
              <div key={cat.id} className="cat-card-modern">
                <div className="cat-card-top">
                  <span className="cat-icon-emoji">{cat.icon}</span>
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
                  <span>Découvrir le métier</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Avantages Conducteurs */}
      <section className="recruiter-advantages-section">
        <div className="container">
          <div className="recruiter-adv-box">
            <div className="section-header-centered">
              <span className="badge badge-blue">Vos Droits & Votre Confort</span>
              <h2>Une plateforme conçue pour les professionnels de la route</h2>
              <p>
                Fini le harcèlement téléphonique et les missions inadaptées à vos contraintes de vie personnelle.
              </p>
            </div>

            <div className="adv-grid-modern">
              <div className="adv-card-modern">
                <div className="adv-icon-circle">
                  <Clock size={22} />
                </div>
                <h3 className="adv-card-title">Rythme de travail maîtrisé</h3>
                <p className="adv-card-desc">
                  Choisissez vos préférences : retour au domicile tous les soirs, grand régional ou découchés
                  rémunérés selon votre convenance.
                </p>
              </div>

              <div className="adv-card-modern">
                <div className="adv-icon-circle">
                  <Shield size={22} />
                </div>
                <h3 className="adv-card-title">Entreprises de transport vérifiées</h3>
                <p className="adv-card-desc">
                  Seuls les transporteurs et exploitants vérifiés peuvent consulter votre profil et vous
                  adresser des propositions d'embauche.
                </p>
              </div>

              <div className="adv-card-modern">
                <div className="adv-icon-circle">
                  <Award size={22} />
                </div>
                <h3 className="adv-card-title">Valorisation de l'expérience</h3>
                <p className="adv-card-desc">
                  Mettez en avant vos années de conduite, vos certifications ADR citerne ou CACES grue pour
                  négocier de meilleures rémunérations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Formulaire Pré-inscription Chauffeur */}
      <section className="recruiter-form-section" id="inscription-chauffeur">
        <div className="container">
          <div className="recruiter-form-layout">
            <div>
              <span className="badge badge-navy">Inscription 100% Gratuite</span>
              <h2 className="hero-title" style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
                Créez votre profil de chauffeur routier
              </h2>
              <p className="hero-subtitle">
                Remplissez les premières informations en moins de 2 minutes. Votre espace candidat sera
                activé immédiatement et vous recevrez des sollicitations d'entreprises locales.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <FileCheck size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Aucun frais d'inscription ou d'utilisation</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <FileCheck size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Données personnelles protégées (RGPD)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: "600", color: "var(--color-navy)" }}>
                  <FileCheck size={18} style={{ color: "var(--color-primary)" }} />
                  <span>Visibilité auprès de centaines de transporteurs partenaires</span>
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
                      <option value="spl">Permis CE (Super Lourd / SPL)</option>
                      <option value="pl">Permis C (Poids Lourd / PL)</option>
                      <option value="c1">Permis C1 (Porteur léger)</option>
                      <option value="b">Permis B (VUL / Utilitaire)</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Département de résidence *</label>
                    <input type="text" placeholder="Ex: 59 - Nord" required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Disponibilité *</label>
                    <select defaultValue="immediat">
                      <option value="immediat">Disponible immédiatement</option>
                      <option value="48h">Sous 48h à 7 jours</option>
                      <option value="preavis">Sous préavis</option>
                      <option value="veille">En poste mais à l'écoute</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Années d'expérience de conduite</label>
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
                    <span>Créer mon profil chauffeur</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", textAlign: "center", marginTop: "0.5rem" }}>
                  En créant votre compte, vous acceptez les Conditions Générales d'Utilisation de TruckMatch.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
