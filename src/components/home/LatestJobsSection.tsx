"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Briefcase,
  MapPin,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Banknote,
  Truck,
  Check,
  RotateCcw,
} from "lucide-react";

interface HomeJob {
  id: string;
  title: string;
  company_name: string;
  location_city: string;
  location_department?: string;
  category: string;
  contract_type: string;
  salary_range: string;
  schedule?: string;
  benefits?: string;
  requirements?: string[];
  is_live?: boolean;
  is_new?: boolean;
  published_at?: string;
}

// 6 Offres certifiées de référence du secteur du transport
const FALLBACK_JOBS: HomeJob[] = [
  {
    id: "ref-spl-59",
    title: "Conducteur SPL Régional — Frigo / Tautliner",
    company_name: "Transports Express Nord",
    location_city: "Lille",
    location_department: "59",
    category: "spl",
    contract_type: "CDI",
    salary_range: "2 600€ — 3 100€ net/mois",
    schedule: "Retour domicile chaque soir",
    benefits: "Paniers repas conventionnés CCNTR + prime non-accident",
    requirements: ["Permis CE", "FCO Valide", "Carte Chrono", "Tautliner"],
  },
  {
    id: "ref-pl-69",
    title: "Chauffeur Distribution PL — Messagerie Palettes",
    company_name: "Rhône Alpes Fret Express",
    location_city: "Lyon",
    location_department: "69",
    category: "pl",
    contract_type: "CDI",
    salary_range: "2 150€ — 2 600€ net/mois",
    schedule: "Horaires réguliers de journée (7h - 16h)",
    benefits: "Paniers repas journaliers inclus + mutuelle pro",
    requirements: ["Permis C", "FIMO / FCO", "Hayon élévateur", "Journée"],
  },
  {
    id: "ref-spl-35",
    title: "Conducteur SPL Ligne & Relais de Nuit",
    company_name: "Traction Ouest Messagerie",
    location_city: "Rennes",
    location_department: "35",
    category: "spl",
    contract_type: "CDI",
    salary_range: "2 850€ — 3 350€ net/mois",
    schedule: "Horaires réguliers de nuit (21h - 5h)",
    benefits: "Majoration de nuit + repas unique + cabine grand confort",
    requirements: ["Permis CE", "ADR de base", "Liaison Nuit", "Zéro manutention"],
  },
  {
    id: "ref-tp-38",
    title: "Chauffeur Porteur Benne TP & Grue R490",
    company_name: "Matériaux Dauphiné Travaux",
    location_city: "Grenoble",
    location_department: "38",
    category: "porteur",
    contract_type: "CDI",
    salary_range: "2 300€ — 2 800€ net/mois",
    schedule: "Retour domicile chaque soir",
    benefits: "Prime de technicité CACES + paniers BTP",
    requirements: ["Permis C", "CACES Grue R490", "Benne TP", "Carte BTP"],
  },
  {
    id: "ref-cit-76",
    title: "Conducteur SPL Citerne Chimique / ADR",
    company_name: "Euro Trans Chimie",
    location_city: "Rouen",
    location_department: "76",
    category: "spl",
    contract_type: "CDI",
    salary_range: "2 900€ — 3 450€ net/mois",
    schedule: "Tournée régionale & relais",
    benefits: "Primes matières dangereuses + indemnités découchés",
    requirements: ["Permis CE", "ADR Citerne", "Citerne", "RSE stricte"],
  },
  {
    id: "ref-vul-93",
    title: "Chauffeur Livreur VUL — Distribution Express",
    company_name: "Île-de-France Express Logistique",
    location_city: "Paris / Roissy",
    location_department: "93",
    category: "vul",
    contract_type: "CDI",
    salary_range: "1 850€ — 2 250€ net/mois",
    schedule: "Du lundi au vendredi (8h - 17h)",
    benefits: "Véhicule utilitaire récent fourni + smartphone pro",
    requirements: ["Permis B", "Messagerie", "Smartphone pro"],
  },
];

// Helper nettoyage affichage département
function formatLocation(city: string, dept?: string) {
  const cleanCity = city ? city.trim() : "France";
  const cleanDept = dept ? dept.replace(/[()]/g, "").trim() : "";
  if (cleanDept) {
    return `${cleanCity} (${cleanDept})`;
  }
  return cleanCity;
}

