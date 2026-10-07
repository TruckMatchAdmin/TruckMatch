import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, CheckCircle2, MapPin, Zap } from "lucide-react";

export function Hero() {
  const seoPills = [
    { label: "Chauffeur SPL Régional", href: "/chauffeurs/spl" },
    { label: "Conducteur PL Distribution", href: "/chauffeurs/pl" },
    { label: "Chauffeur Porteur Benne / Grue", href: "/chauffeurs/porteur" },
    { label: "Livreur VUL Express", href: "/chauffeurs/vul" },
    { label: "Traction de nuit", href: "/offres-emploi" },
    { label: "Habilitation ADR", href: "/conseils/chauffeur-spl-competences-et-qualifications" },
  ];

  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Colonne Gauche : Texte & Accroche Recrutement */}
        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            <span>Plateforme N°1 du recrutement transport</span>
          </div>

          <h1 className="hero-title">
            Les entreprises trouvent leurs chauffeurs.
            <span className="hero-title-highlight">Les chauffeurs trouvent leur route.</span>
          </h1>

          <p className="hero-subtitle">
            TruckMatch simplifie et accélère la rencontre directe entre transporteurs et conducteurs
            routiers. Recrutez sans commission intermédiaire ou trouvez votre mission idéale en CDI, CDD et tractions.
          </p>

          <div className="hero-cta-group">
            <Link href="/chauffeurs" className="btn btn-primary btn-lg hero-cta-btn">
              <span>Je suis chauffeur</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/entreprises" className="btn btn-secondary btn-lg hero-cta-btn">
              <span>Je recrute un chauffeur</span>
            </Link>
          </div>

          {/* Mots-clés SEO recrutement interactifs */}
          <div className="hero-seo-pills">
            <span className="seo-pill-label">Recherches fréquentes :</span>
            {seoPills.map((p, idx) => (
              <Link key={idx} href={p.href} className="seo-pill">
                {p.label}
              </Link>
            ))}
          </div>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <CheckCircle2 size={20} className="feature-icon" />
              <span>Profils vérifiés (SPL, PL, VUL)</span>
            </div>
            <div className="hero-feature-item">
              <CheckCircle2 size={20} className="feature-icon" />
              <span>Mise en relation directe en 48h</span>
            </div>
            <div className="hero-feature-item">
              <CheckCircle2 size={20} className="feature-icon" />
              <span>Couverture nationale 100% France</span>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Visuel Photoréaliste Camion + Carte Flottante */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <Image
              src="/images/hero-truck.jpg"
              alt="Camion de transport routier moderne TruckMatch"
              width={720}
              height={480}
              priority
              className="hero-main-img"
            />
            {/* Badge flottant avec statistiques de confiance */}
            <div className="hero-floating-stat">
              <div className="floating-stat-item">
                <div className="stat-icon-circle">
                  <Truck size={22} />
                </div>
                <div>
                  <p className="floating-stat-title">Spécialisation</p>
                  <p className="floating-stat-val">100% Transport</p>
                </div>
              </div>
              <div className="floating-stat-item">
                <div className="stat-icon-circle" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="floating-stat-title">Certifications</p>
                  <p className="floating-stat-val">FIMO / FCO / ADR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
