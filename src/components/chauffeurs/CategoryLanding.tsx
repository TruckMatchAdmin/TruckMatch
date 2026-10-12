"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Truck,
  ArrowRight,
  UserPlus,
  Building2,
  ShieldCheck,
  Clock,
  Euro,
  MapPin,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Briefcase,
  Layers,
} from "lucide-react";

export interface CategoryLandingProps {
  id: "spl" | "pl" | "porteur" | "vul";
  title: string;
  shortTitle: string;
  badgePermit: string;
  badgeWeight: string;
  icon: string;
  heroDescription: string;
  salaryRange: string;
  experienceAvg: string;
  keySkills: string[];
  typicalMissions: string[];
  equipmentList?: string[];
  faqItems: { q: string; a: string }[];
}

const CATEGORY_TABS = [
  { id: "spl", label: "Chauffeur SPL", href: "/chauffeurs/spl", icon: "🚛" },
  { id: "pl", label: "Chauffeur PL", href: "/chauffeurs/pl", icon: "🚚" },
  { id: "porteur", label: "Chauffeur Porteur", href: "/chauffeurs/porteur", icon: "🏗️" },
  { id: "vul", label: "Chauffeur VUL", href: "/chauffeurs/vul", icon: "🚐" },
];

export function CategoryLanding({
  id,
  title,
  shortTitle,
  badgePermit,
  badgeWeight,
  icon,
  heroDescription,
  salaryRange,
  experienceAvg,
  keySkills,
  typicalMissions,
  equipmentList = [],
  faqItems,
}: CategoryLandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="cat-page">
      {/* 1. HERO SECTION */}
      <section className="cat-hero">
        <div className="container">
          {/* Fil d'ariane */}
          <nav aria-label="Fil d'ariane" className="cat-breadcrumbs">
            <Link href="/">Accueil</Link>
            <span className="cat-breadcrumb-sep">&gt;</span>
            <Link href="/chauffeurs">Chauffeurs</Link>
            <span className="cat-breadcrumb-sep">&gt;</span>
            <span className="cat-breadcrumb-current">{shortTitle}</span>
          </nav>

          <div className="cat-hero-grid">
            {/* Colonne gauche : Contenu Hero */}
            <div className="cat-hero-main">
              {/* Badges */}
              <div className="cat-badge-strip">
                <span className="cat-pill cat-pill-primary">
                  <ShieldCheck size={14} />
                  <span>{badgePermit}</span>
                </span>
                <span className="cat-pill cat-pill-navy">
                  <Truck size={14} />
                  <span>{badgeWeight}</span>
                </span>
                <span className="cat-pill cat-pill-success">
                  <span className="cat-pulse-dot" />
                  <span>Profils Disponibles</span>
                </span>
              </div>

              {/* Titre et description */}
              <h1 className="cat-hero-title">{title}</h1>
              <p className="cat-hero-desc">{heroDescription}</p>

              {/* Boutons d'action */}
              <div className="cat-hero-actions">
                <Link href="/inscription?type=candidat" className="btn btn-primary">
                  <UserPlus size={18} />
                  <span>Créer mon profil {shortTitle}</span>
                </Link>
                <Link href="/entreprises" className="btn btn-secondary">
                  <Building2 size={18} />
                  <span>Recruter un {shortTitle}</span>
                </Link>
                <Link href="/carte-chauffeurs" className="btn btn-outline">
                  <MapPin size={17} />
                  <span>Carte des conducteurs</span>
                </Link>
              </div>
            </div>

            {/* Colonne droite : Fiche Chiffres Clés */}
            <div className="cat-hero-aside">
              <div className="cat-kpi-card">
                <div className="cat-kpi-head">
                  <h3>Repères Clés du Métier</h3>
                  <span className="cat-kpi-icon">{icon}</span>
                </div>

                <div className="cat-kpi-list">
                  <div className="cat-kpi-item">
                    <div className="cat-kpi-item-ico">
                      <Euro size={18} />
                    </div>
                    <div>
                      <div className="cat-kpi-label">Rémunération constatée</div>
                      <div className="cat-kpi-value">{salaryRange}</div>
                    </div>
                  </div>

                  <div className="cat-kpi-item">
                    <div className="cat-kpi-item-ico">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="cat-kpi-label">Expérience moyenne</div>
                      <div className="cat-kpi-value">{experienceAvg}</div>
                    </div>
                  </div>

                  <div className="cat-kpi-item">
                    <div className="cat-kpi-item-ico">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="cat-kpi-label">Mise en relation directe</div>
                      <div className="cat-kpi-value">100% Sans agence ni commission</div>
                    </div>
                  </div>
                </div>

                <div className="cat-kpi-footer">
                  <Link href="/offres-emploi">
                    <span>Consulter les offres d'emploi {shortTitle}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRE D'ONGLETS INTER-CATÉGORIES */}
      <nav aria-label="Navigation des catégories" className="cat-switcher-bar">
        <div className="container">
          <div className="cat-switcher-list">
            {CATEGORY_TABS.map((tab) => {
              const isActive = tab.id === id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`cat-switch-tab ${isActive ? "active" : ""}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. DÉTAILS : COMPÉTENCES & MISSIONS */}
      <section className="cat-details-section">
        <div className="container">
          <div className="cat-details-grid">
            {/* Carte Compétences */}
            <div className="cat-box-card">
              <div className="cat-box-head">
                <div className="cat-box-icon blue">
                  <Check size={22} />
                </div>
                <div>
                  <h2 className="cat-box-title">Qualifications & Compétences clés</h2>
                </div>
              </div>
              <p className="cat-box-desc">
                Prérequis et aptitudes recherchés par les entreprises de transport :
              </p>
              <ul className="cat-item-list">
                {keySkills.map((skill, i) => (
                  <li key={i} className="cat-item-row">
                    <Check size={16} className="cat-item-check" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Carte Missions */}
            <div className="cat-box-card">
              <div className="cat-box-head">
                <div className="cat-box-icon navy">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h2 className="cat-box-title">Missions types & Activités</h2>
                </div>
              </div>
              <p className="cat-box-desc">
                Configurations de postes et tournées couramment proposées :
              </p>
              <ul className="cat-item-list">
                {typicalMissions.map((mission, i) => (
                  <li key={i} className="cat-item-row">
                    <Truck size={16} className="cat-item-bullet" />
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. ÉQUIPEMENTS & MATÉRIELS */}
          {equipmentList.length > 0 && (
            <div className="cat-equipment-strip">
              <h3 className="cat-equip-title">Matériels & Configurations associées</h3>
              <p className="cat-equip-subtitle">
                Équipements et types de carrosseries couramment confiés aux conducteurs :
              </p>
              <div className="cat-equip-tags">
                {equipmentList.map((eq, i) => (
                  <span key={i} className="cat-equip-badge">
                    <Layers size={14} />
                    <span>{eq}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. FAQ DE LA CATÉGORIE */}
          {faqItems.length > 0 && (
            <div className="cat-faq-section">
              <div className="cat-section-header">
                <h2>Questions fréquentes — {shortTitle}</h2>
                <p>
                  Tout ce qu'il faut savoir sur les qualifications, les débouchés et le recrutement direct.
                </p>
              </div>

              <div className="cat-faq-list">
                {faqItems.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className={`cat-faq-card ${isOpen ? "open" : ""}`}>
                      <button
                        type="button"
                        className="cat-faq-question"
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <ChevronDown size={20} className="cat-faq-arrow" />
                      </button>
                      {isOpen && (
                        <div className="cat-faq-answer">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. BANNIÈRE CTA CONVERSION */}
          <div className="cat-cta-banner">
            <div className="cat-cta-content">
              <h2>Prêt à accélérer vos recrutements ou trouver une tournée ?</h2>
              <p>
                Rejoignez le réseau TruckMatch : contact direct entre transporteurs et conducteurs
                qualifiés partout en France, sans frais d'intermédiaire.
              </p>
            </div>
            <div className="cat-cta-actions">
              <Link href="/inscription?type=candidat" className="btn-white">
                <UserPlus size={18} />
                <span>Créer mon profil Chauffeur</span>
              </Link>
              <Link href="/entreprises" className="btn-blue-outline">
                <Building2 size={18} />
                <span>Espace Recruteur Transport</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
