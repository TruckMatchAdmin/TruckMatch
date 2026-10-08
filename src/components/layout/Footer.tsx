import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/lib/constants/navigation";
import { ShieldCheck, Truck, ArrowRight, Mail, Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      {/* 1. Pre-Footer Call to Action Banner */}
      <div className="container">
        <div className="footer-cta-card">
          <div className="footer-cta-content">
            <span className="footer-cta-badge">
              <Sparkles size={14} /> Réseau Direct Transport N°1
            </span>
            <h3 className="footer-cta-title">
              Prêt à accélérer vos recrutements ou trouver votre mission ?
            </h3>
            <p className="footer-cta-subtitle">
              Rejoignez plus de 1 850 conducteurs routiers qualifiés et des centaines d'entreprises de transport en direct, sans commission d'agence.
            </p>
          </div>
          <div className="footer-cta-actions">
            <Link href="/chauffeurs" className="btn btn-primary btn-lg footer-cta-btn">
              <span>Créer mon profil Chauffeur</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/entreprises" className="btn btn-secondary btn-lg footer-cta-btn">
              <span>Espace Entreprise / Recruter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation */}
      <div className="container footer-main-container">
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo-link" aria-label="TruckMatch">
            <Image
              src="/images/logo.png"
              alt="TruckMatch"
              width={260}
              height={66}
              className="footer-logo-img"
            />
          </Link>
          <p className="footer-tagline">
            « Les entreprises trouvent leurs chauffeurs.
            <br />
            Les chauffeurs trouvent leur route. »
          </p>
          <p className="footer-desc">
            La première plateforme technologique de mise en relation directe dédiée aux professionnels du transport routier de marchandises en France.
          </p>

          <div className="footer-trust-list">
            <div className="footer-trust-item">
              <ShieldCheck size={16} className="trust-icon" />
              <span>Titres professionnels vérifiés (Permis, FIMO, Chrono)</span>
            </div>
            <div className="footer-trust-item">
              <Truck size={16} className="trust-icon" />
              <span>100% Dédié transport lourd, porteur et messagerie</span>
            </div>
            <div className="footer-trust-item">
              <Mail size={16} className="trust-icon" />
              <a href="mailto:contact@truckmatch.fr" className="footer-contact-email">
                contact@truckmatch.fr
              </a>
            </div>
          </div>
        </div>

        {/* Colonnes Liens */}
        <div className="footer-nav-grid">
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Chauffeurs</h4>
            <ul className="footer-links-list">
              {FOOTER_LINKS.chauffeurs.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Entreprises</h4>
            <ul className="footer-links-list">
              {FOOTER_LINKS.entreprises.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Guides & Conseils</h4>
            <ul className="footer-links-list">
              {FOOTER_LINKS.conseils.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Informations</h4>
            <ul className="footer-links-list">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Sub-Footer Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-flex">
          <div className="footer-bottom-left">
            <p className="footer-copyright-text">
              © {currentYear} <strong>TruckMatch</strong>. Tous droits réservés. Plateforme indépendante de sourcing direct transport.
            </p>
          </div>

          <div className="footer-status-indicator">
            <span className="status-dot-pulse" />
            <span>Plateforme sécurisée & opérationnelle</span>
          </div>

          <div className="footer-bottom-nav">
            <Link href="/mentions-legales" className="footer-legal-link">Mentions légales</Link>
            <span className="footer-dot-sep">•</span>
            <Link href="/politique-confidentialite" className="footer-legal-link">Confidentialité</Link>
            <span className="footer-dot-sep">•</span>
            <Link href="/cgu" className="footer-legal-link">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
