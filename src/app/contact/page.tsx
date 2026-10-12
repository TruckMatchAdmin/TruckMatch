import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Clock,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Truck,
  ArrowRight,
} from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { FacebookIcon, TelegramIcon } from "@/components/ui/SocialIcons";

export const metadata: Metadata = {
  title: "Contactez l'Équipe TruckMatch — Assistance, Recrutement & Support Transport",
  description:
    "Contact direct avec l'équipe TruckMatch : email jobs@truckmatch.fr, Telegram officiel @TruckMatchOfficiel et page Facebook. Permanence d'exploitation pour recruteurs et chauffeurs.",
  alternates: {
    canonical: "https://truckmatch.fr/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      {/* 1. HERO SECTION AVEC BADGE ET TITRE */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <div className="contact-badge-pill">
              <Sparkles size={14} />
              <span>Permanence Sourcing &amp; Exploitation Transport</span>
            </div>

            <h1 className="contact-hero-title">
              Contactez l'Équipe <span>TruckMatch</span>
            </h1>

            <p className="contact-hero-desc">
              Une question technique, un besoin urgent de conducteur routier ou un échange sur votre profil ?
              Notre permanence dédiée aux transporteurs et candidats est à votre écoute en direct.
            </p>

            <div className="contact-trust-strip">
              <span className="contact-trust-item">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Réponse garantie sous 24h ouvrées</span>
              </span>
              <span className="contact-trust-sep">•</span>
              <span className="contact-trust-item">
                <ShieldCheck size={16} color="#0080ff" />
                <span>Échanges sécurisés et confidentiels</span>
              </span>
              <span className="contact-trust-sep">•</span>
              <span className="contact-trust-item">
                <Truck size={16} color="#f59e0b" />
                <span>100% Spécialisé transport routier</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LES 3 CANAUX OFFICIELS DE CONTACT DIRECT */}
      <section className="contact-channels-section">
        <div className="container">
          <div className="contact-channels-grid">
            {/* CANAL 1 : EMAIL DIRECT */}
            <a href="mailto:jobs@truckmatch.fr" className="contact-channel-card">
              <div>
                <div className="contact-channel-icon mail">
                  <Mail size={24} />
                </div>
                <div className="contact-channel-sub">Email Professionnel</div>
                <div className="contact-channel-value">jobs@truckmatch.fr</div>
                <p className="contact-channel-text">
                  Canal direct de la permanence. Idéal pour les besoins de tournées, dépôts de candidatures ou questions administratives.
                </p>
              </div>
              <div className="contact-channel-footer">
                <span>Écrire un message</span>
                <ArrowRight size={15} />
              </div>
            </a>

            {/* CANAL 2 : TELEGRAM OFFICIEL */}
            <a
              href="https://t.me/TruckMatchOfficiel"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-card"
            >
              <div>
                <div className="contact-channel-icon telegram">
                  <TelegramIcon size={26} />
                </div>
                <div className="contact-channel-sub">Canal Telegram Officiel</div>
                <div className="contact-channel-value">@TruckMatchOfficiel</div>
                <p className="contact-channel-text">
                  Messagerie instantanée &amp; alertes en direct. Échangez rapidement avec notre équipe sur Telegram pour toute urgence.
                </p>
              </div>
              <div className="contact-channel-footer">
                <span>Ouvrir sur Telegram</span>
                <ExternalLink size={15} />
              </div>
            </a>

            {/* CANAL 3 : FACEBOOK OFFICIEL */}
            <a
              href="https://www.facebook.com/profile.php?id=61593705328209"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-card"
            >
              <div>
                <div className="contact-channel-icon facebook">
                  <FacebookIcon size={26} />
                </div>
                <div className="contact-channel-sub">Page Facebook Officielle</div>
                <div className="contact-channel-value">TruckMatch Officiel</div>
                <p className="contact-channel-text">
                  Rejoignez la communauté officielle des conducteurs et transporteurs. Actualités, tournées et opportunités en France.
                </p>
              </div>
              <div className="contact-channel-footer">
                <span>Rejoindre sur Facebook</span>
                <ExternalLink size={15} />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 3. SECTION PRINCIPALE : FORMULAIRE DE CONTACT & INFORMATIONS D'EXPLOITATION */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-main-grid">
            {/* COLONNE GAUCHE : FORMULAIRE INTERACTIF */}
            <div className="contact-main-form-wrap">
              <ContactForm />
            </div>

            {/* COLONNE DROITE : HORAIRES & ENGAGEMENTS DE SUPPORT */}
            <div className="contact-sidebar">
              {/* CARTE 1 : PERMANENCE ET HORAIRES */}
              <div className="contact-side-card">
                <div className="contact-side-card-head">
                  <Clock size={16} color="#10b981" />
                  <span>Horaires de la Permanence</span>
                </div>

                <div className="contact-schedule-list">
                  <div className="contact-schedule-row">
                    <span className="contact-schedule-label">Du Lundi au Vendredi</span>
                    <span className="contact-schedule-val">8h30 — 19h00</span>
                  </div>
                  <div className="contact-schedule-row">
                    <span className="contact-schedule-label">Samedi &amp; Dimanche</span>
                    <span className="contact-schedule-val" style={{ color: "#d97706" }}>
                      Astreinte Urgente
                    </span>
                  </div>
                  <div className="contact-schedule-row">
                    <span className="contact-schedule-label">Délai moyen de réponse</span>
                    <span className="contact-schedule-val" style={{ color: "#059669" }}>
                      &lt; 2 heures
                    </span>
                  </div>
                </div>

                <div className="contact-schedule-notice">
                  En dehors des horaires ouvrés, nos notifications par bot Telegram restent actives pour tout besoin urgent de remplacement de conducteur.
                </div>
              </div>

              {/* CARTE 2 : POURQUOI CONTACTER TRUCKMATCH */}
              <div className="contact-side-card">
                <div className="contact-side-card-head">
                  <Truck size={16} color="#0080ff" />
                  <span>Accompagnement Dédié</span>
                </div>

                <ul className="contact-commit-list">
                  <li className="contact-commit-item">
                    <span className="contact-commit-check">✓</span>
                    <div>
                      <strong>Transporteurs :</strong> Déposez vos besoins de conducteurs (SPL, PL, VUL) pour un matching express sous 24h.
                    </div>
                  </li>

                  <li className="contact-commit-item">
                    <span className="contact-commit-check">✓</span>
                    <div>
                      <strong>Conducteurs :</strong> Assistance pour la vérification de vos permis, FIMO, FCO et carte chrono sur votre compte.
                    </div>
                  </li>

                  <li className="contact-commit-item">
                    <span className="contact-commit-check">✓</span>
                    <div>
                      <strong>Zéro intermédiaire :</strong> Vous échangez directement avec les professionnels, sans commission d'agence.
                    </div>
                  </li>
                </ul>
              </div>

              {/* CARTE 3 : LIENS DIRECTS COMMUNAUTÉ */}
              <div className="contact-side-card">
                <div className="contact-side-card-head">
                  <ShieldCheck size={16} color="#0080ff" />
                  <span>Réseau &amp; Communauté Directe</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted, #64748b)", lineHeight: "1.5" }}>
                  Restez informé des nouveaux profils de conducteurs disponibles et des annonces de recrutement :
                </p>

                <div className="contact-social-grid">
                  <a
                    href="https://www.facebook.com/profile.php?id=61593705328209"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-link fb"
                  >
                    <FacebookIcon size={18} />
                    <span>Facebook</span>
                  </a>

                  <a
                    href="https://t.me/TruckMatchOfficiel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-link tg"
                  >
                    <TelegramIcon size={18} />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
