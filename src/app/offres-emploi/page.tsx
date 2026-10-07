"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { JobOffer } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, MapPin, Building, Search } from "lucide-react";

export default function OffresEmploiPage() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        let query = supabase.from("jobs").select("*").order("published_at", { ascending: false });

        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;
        if (error || !data) {
          setJobs([]);
        } else {
          setJobs(data as JobOffer[]);
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [selectedCategory]);

  const filteredJobs = jobs.filter((j) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.location_city.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="offres-page">
      <section className="offres-hero">
        <div className="container">
          <div className="hero-box">
            <span className="badge badge-blue">Recrutement transport direct</span>
            <h1 className="hero-title">Offres d'emploi conducteurs & chauffeurs</h1>
            <p className="hero-subtitle">
              Postulez directement auprès des entreprises de transport. CDI, CDD et missions
              régionales ou nationales vérifiées.
            </p>
          </div>
        </div>
      </section>

      <section className="offres-content-section">
        <div className="container">
          {/* Barre de filtres */}
          <div className="filter-bar card">
            <div className="filter-search">
              <Search size={18} className="search-ico" />
              <input
                type="text"
                placeholder="Rechercher par métier, ville, entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-categories">
              <button
                type="button"
                className={`category-pill ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Toutes les offres
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "spl" ? "active" : ""}`}
                onClick={() => setSelectedCategory("spl")}
              >
                Chauffeur SPL
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "pl" ? "active" : ""}`}
                onClick={() => setSelectedCategory("pl")}
              >
                Chauffeur PL
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "porteur" ? "active" : ""}`}
                onClick={() => setSelectedCategory("porteur")}
              >
                Porteur
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "vul" ? "active" : ""}`}
                onClick={() => setSelectedCategory("vul")}
              >
                VUL / Messagerie
              </button>
            </div>
          </div>

          {/* Affichage des résultats */}
          {loading ? (
            <div className="jobs-loading">
              <div className="loading-spinner" />
              <p>Chargement des offres disponibles...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            /* Respect strict : si aucune donnée en base, état vide propre */
            <EmptyState
              icon={Briefcase}
              title="Aucune offre disponible pour le moment"
              description="Les entreprises publient de nouvelles offres quotidiennement. Créez votre profil pour être alerté immédiatement dès qu'un poste correspond à vos permis et à votre secteur."
              actionText="Créer mon profil chauffeur"
              actionHref="/chauffeurs"
              secondaryActionText="Déposer une annonce pour mon entreprise"
              secondaryActionHref="/entreprises"
            />
          ) : (
            <div className="jobs-list">
              {filteredJobs.map((job) => (
                <div key={job.id} id={job.id} className="job-row-card card">
                  <div className="job-row-main">
                    <div className="job-row-tags">
                      <span className="badge badge-blue">{job.category.toUpperCase()}</span>
                      <span className="badge badge-navy">{job.contract_type}</span>
                    </div>
                    <h2 className="job-row-title">{job.title}</h2>
                    <div className="job-row-meta">
                      <span className="meta-point">
                        <Building size={16} /> {job.company_name}
                      </span>
                      <span className="meta-point">
                        <MapPin size={16} /> {job.location_city} ({job.location_department})
                      </span>
                    </div>
                    <p className="job-row-desc">{job.description}</p>
                  </div>
                  <div className="job-row-side">
                    {job.salary_range && <p className="salary-tag">{job.salary_range}</p>}
                    <Link href={`/contact?job=${encodeURIComponent(job.title)}`} className="btn btn-primary w-full">
                      <span>Postuler</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
