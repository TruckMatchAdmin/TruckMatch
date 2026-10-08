import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import { Check, Truck, ArrowRight, UserPlus, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Chauffeur SPL (Super Lourd) — Recrutement & Profils Qualifiés",
  description:
    "Trouvez un chauffeur SPL (Permis EC, FIMO/FCO, carte conducteur) ou déposez votre profil de conducteur super lourd. Missions régionales, nationales et tractions.",
  alternates: {
    canonical: "https://truckmatch.fr/chauffeurs/spl",
  },
};

export default function ChauffeurSplPage() {
  const cat = CATEGORIES.spl;

  return (
    <div className="cat-landing">
      {/* Hero Catégorie */}
      <section className="cat-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-breadcrumbs">
              <Link href="/">Accueil</Link> &gt; <Link href="/chauffeurs">Chauffeurs</Link> &gt; <span>SPL</span>
            </div>
            <div className="cat-badge-row">
              <span className="badge badge-blue">Permis EC • FIMO / FCO</span>
              <span className="badge badge-navy">Ensembles articulés &gt; 44 t</span>
            </div>
            <h1 className="hero-title">Chauffeur SPL (Super Poids Lourd)</h1>
            <p className="hero-desc">{cat.longDescription}</p>

            <div className="hero-buttons">
              <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                <UserPlus size={18} />
                <span>Créer mon profil Chauffeur SPL</span>
              </Link>
              <Link href="/entreprises" className="btn btn-secondary btn-lg">
                <Building2 size={18} />
                <span>Recruter un Chauffeur SPL</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Détails Compétences & Missions */}
      <section className="cat-details-section">
        <div className="container">
          <div className="details-grid">
            <div className="details-col card">
              <h2 className="col-title">Compétences et qualifications clés</h2>
              <p className="col-subtitle">Les prérequis indispensables pour exercer et recruter un conducteur SPL :</p>
              <ul className="details-list">
                {cat.keySkills.map((skill, i) => (
                  <li key={i} className="list-item">
                    <Check size={18} className="check-ico" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="details-col card">
              <h2 className="col-title">Missions et types de postes</h2>
              <p className="col-subtitle">Les configurations de travail les plus recherchées par les transporteurs :</p>
              <ul className="details-list">
                {cat.typicalMissions.map((mission, i) => (
                  <li key={i} className="list-item">
                    <Truck size={18} className="truck-ico" />
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bannière de mise en relation */}
          <div className="connection-banner">
            <div className="banner-text">
              <h3>Besoin d'un chauffeur SPL sur votre secteur ?</h3>
              <p>Recherchez dès maintenant par zone géographique et qualifications spécifiques.</p>
            </div>
            <div className="banner-actions">
              <Link href="/entreprises" className="btn btn-primary">
                <span>Trouver un chauffeur SPL</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
