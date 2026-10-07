import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            <span>Plateforme N°1 du recrutement transport</span>
          </div>

          <h1 className="hero-title">
            Les entreprises trouvent leurs chauffeurs.
            <br />
            <span className="hero-title-highlight">Les chauffeurs trouvent leur route.</span>
          </h1>

          <p className="hero-subtitle">
            TruckMatch facilite la rencontre entre les entreprises et les chauffeurs du transport
            routier. Recrutez sans intermédiaire superflu ou trouvez votre prochain poste en toute
            transparence.
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

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span>Profils qualifiés SPL, PL, VUL</span>
            </div>
            <div className="hero-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span>Contact direct et sans commission</span>
            </div>
            <div className="hero-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span>Couverture nationale immédiate</span>
            </div>
          </div>
        </div>

        {/* Visuel Hero dynamique */}
        <div className="hero-visual">
          <div className="hero-card-main">
            <div className="hero-logo-frame">
              <Image
                src="/images/logo.png"
                alt="TruckMatch"
                width={380}
                height={100}
                className="hero-logo-img"
                priority
              />
            </div>
            <div className="hero-stat-card card-stat-1">
              <div className="stat-icon-box bg-blue">
                <Truck size={22} />
              </div>
              <div>
                <p className="stat-label">Spécialisation</p>
                <p className="stat-value">100% Transport</p>
              </div>
            </div>
            <div className="hero-stat-card card-stat-2">
              <div className="stat-icon-box bg-green">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="stat-label">Habilitations</p>
                <p className="stat-value">FIMO / FCO / ADR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
