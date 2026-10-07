import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import { Check, Truck, ArrowRight, UserPlus, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Chauffeur PL (Poids Lourd) — Recrutement & Profils Distribution",
  description:
    "Trouvez un chauffeur PL qualifié (Permis C, FIMO/FCO) ou créez votre profil conducteur poids lourd. Distribution régionale, livraisons urbaines, chantiers.",
};

export default function ChauffeurPlPage() {
  const cat = CATEGORIES.pl;

  return (
    <div className="cat-landing">
      <section className="cat-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-breadcrumbs">
              <Link href="/">Accueil</Link> &gt; <Link href="/chauffeurs">Chauffeurs</Link> &gt; <span>PL</span>
            </div>
            <div className="cat-badge-row">
              <span className="badge badge-blue">Permis C • FIMO / FCO</span>
              <span className="badge badge-navy">Véhicules isolés &gt; 3,5 t</span>
            </div>
            <h1 className="hero-title">Chauffeur PL (Poids Lourd)</h1>
            <p className="hero-desc">{cat.longDescription}</p>

            <div className="hero-buttons">
              <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                <UserPlus size={18} />
                <span>Créer mon profil Chauffeur PL</span>
              </Link>
              <Link href="/entreprises" className="btn btn-secondary btn-lg">
                <Building2 size={18} />
                <span>Recruter un Chauffeur PL</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cat-details-section">
        <div className="container">
          <div className="details-grid">
            <div className="details-col card">
              <h2 className="col-title">Compétences et qualifications requises</h2>
              <p className="col-subtitle">Les exigences fondamentales pour la conduite de véhicules poids lourds :</p>
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
              <h2 className="col-title">Missions types en transport PL</h2>
              <p className="col-subtitle">Les activités courantes proposées par les entreprises :</p>
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

          <div className="connection-banner">
            <div className="banner-text">
              <h3>Trouvez un conducteur PL disponible dans votre région</h3>
              <p>Consultez les profils locaux prêts à prendre le volant immédiatement.</p>
            </div>
            <div className="banner-actions">
              <Link href="/entreprises" className="btn btn-primary">
                <span>Accéder aux profils PL</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
