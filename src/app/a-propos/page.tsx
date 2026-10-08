import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ShieldCheck, HeartHandshake, Target, ArrowRight, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos de TruckMatch — Notre mission au service du transport routier",
  description:
    "Découvrez TruckMatch : la plateforme française indépendante dédiée au recrutement direct entre conducteurs et entreprises de transport routier de marchandises.",
  alternates: {
    canonical: "https://truckmatch.fr/a-propos",
  },
};

export default function AProposPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="hero-box">
            <span className="badge badge-blue">Notre Histoire & Notre Mission</span>
            <h1 className="hero-title">
              « Les entreprises trouvent leurs chauffeurs.
              <br />
              Les chauffeurs trouvent leur route. »
            </h1>
            <p className="hero-subtitle">
              TruckMatch est né d'un constat simple : le secteur du transport routier fait face à une
              tension sans précédent, tandis que les professionnels de la route cherchent un cadre de travail
              respectueux de leurs contraintes et valorisant leurs qualifications.
            </p>
          </div>
        </div>
      </section>

      <section className="about-content-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-card card">
              <div className="card-icon-box">
                <Target size={24} />
              </div>
              <h2 className="card-heading">Notre Mission</h2>
              <p className="card-body">
                Faciliter la rencontre directe et humaine entre les transporteurs et les chauffeurs.
                Nous éliminons les intermédiaires superflus pour permettre des embauches plus rapides, plus
                transparentes et économiquement plus vertueuses pour les deux parties.
              </p>
            </div>

            <div className="about-card card">
              <div className="card-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h2 className="card-heading">Rigueur & Qualité</h2>
              <p className="card-body">
                Le transport lourd ne supporte pas l'amateurisme. Nous valorisons les compétences réelles :
                permis EC et C, FIMO/FCO, cartes conducteurs et habilitations ADR. Chaque profil est référencé
                avec précision.
              </p>
            </div>

            <div className="about-card card">
              <div className="card-icon-box">
                <HeartHandshake size={24} />
              </div>
              <h2 className="card-heading">Respect du Chauffeur</h2>
              <p className="card-body">
                Nous défendons la dignité et la reconnaissance du métier de conducteur routier. Notre
                plateforme permet à chaque chauffeur de choisir sa route, sa zone d'activité et ses
                conditions de travail idéales.
              </p>
            </div>
          </div>

          <div className="about-banner card">
            <div className="banner-logo-wrap">
              <Image
                src="/images/logo.png"
                alt="TruckMatch"
                width={260}
                height={68}
                className="banner-logo"
              />
            </div>
            <div className="banner-cta-content">
              <h3>Rejoignez la première communauté transport indépendante</h3>
              <p>Que vous soyez conducteur à la recherche d'un nouveau défi ou recruteur en quête de fiabilité.</p>
              <div className="banner-btns">
                <Link href="/chauffeurs" className="btn btn-primary">
                  <UserCheck size={16} />
                  <span>Espace Chauffeur</span>
                </Link>
                <Link href="/entreprises" className="btn btn-secondary">
                  <span>Espace Recruteur</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
