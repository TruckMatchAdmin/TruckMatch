import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ARTICLES } from "@/lib/constants/articles";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Conseils & Recrutement Transport — Guides et Bonnes Pratiques",
  description:
    "Guides complets pour recruter un chauffeur SPL, PL ou VUL, réussir son parcours de conducteur routier, réglementation FIMO/FCO et astuces d'embauche transport.",
};

export default function ConseilsHubPage() {
  return (
    <div className="conseils-page">
      <section className="conseils-hero">
        <div className="container">
          <div className="hero-box">
            <span className="badge badge-blue">Centre de ressources transport</span>
            <h1 className="hero-title">Conseils & recrutement transport</h1>
            <p className="hero-subtitle">
              Tout ce que les transporteurs et les conducteurs doivent savoir : réglementation,
              astuces d'embauche, formations obligatoires et gestion de carrière routière.
            </p>
          </div>
        </div>
      </section>

      <section className="conseils-list-section">
        <div className="container">
          <div className="articles-grid">
            {ARTICLES.map((art) => (
              <article key={art.slug} className="article-card card">
                <div className="card-top">
                  <span className="badge badge-navy">{art.category_label}</span>
                  <span className="time-badge">
                    <Clock size={13} /> {art.read_time}
                  </span>
                </div>
                <h2 className="card-title">
                  <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
                </h2>
                <p className="card-summary">{art.summary}</p>
                <div className="card-footer">
                  <Link href={`/conseils/${art.slug}`} className="read-more-link">
                    <span>Lire le guide complet</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bannière d'action */}
          <div className="advice-cta-card">
            <div className="cta-info">
              <h3>Vous recrutez des conducteurs ou cherchez un poste ?</h3>
              <p>Rejoignez la communauté TruckMatch et accélérez vos mises en relation.</p>
            </div>
            <div className="cta-actions">
              <Link href="/chauffeurs" className="btn btn-primary">
                <span>Je suis chauffeur</span>
              </Link>
              <Link href="/entreprises" className="btn btn-outline">
                <span>Je suis une entreprise</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
