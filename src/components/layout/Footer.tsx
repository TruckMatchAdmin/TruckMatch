import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/lib/constants/navigation";
import { ShieldCheck, Truck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Colonne Marque */}
        <div className="footer-brand">
          <Link href="/" className="footer-logo-link">
            <Image
              src="/images/logo.png"
              alt="TruckMatch"
              width={220}
              height={56}
              className="footer-logo-img"
            />
          </Link>
          <p className="footer-tagline">
            « Les entreprises trouvent leurs chauffeurs.
            <br />
            Les chauffeurs trouvent leur route. »
          </p>
          <p className="footer-desc">
            La plateforme de référence spécialisée dans le recrutement et la mise en relation directe
            entre transporteurs et conducteurs routiers.
          </p>
          <div className="footer-badges">
            <span className="badge badge-blue">
              <Truck size={14} /> 100% Transport routier
            </span>
            <span className="badge badge-navy">
              <ShieldCheck size={14} /> Profils vérifiés
            </span>
          </div>
        </div>

        {/* Colonnes Liens */}
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-title">Chauffeurs</h4>
            <ul className="footer-list">
              {FOOTER_LINKS.chauffeurs.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Entreprises</h4>
            <ul className="footer-list">
              {FOOTER_LINKS.entreprises.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Conseils & Métiers</h4>
            <ul className="footer-list">
              {FOOTER_LINKS.conseils.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Informations</h4>
            <ul className="footer-list">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Barre basse */}
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="footer-copyright">
            © {currentYear} TruckMatch. Tous droits réservés. Plateforme indépendante de mise en relation transport.
          </p>
          <div className="footer-bottom-links">
            <Link href="/mentions-legales" className="bottom-link">
              Mentions légales
            </Link>
            <span className="separator">•</span>
            <Link href="/politique-confidentialite" className="bottom-link">
              Confidentialité
            </Link>
            <span className="separator">•</span>
            <Link href="/cgu" className="bottom-link">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
