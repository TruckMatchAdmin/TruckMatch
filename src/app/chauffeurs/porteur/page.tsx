import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import { Check, Truck, ArrowRight, UserPlus, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Chauffeur Porteur — Recrutement & Profils Camion Porteur",
  description:
    "Recrutez un chauffeur sur camion porteur rigide ou proposez vos compétences : benne, plateau, grue auxiliaire, frigo. Plateforme spécialisée transport.",
};

export default function ChauffeurPorteurPage() {
  const cat = CATEGORIES.porteur;

  return (
    <div className="cat-landing">
      <section className="cat-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-breadcrumbs">
              <Link href="/">Accueil</Link> &gt; <Link href="/chauffeurs">Chauffeurs</Link> &gt; <span>Porteur</span>
            </div>
            <div className="cat-badge-row">
              <span className="badge badge-blue">Permis C / EC • FIMO / FCO</span>
              <span className="badge badge-navy">Véhicules porteurs rigides & équipements</span>
            </div>
            <h1 className="hero-title">Chauffeur Porteur</h1>
            <p className="hero-desc">{cat.longDescription}</p>

            <div className="hero-buttons">
              <Link href="/chauffeurs" className="btn btn-primary btn-lg">
                <UserPlus size={18} />
                <span>Créer mon profil Chauffeur Porteur</span>
              </Link>
              <Link href="/entreprises" className="btn btn-secondary btn-lg">
                <Building2 size={18} />
                <span>Recruter un Conducteur Porteur</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cat-details-section">
        <div className="container">
          <div className="details-grid">
            <div className="details-col card">
              <h2 className="col-title">Compétences techniques spécifiques</h2>
              <p className="col-subtitle">Les aptitudes indispensables à la conduite et à la manœuvre d'un porteur :</p>
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
              <h2 className="col-title">Missions et domaines d'intervention</h2>
              <p className="col-subtitle">Les secteurs professionnels qui recrutent des chauffeurs porteurs :</p>
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
              <h3>Besoin d'un chauffeur porteur avec matériel spécialisé ?</h3>
              <p>Filtrez les profils selon les habilitations CACES grue, hayon ou benne.</p>
            </div>
            <div className="banner-actions">
              <Link href="/entreprises" className="btn btn-primary">
                <span>Trouver un profil qualifié</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
