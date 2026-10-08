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

        {/* Colonne Droite : Visuel Photoréaliste Camion */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <Image
              src="/images/hero-home.png"
              alt="Camion Scania TruckMatch moderne sur autoroute au lever du soleil"
              width={1024}
              height={381}
              priority
              className="hero-main-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
