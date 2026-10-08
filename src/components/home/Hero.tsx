import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, CheckCircle2, Star } from "lucide-react";

export function Hero() {
  const seoPills = [
    { label: "Chauffeur SPL Régional", href: "/chauffeurs/spl" },
    { label: "SPL Grand Routier", href: "/chauffeurs/spl" },
    { label: "Conducteur PL Distribution", href: "/chauffeurs/pl" },
    { label: "Chauffeur Porteur Benne / Grue", href: "/chauffeurs/porteur" },
    { label: "Livreur VUL Express", href: "/chauffeurs/vul" },
    { label: "Traction de nuit", href: "/offres-emploi" },
  ];

  return (
    <section className="hero-section hero-section-centered">
      <div className="container hero-container-centered">
        {/* Badge & Social Proof Pill */}
        <div className="hero-badge-centered">
          <span className="hero-tag-dot" />
          <span className="hero-badge-text">
            Plateforme N°1 du Recrutement Transport Routier en Direct
          </span>
          <span className="hero-badge-rating">
            <Star size={13} className="hero-star-icon" /> 4.9/5
          </span>
        </div>

        {/* Titre Principal H1 Centré & Ultra-Impactant */}
        <h1 className="hero-title-centered">
          Le Recrutement Transport Réinventé.
          <span className="hero-title-highlight-centered">
            Trouvez Vos Chauffeurs ou Votre Mission en Direct.
          </span>
        </h1>

        {/* Sous-titre accrocheur */}
        <p className="hero-subtitle-centered">
          Fini les intermédiaires coûteux et les semaines d'attente. TruckMatch connecte directement
          les transporteurs et les conducteurs routiers qualifiés partout en France.
          Sans commission, rapide et 100% transparent.
        </p>

        {/* Double Bloc d'Action Inscription Chauffeur & Recruteur */}
        <div className="hero-action-cards-grid">
          {/* Carte Chauffeur */}
          <div className="hero-action-card hero-action-card-driver">
            <div className="hero-action-card-badge">Candidats</div>
            <div className="hero-action-card-header">
              <div className="hero-action-icon-wrap hero-action-icon-driver">
                <Truck size={24} />
              </div>
              <div className="hero-action-card-title-group">
                <h3>Vous êtes Chauffeur ?</h3>
                <p>100% Gratuit • Accès direct aux employeurs</p>
              </div>
            </div>
            <ul className="hero-action-list">
              <li>
                <CheckCircle2 size={16} className="hero-check-icon" />
                <span>Offres directes en CDI, CDD, Tractions & Saisonnier</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="hero-check-icon" />
                <span>Soyez contacté directement par les patrons sans intermédiaire</span>
              </li>
            </ul>
            <Link href="/inscription?type=candidat" className="btn btn-primary btn-lg hero-card-btn">
              <span>Créer mon profil Chauffeur</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Carte Entreprise / Transporteur */}
          <div className="hero-action-card hero-action-card-company">
            <div className="hero-action-card-badge hero-action-badge-company">Transporteurs</div>
            <div className="hero-action-card-header">
              <div className="hero-action-icon-wrap hero-action-icon-company">
                <ShieldCheck size={24} />
              </div>
              <div className="hero-action-card-title-group">
                <h3>Vous êtes Transporteur ?</h3>
                <p>0% Commission • Vivier national qualifié</p>
              </div>
            </div>
            <ul className="hero-action-list">
              <li>
                <CheckCircle2 size={16} className="hero-check-icon" />
                <span>Accès instantané aux chauffeurs disponibles dans votre région</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="hero-check-icon" />
                <span>Permis et certifications vérifiés (SPL, PL, VUL, FIMO)</span>
              </li>
            </ul>
            <Link href="/entreprises" className="btn btn-secondary btn-lg hero-card-btn">
              <span>Publier ou Recruter un Chauffeur</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Recherche Rapide / SEO Pills Centrés */}
        <div className="hero-seo-pills-centered">
          <span className="seo-pill-label">Spécialités recherchées :</span>
          {seoPills.map((p, idx) => (
            <Link key={idx} href={p.href} className="seo-pill">
              {p.label}
            </Link>
          ))}
        </div>

        {/* Visuel Photoréaliste Camion Centré en Grand Format */}
        <div className="hero-visual-centered">
          <div className="hero-image-wrapper-centered">
            <Image
              src="/images/hero-home.png"
              alt="Camion Scania TruckMatch moderne sur autoroute au lever du soleil"
              width={1120}
              height={420}
              priority
              className="hero-main-img-centered"
            />
          </div>

          {/* Bandeau de Chiffres Clés / Réassurance sous le camion */}
          <div className="hero-stats-strip">
            <div className="hero-stat-box">
              <div className="hero-stat-number">+1 850</div>
              <div className="hero-stat-label">Chauffeurs Référencés</div>
            </div>
            <div className="hero-stat-separator" />
            <div className="hero-stat-box">
              <div className="hero-stat-number">&lt; 48h</div>
              <div className="hero-stat-label">Délai Moyen de Contact</div>
            </div>
            <div className="hero-stat-separator" />
            <div className="hero-stat-box">
              <div className="hero-stat-number">0 €</div>
              <div className="hero-stat-label">Commission d'Agence</div>
            </div>
            <div className="hero-stat-separator" />
            <div className="hero-stat-box">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Profils & Permis Vérifiés</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
