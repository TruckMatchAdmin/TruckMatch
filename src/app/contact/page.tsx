import React from "react";
import type { Metadata } from "next";
import { Mail, Send, Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contactez l'équipe TruckMatch — Assistance Chauffeurs & Transporteurs",
  description:
    "Une question sur votre inscription, vos recrutements de conducteurs ou l'utilisation de la plateforme TruckMatch ? Contactez notre équipe spécialisée transport.",
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <div className="hero-box">
            <span className="badge badge-blue">Support & Équipe</span>
            <h1 className="hero-title">Contactez l'équipe TruckMatch</h1>
            <p className="hero-subtitle">
              Une question technique, un besoin spécifique de recrutement ou une assistance sur votre profil ?
              Nous sommes à votre écoute pour vous accompagner.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-main-section">
        <div className="container">
          <div className="contact-grid">
            {/* Formulaire */}
            <div className="contact-form-card card">
              <h2 className="form-head">Envoyez-nous un message</h2>
              <p className="form-desc">Nous vous répondons sous 24h ouvrées.</p>

              <form className="contact-form">
                <div className="form-group">
                  <label>Vous êtes</label>
                  <select defaultValue="entreprise">
                    <option value="entreprise">Une entreprise de transport / Recruteur</option>
                    <option value="chauffeur">Un chauffeur routier / Candidat</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nom et prénom</label>
                    <input type="text" placeholder="Jean Dupont" required />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" placeholder="06 12 34 56 78" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email de contact</label>
                  <input type="email" placeholder="contact@exemple.fr" required />
                </div>

                <div className="form-group">
                  <label>Sujet de votre message</label>
                  <input type="text" placeholder="Ex: Renseignement recrutement SPL, profil chauffeur..." required />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={5} placeholder="Précisez votre demande..." required />
                </div>

                <button type="button" className="btn btn-primary btn-lg w-full mt-2">
                  <Send size={18} />
                  <span>Envoyer ma demande</span>
                </button>
              </form>
            </div>

            {/* Informations pratiques */}
            <div className="contact-info-col">
              <div className="info-box card">
                <h3 className="info-title">Plateforme TruckMatch</h3>
                <p className="info-sub">La référence du recrutement direct en transport routier de marchandises.</p>

                <div className="info-items">
                  <div className="info-row">
                    <div className="info-icon">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="info-label">Email</p>
                      <p className="info-val">contact@truckmatch.fr</p>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-icon">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="info-label">Horaires du support</p>
                      <p className="info-val">Du lundi au vendredi : 8h30 - 18h30</p>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-icon">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="info-label">Confidentialité</p>
                      <p className="info-val">Données sécurisées et conformes RGPD</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-promo card">
                <h4>Vous êtes recruteur avec un besoin urgent ?</h4>
                <p>
                  Indiquez-le dans l'objet de votre message pour un traitement prioritaire de votre recherche de
                  conducteur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