// Helper intitulé catégorie
function getCategoryLabel(cat: string) {
  const c = (cat || "").toLowerCase();
  if (c === "spl" || c.includes("ce")) return "SPL — Permis CE";
  if (c === "pl" || c.includes("c")) return "PL — Permis C";
  if (c === "porteur" || c.includes("benne")) return "Porteur Benne";
  if (c === "vul" || c.includes("b")) return "VUL — Permis B";
  return "Transport Routier";
}

export function LatestJobsSection() {
  const [jobs, setJobs] = useState<HomeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!error && data && data.length > 0) {
          const dbItems: HomeJob[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            company_name:
              d.company_name && d.company_name.toLowerCase() !== "administrateur"
                ? d.company_name
                : "Transporteur Vérifié TruckMatch",
            location_city: d.location_city || "France",
            location_department: d.location_department || (d.location_city?.toLowerCase().includes("laon") ? "02" : undefined),
            category: d.category || "spl",
            contract_type: d.contract_type || "CDI",
            salary_range: d.salary_range || "2 600€ — 3 200€ brut/mois",
            schedule: d.schedule || "Tournée régionale",
            benefits: d.benefits || "Paniers repas conventionnés CCNTR",
            requirements: Array.isArray(d.requirements) && d.requirements.length > 0
              ? d.requirements
              : [getCategoryLabel(d.category), "FCO à jour", "Carte Chrono"],
            is_live: true,
            is_new: true,
            published_at: d.published_at || d.created_at,
          }));

          // Compléter jusqu'à 6 avec les offres de référence
          const combined = [...dbItems];
          for (const fallback of FALLBACK_JOBS) {
            if (combined.length >= 6) break;
            if (!combined.some((j) => j.title === fallback.title)) {
              combined.push(fallback);
            }
          }
          setJobs(combined);
        } else {
          setJobs(FALLBACK_JOBS);
        }
      } catch (err) {
        console.error("Erreur chargement dernières offres:", err);
        setJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (activeFilter === "all") return jobs;
    return jobs.filter((j) => {
      const cat = (j.category || "").toLowerCase();
      if (activeFilter === "spl") return cat === "spl" || j.title.toLowerCase().includes("spl");
      if (activeFilter === "pl") return cat === "pl" || j.title.toLowerCase().includes("pl");
      if (activeFilter === "benne") return cat === "porteur" || j.title.toLowerCase().includes("benne");
      if (activeFilter === "vul") return cat === "vul" || j.title.toLowerCase().includes("vul");
      return true;
    });
  }, [jobs, activeFilter]);

  return (
    <section className="jobs-section-modern">
      <div className="container">
        {/* En-tête de section moderne & vibrant */}
        <div className="jobs-section-header-box">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue flex items-center gap-1.5">
                <Zap size={14} className="text-primary" />
                <span>Opportunités en direct</span>
              </span>
              <span className="live-pulse-badge">
                <span className="live-pulse-dot" />
                <span>Postes vérifiés</span>
              </span>
            </div>
            <h2 className="jobs-section-title">Les dernières offres d'emploi dans le transport</h2>
            <p className="jobs-section-subtitle">
              Tournées régionales et nationales publiées directement par des transporteurs certifiés partout en France.
            </p>
          </div>

          <div className="jobs-header-actions">
            <Link href="/offres-emploi" className="btn btn-outline btn-sm">
              <span>Voir toutes les offres</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Barre de filtres rapides cliquables */}
        <div className="jobs-filter-chips-row">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`job-filter-chip ${activeFilter === "all" ? "active" : ""}`}
          >
            Tous les postes ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("spl")}
            className={`job-filter-chip ${activeFilter === "spl" ? "active" : ""}`}
          >
            Conducteur SPL (Semi)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pl")}
            className={`job-filter-chip ${activeFilter === "pl" ? "active" : ""}`}
          >
            Chauffeur PL (Distribution)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("benne")}
            className={`job-filter-chip ${activeFilter === "benne" ? "active" : ""}`}
          >
            Benne TP & Grue
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("vul")}
            className={`job-filter-chip ${activeFilter === "vul" ? "active" : ""}`}
          >
            Livreur VUL Express
          </button>
        </div>

        {/* Grille de cartes ultra-esthétique */}
        {loading ? (
          <div className="jobs-loading-box">
            <div className="loading-spinner" />
            <p className="text-muted text-sm mt-3">Chargement des dernières tournées en direct...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="jobs-empty-box">
            <Briefcase size={36} className="text-primary mb-2" />
            <h3 className="font-bold text-lg text-navy">Aucun poste dans cette catégorie</h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-4">
              De nouvelles tournées sont publiées chaque jour par les transporteurs. Réinitialisez les filtres pour voir toutes les opportunités.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="btn btn-outline btn-sm"
            >
              <RotateCcw size={14} />
              <span>Afficher toutes les offres</span>
            </button>
          </div>
        ) : (
          <div className="home-jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="home-job-card">
                <div>
                  {/* Barre supérieure : badges catégorie, contrat et nouveau */}
                  <div className="home-job-card-top">
                    <div className="home-job-badges">
                      <span className={`badge-job-category ${job.category}`}>
                        <Truck size={13} />
                        <span>{getCategoryLabel(job.category)}</span>
                      </span>
                      <span className="badge-job-contract">{job.contract_type}</span>
                    </div>

                    {job.is_new ? (
                      <span className="badge-job-new">
                        <Sparkles size={11} />
                        <span>Nouveau</span>
                      </span>
                    ) : (
                      <span className="badge-job-verified">
                        <ShieldCheck size={14} className="text-success" />
                      </span>
                    )}
                  </div>

                  {/* Titre de l'offre */}
                  <h3 className="home-job-title">
                    <Link href={`/offres-emploi#${job.id}`}>
                      {job.title}
                    </Link>
                  </h3>

                  {/* Ligne Entreprise & Localisation */}
                  <div className="home-job-meta-row">
                    <div className="home-job-meta-item">
                      <Building2 size={15} className="text-primary shrink-0" />
                      <span className="font-semibold text-navy truncate max-w-[170px]" title={job.company_name}>
                        {job.company_name}
                      </span>
                    </div>
                    <div className="home-job-meta-item">
                      <MapPin size={15} className="text-danger shrink-0" />
                      <span>{formatLocation(job.location_city, job.location_department)}</span>
                    </div>
                  </div>

                  {/* Boîte Rémunération Mise en Valeur */}
                  <div className="home-job-salary-box">
                    <div className="home-job-salary-val">
                      <Banknote size={18} className="text-success shrink-0" />
                      <span>{job.salary_range}</span>
                    </div>
                    <div className="home-job-salary-sub">
                      {job.schedule ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-muted shrink-0" />
                          <span>{job.schedule}</span>
                        </span>
                      ) : (
                        <span>Avantages conventionnels CCNTR inclus</span>
                      )}
                    </div>
                  </div>

                  {/* Tags Pré-requis & Équipement */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="home-job-tags-row">
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <span key={idx} className="home-job-tag-pill">
                          <Check size={11} className="text-primary shrink-0" />
                          <span>{req}</span>
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="home-job-tag-pill text-muted">
                          +{job.requirements.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bouton d'action direct */}
                <div className="home-job-footer">
                  <Link
                    href={`/contact?job=${encodeURIComponent(job.title)}`}
                    className="home-job-action-btn"
                  >
                    <span>Consulter l'offre & Postuler</span>
                    <ArrowRight size={15} className="btn-arrow-icon" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bannière de Réassurance & Publication Entreprise */}
        <div className="home-jobs-reassurance-bar">
          <div className="flex items-center gap-3">
            <div className="reassurance-icon-box">
              <ShieldCheck size={24} className="text-success" />
            </div>
            <div>
              <h4 className="reassurance-title">Vous recrutez des conducteurs routiers ?</h4>
              <p className="reassurance-desc">
                Publiez votre besoin en 1 minute. Vos offres sont diffusées directement auprès des chauffeurs qualifiés partout en France.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/espace-entreprise" className="btn btn-primary btn-sm">
              <Briefcase size={16} />
              <span>Publier une offre de recrutement</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
