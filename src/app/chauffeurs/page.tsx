import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants/categories";
import { UserCheck, Shield, Award, MapPin, ArrowRight, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace Chauffeur — Créez votre profil et trouvez votre route",
  description:
    "Rejoignez TruckMatch gratuitement. Mettez en avant vos permis SPL, PL, VUL, vos qualifications FIMO/FCO et soyez visible auprès des meilleures entreprises de transport.",
};

export default function ChauffeursHubPage() {
  return (
    <div className="chauffeurs-page">
      {/* Hero Chauffeur */}
      <section className="chauffeur-hero">
        <div className="container">
          <div className="hero-box">
            <span className="badge badge-blue">Conducteurs & Chauffeurs Routiers</span>
            <h1 className="page-title">
              Trouvez la route et l'entreprise qui vous correspondent
            </h1>
            <p className="page-desc">
              TruckMatch valorise les professionnels de la route. Créez votre profil complet en
              quelques minutes, mettez en avant vos qualifications et accédez à des missions
              respectueuses de votre rythme de travail.
            </p>
            <div className="cta-wrapper">
              <a href="#inscription-chauffeur" className="btn btn-primary btn-lg">
                <UserCheck size={18} />
                <span>Créer mon profil gratuitement</span>
              </a>
              <Link href="/offres-emploi" className="btn btn-outline btn-lg">
                <span>Consulter les offres d'emploi</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Profils recherchés */}
      <section className="category-selection-section">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title">Quel type de conducteur êtes-vous ?</h2>
            <p className="section-desc">
              Consultez les compétences recherchées et les opportunités selon votre permis et spécialité.
            </p>
          </div>

          <div className="cat-grid">
            {Object.values(CATEGORIES).map((cat) => (
              <div key={cat.id} className="cat-item-card">
                <div className="cat-icon-lg">{cat.icon}</div>
                <h3 className="cat-name">{cat.title}</h3>
                <p className="cat-summary">{cat.description}</p>
                <div className="cat-permits-list">
                  {cat.permits.map((p, i) => (
                    <span key={i} className="permit-tag">
                      {p}
                    </span>
                  ))}
                </div>
                <Link href={`/chauffeurs/${cat.slug}`} className="btn btn-outline-primary btn-sm mt-auto">
                  <span>En savoir plus sur le métier</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages détaillés */}
      <section className="benefits-detailed-section">
        <div className="container">
          <div className="benefits-container">
            <div className="benefits-text">
              <span className="badge badge-navy">Pourquoi TruckMatch ?</span>
              <h2 className="section-title">Une plateforme pensée par et pour les gens de la route</h2>
              <div className="benefits-list">
                <div className="benefit-row">
                  <div className="benefit-icon-bullet">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="benefit-head">Protection de vos coordonnées</h3>
                    <p className="benefit-detail">
                      Vos informations privées ne sont partagées qu'avec des entreprises de transport
                      vérifiées et sérieuses.
                    </p>
                  </div>
                </div>

                <div className="benefit-row">
                  <div className="benefit-icon-bullet">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="benefit-head">Respect de votre zone géographique</h3>
                    <p className="benefit-detail">
                      Ciblez exactement vos secteurs préférés : régional, national, tractions de nuit ou
                      retour au domicile chaque soir.
                    </p>
                  </div>
                </div>

                <div className="benefit-row">
                  <div className="benefit-icon-bullet">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="benefit-head">Valorisation de vos habilitations</h3>
                    <p className="benefit-detail">
                      Mettez en avant vos atouts qui font la différence : ADR de base ou citerne, CACES grue
                      auxiliaire, frigo, porte-engins.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de pré-inscription chauffeur */}
            <div id="inscription-chauffeur" className="form-card">
              <h3 className="form-title">Créer mon profil chauffeur</h3>
              <p className="form-subtitle">
                Remplissez les premières informations pour amorcer votre espace candidat.
              </p>

              <form className="driver-lead-form">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input type="text" placeholder="Ex: Jean Dupont" required />
                </div>
                <div className="form-group">
                  <label>Spécialité principale</label>
                  <select required defaultValue="spl">
                    <option value="spl">Chauffeur SPL (Super Lourd)</option>
                    <option value="pl">Chauffeur PL (Poids Lourd)</option>
                    <option value="porteur">Chauffeur Porteur</option>
                    <option value="vul">Chauffeur VUL / Camionnette</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Département ou ville de résidence</label>
                  <input type="text" placeholder="Ex: 59 - Lille" required />
                </div>
                <div className="form-group">
                  <label>Disponibilité</label>
                  <select defaultValue="immediat">
                    <option value="immediat">Disponible immédiatement</option>
                    <option value="preavis">Sous préavis</option>
                    <option value="ponctuel">Missions ponctuelles</option>
                  </select>
                </div>
                <button type="button" className="btn btn-primary btn-lg w-full mt-2">
                  <FileCheck size={18} />
                  <span>Finaliser mon inscription</span>
                </button>
                <p className="form-privacy">
                  Inscription 100% gratuite. Données protégées conformément au RGPD.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
