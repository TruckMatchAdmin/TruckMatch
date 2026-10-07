"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { JobOffer } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, MapPin, ArrowRight, Building } from "lucide-react";

export function LatestJobsSection() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(6);

        if (error || !data) {
          // Table non encore migrée ou vide => liste vide
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

    fetchJobs();
  }, []);

  return (
    <section className="jobs-section">
      <div className="container">
        <div className="section-head-flex">
          <div className="head-left">
            <span className="badge badge-blue">Opportunités transport</span>
            <h2 className="section-title">Les dernières offres d'emploi</h2>
            <p className="section-subtitle">
              Consultez les offres publiées en direct par des entreprises de transport vérifiées.
            </p>
          </div>
          <div className="head-right">
            <Link href="/offres-emploi" className="btn btn-outline btn-sm">
              <span>Voir toutes les offres</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="jobs-loading">
            <div className="loading-spinner" />
            <p>Recherche des offres en cours...</p>
          </div>
        ) : jobs.length === 0 ? (
          /* Respect strict de la règle : état vide propre si 0 offre réelle */
          <EmptyState
            icon={Briefcase}
            title="Aucune offre disponible pour le moment"
            description="Les nouvelles opportunités de postes SPL, PL et VUL sont publiées régulièrement. Créez votre profil pour être contacté en priorité dès qu'une offre correspond à votre zone."
            actionText="Créer mon profil"
            actionHref="/chauffeurs"
            secondaryActionText="Déposer une annonce recruteur"
            secondaryActionHref="/entreprises"
          />
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-top">
                  <span className="badge badge-blue">{job.category.toUpperCase()}</span>
                  <span className="contract-badge">{job.contract_type}</span>
                </div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span className="meta-item">
                    <Building size={14} /> {job.company_name}
                  </span>
                  <span className="meta-item">
                    <MapPin size={14} /> {job.location_city} ({job.location_department})
                  </span>
                </div>
                {job.salary_range && <p className="job-salary">{job.salary_range}</p>}
                <div className="job-card-bottom">
                  <Link href={`/offres-emploi#${job.id}`} className="btn btn-outline btn-sm w-full">
                    <span>Consulter l'offre</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
