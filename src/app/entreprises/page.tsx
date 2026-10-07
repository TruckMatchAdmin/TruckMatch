import React from "react";
import type { Metadata } from "next";
import { CompanySection } from "@/components/home/CompanySection";
import { Building2, Search, CheckCircle, Shield, Clock, ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Espace Entreprise — Recrutez vos chauffeurs routiers sans intermédiaire",
  description:
    "Trouvez et contactez directement des conducteurs qualifiés SPL, PL, Porteur et VUL. Filtrez par permis, zone géographique et disponibilité.",
};

export default function EntreprisesPage() {
  return (
    <div className="entreprises-page">
      {/* Hero Entreprise */}
      <section className="entreprise-hero">
        <div className="container">
          <div className="hero-box">
            <span className="badge badge-navy">Espace Transporteurs & Logistique</span>
            <h1 className="hero-title">
              Recrutez des conducteurs fiables, qualifiés et disponibles
            </h1>
            <p className="hero-subtitle">
              Fini les annonces sans retour et les commissions d'intérim exorbitantes. Accédez directement
              à une base qualifiée de chauffeurs SPL, PL, Porteurs et VUL prêts à prendre le volant sur vos secteurs.
            </p>

            <div className="hero-cta-row">
              <a href="#demande-recrutement" className="btn btn-primary btn-lg">
                <Search size={18} />
                <span>Trouver un chauffeur</span>
              </a>
              <a href="#demande-recrutement" className="btn btn-outline btn-lg">
                <Building2 size={18} />
                <span>Créer mon espace entreprise</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sections étapes et fonctionnalités */}
      <CompanySection />

      {/* Pourquoi choisir TruckMatch */}
      <section className="why-section">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title">Une solution directe pensée pour la rentabilité transport</h2>
            <p className="section-desc">
              Réduisez vos délais de pourvoi de poste et optimisez vos coûts d'exploitation.
            </p>
          </div>

          <div className="value-grid">
            <div className="value-card card">
              <div className="icon-wrap">
                <Clock size={24} />
              </div>
              <h3 className="value-title">Réactivité sous 24h</h3>
              <p className="value-desc">
                Un chauffeur immobilisé ou malade ? Identifiez immédiatement les profils disponibles à
                proximité de votre dépôt.
              </p>
            </div>

            <div className="value-card card">
              <div className="icon-wrap">
                <Shield size={24} />
              </div>
              <h3 className="value-title">Qualifications contrôlées</h3>
              <p className="value-desc">
                Permis poids lourds, validité FIMO/FCO, cartes conducteurs numériques et certificats ADR
                sont systématiquement référencés.
              </p>
            </div>

            <div className="value-card card">
              <div className="icon-wrap">
                <Zap size={24} />
              </div>
              <h3 className="value-title">Modèle direct sans marge horaire</h3>
              <p className="value-desc">
                Vous recrutez en CDI, CDD ou selon vos accords sans reverser un coefficient d'intérim à chaque heure travaillée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de contact / Prise de besoin entreprise */}
      <section id="demande-recrutement" className="request-section">
        <div className="container">
          <div className="request-wrapper">
            <div className="request-text">
              <span className="badge badge-blue">Besoin urgent ou régulier</span>
              <h2 className="request-title">Définissez votre besoin de chauffeur</h2>
              <p className="request-p">
                Indiquez les détails de votre recherche. Notre équipe dédiée transport vous recontactera avec
                les profils qualifiés les plus pertinents sur votre secteur.
              </p>
              <div className="request-checks">
                <div className="check-item">
                  <CheckCircle size={18} className="check-icon" />
                  <span>Prise en compte sous 2 heures ouvrées</span>
                </div>
                <div className="check-item">
                  <CheckCircle size={18} className="check-icon" />
                  <span>Zéro engagement initial</span>
                </div>
                <div className="check-item">
                  <CheckCircle size={18} className="check-icon" />
                  <span>Accompagnement personnalisé</span>
                </div>
              </div>
            </div>

            <div className="request-form-card">
              <form className="company-lead-form">
                <div className="form-group">
                  <label>Raison sociale de l'entreprise</label>
                  <input type="text" placeholder="Ex: Transports Martin" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom du responsable</label>
                    <input type="text" placeholder="Nom et prénom" required />
                  </div>
                  <div className="form-group">
                    <label>Téléphone professionnel</label>
                    <input type="tel" placeholder="06 00 00 00 00" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email professionnel</label>
                  <input type="email" placeholder="contact@entreprise-transport.fr" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Profil recherché</label>
                    <select defaultValue="spl">
                      <option value="spl">Chauffeur SPL</option>
                      <option value="pl">Chauffeur PL</option>
                      <option value="porteur">Chauffeur Porteur</option>
                      <option value="vul">Chauffeur VUL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lieu de départ / Dépôt</label>
                    <input type="text" placeholder="Code postal / Ville" required />
                  </div>
                </div>
                <button type="button" className="btn btn-primary btn-lg w-full mt-2">
                  <span>Envoyer ma demande de recrutement</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
