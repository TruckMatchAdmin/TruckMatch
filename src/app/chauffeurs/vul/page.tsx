import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import { Check, Truck, ArrowRight, UserPlus, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Chauffeur VUL / Camionnette — Dernier Kilomètre & Livraison Rapide",
  description:
    "Recrutez un chauffeur livreur VUL (Permis B) ou trouvez vos missions de distribution urbaine, courses express et messagerie du dernier kilomètre.",
  alternates: {
    canonical: "https://truckmatch.fr/chauffeurs/vul",
  },
};

export default function ChauffeurVulPage() {
  const cat = CATEGORIES.vul;

  return (
    <div className="cat-landing">
      <section className="cat-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-breadcrumbs">
              <Link href="/">Accueil</Link> &gt; <Link href="/chauffeurs">Chauffeurs</Link> &gt; <span>VUL</span>
            </div>
            <div className="cat-badge-row">
              <span className="badge badge-blue">Permis B • Mobilité urbaine</span>
              <span className="badge badge-navy">Véhicules Utilitaires Légers &lt; 3,5 t</span>
            </div>
            <h1 className="hero-title">Chauffeur VUL / Camionnette</h1>
            <p className="hero-desc">{cat.longDescription}</p>

            <div className="hero-buttons">
              <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                <UserPlus size={18} />
                <span>Créer mon profil Chauffeur VUL</span>
              </Link>
              <Link href="/entreprises" className="btn btn-secondary btn-lg">
                <Building2 size={18} />
                <span>Recruter un Chauffeur VUL</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cat-details-section">
        <div className="container">
          <div className="details-grid">
            <div className="details-col card">
              <h2 className="col-title">Qualités et compétences attendues</h2>
              <p className="col-subtitle">Les atouts essentiels pour les missions de livraison express et urbaine :</p>
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
              <h2 className="col-title">Missions types en Véhicule Utilitaire</h2>
              <p className="col-subtitle">Les opportunités d'activité dans le secteur du dernier kilomètre :</p>
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
              <h3>Besoin de renfort immédiat pour vos tournées de livraison ?</h3>
              <p>Accédez aux chauffeurs livreurs disponibles sur votre agglomération.</p>
            </div>
            <div className="banner-actions">
              <Link href="/entreprises" className="btn btn-primary">
                <span>Trouver des livreurs VUL</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
