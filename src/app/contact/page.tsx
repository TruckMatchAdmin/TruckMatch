import React from "react";
import type { Metadata } from "next";
import { Mail, Send, Clock, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contactez l'équipe TruckMatch — Assistance Chauffeurs & Transporteurs",
  description:
    "Une question sur votre inscription, vos recrutements de conducteurs ou l'utilisation de la plateforme TruckMatch ? Contactez notre équipe spécialisée transport.",
  alternates: {
    canonical: "https://truckmatch.fr/contact",
  },
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
            {/* Formulaire interactif relié à l'API Support & Telegram */}
            <ContactForm />

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
                      <p className="info-val">
                        <a href="mailto:jobs@truckmatch.fr" style={{ color: "inherit", textDecoration: "none" }}>
                          jobs@truckmatch.fr
                        </a>
                      </p>
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
