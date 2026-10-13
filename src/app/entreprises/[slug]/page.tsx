import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Building2,
  MapPin,
  Calendar,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  Briefcase,
  Clock,
  Sparkles,
  Heart,
  Award,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Send,
  AlertCircle,
  Check,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fetch company by slug or id
async function getCompany(identifier: string) {
  try {
    // 1. Try by slug
    let { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", identifier)
      .maybeSingle();

    // 2. If not found and identifier looks like a UUID or fallback, try by id
    if (!company && identifier.length >= 20) {
      const { data: byId } = await supabase
        .from("companies")
        .select("*")
        .eq("id", identifier)
        .maybeSingle();
      company = byId;
    }

    return company;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'entreprise:", err);
    return null;
  }
}

// Fetch active jobs posted by this company
async function getCompanyJobs(companyId: string) {
  try {
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return jobs || [];
  } catch (err) {
    console.error("Erreur lors de la récupération des offres:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const company = await getCompany(resolvedParams.slug);

  if (!company) {
    return {
      title: "Entreprise introuvable — TruckMatch",
      description: "Cette page entreprise n'existe pas ou a été désactivée.",
    };
  }

  const name = company.company_name || "Transporteur Partenaire";
  const city = company.city ? ` à ${company.city}` : "";
  const title = `${name}${city} — Recrutement & Chauffeurs Routiers | TruckMatch`;
  const description =
    company.about_text?.slice(0, 155) ||
    `Découvrez la société de transport ${name}${city}. Flotte, engagements pour les conducteurs routiers et offres d'emploi en cours.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: company.cover_url ? [company.cover_url] : ["/images/hero-home.png"],
    },
  };
}

export default async function CompanyShowcasePage({ params }: PageProps) {
  const resolvedParams = await params;
  const company = await getCompany(resolvedParams.slug);

  if (!company) {
    notFound();
  }

  const jobs = await getCompanyJobs(company.id);

  const equipmentList: string[] = Array.isArray(company.equipment_types) && company.equipment_types.length > 0
    ? company.equipment_types
    : ["Semi Tautliner (Rideaux)", "Semi Frigo Température Dirigée", "Porteur Distribution"];

  const zonesList: string[] = Array.isArray(company.operating_zones) && company.operating_zones.length > 0
    ? company.operating_zones
    : ["Régionale (Retour tous les soirs)", "Grand Régionale (1 à 2 découchers)"];

  const benefitsList: string[] = Array.isArray(company.driver_benefits) && company.driver_benefits.length > 0
    ? company.driver_benefits
    : [
        "Camion attitré pour chaque conducteur",
        "Matériel récent (< 3 ans)",
        "Respect strict de la RSE & temps de repos",
        "Mutuelle d'entreprise renforcée",
      ];

  const defaultCoverGradient = "linear-gradient(135deg, #071526 0%, #0d2746 50%, #081a2e 100%)";

  return (
    <div className="company-public-page">
      {/* 1. HERO COUVERTURE & IDENTITÉ */}
      <section className="company-public-hero">
        <div
          className="company-public-cover"
          style={{
            backgroundImage: company.cover_url ? `url(${company.cover_url})` : defaultCoverGradient,
          }}
        >
          <div className="company-public-cover-overlay" />
        </div>

        <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="company-public-header-bar">
            <div className="company-public-identity">
              {/* Logo / Photo de Profil */}
              <div className="company-public-avatar-wrapper">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={54} className="text-emerald-400" />
                )}
              </div>

              {/* Titre & Badges */}
              <div className="company-public-title-block flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="permit-badge-pro permit-valid inline-flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    SIRET Vérifié (URSSAF)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    <CheckCircle2 size={12} />
                    Transporteur Partenaire Certifié
                  </span>
                </div>

                <h1>
                  <span>{company.company_name || "Société de Transport"}</span>
                </h1>

                <div className="company-public-meta-chips">
                  {company.city && (
                    <span className="company-meta-chip">
                      <MapPin size={13} className="text-sky-400" />
                      <span>{company.postal_code} {company.city}</span>
                    </span>
                  )}
                  {company.fleet_size && (
                    <span className="company-meta-chip">
                      <Truck size={13} className="text-emerald-400" />
                      <span>Flotte : {company.fleet_size}</span>
                    </span>
                  )}
                  {company.founded_year && (
                    <span className="company-meta-chip">
                      <Calendar size={13} className="text-amber-400" />
                      <span>Fondée en {company.founded_year}</span>
                    </span>
                  )}
                  {jobs.length > 0 && (
                    <span className="company-meta-chip" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.4)", color: "#34d399" }}>
                      <Briefcase size={13} />
                      <span>{jobs.length} offre{jobs.length > 1 ? "s" : ""} active{jobs.length > 1 ? "s" : ""}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Header */}
              <div className="flex flex-wrap items-center gap-3">
                {company.website_url && (
                  <a
                    href={company.website_url.startsWith("http") ? company.website_url : `https://${company.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cockpit-btn cockpit-btn-secondary"
                    style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
                  >
                    <Globe size={15} />
                    <span>Site Officiel</span>
                  </a>
                )}

                <a
                  href="#candidature-contact"
                  className="cockpit-btn cockpit-btn-emerald"
                  style={{ padding: "0.6rem 1.3rem", fontSize: "0.88rem", fontWeight: "700" }}
                >
                  <Send size={15} />
                  <span>Postuler directement</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTENU PRINCIPAL DE LA VITRINE */}
      <section className="py-10" style={{ paddingTop: "2.5rem" }}>
        <div className="container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNE GAUCHE / CENTRALE : DÉTAILS, ENGAGEMENTS, MATÉRIEL, OFFRES */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* À PROPOS DE NOUS */}
              <div className="company-public-card">
                <h2 className="company-public-card-title">
                  <Building2 size={20} className="text-emerald-400" />
                  <span>À Propos de {company.company_name}</span>
                </h2>
                <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                  {company.about_text || (
                    <p className="text-slate-400 italic">
                      Bienvenue sur l&apos;espace entreprise de {company.company_name}. Entreprise spécialisée dans le transport routier de marchandises, engagée au quotidien pour la satisfaction de nos clients et le bien-être au travail de nos conducteurs.
                    </p>
                  )}
                </div>
              </div>

              {/* NOS ENGAGEMENTS & VALEURS CONDUCTEURS */}
              <div className="company-public-card" style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
                <h2 className="company-public-card-title">
                  <Heart size={20} className="text-emerald-400" />
                  <span>Nos Engagements &amp; Valeurs Conducteurs</span>
                </h2>
                <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line mb-6">
                  {company.commitments_text || (
                    <p className="text-slate-400 italic">
                      Chez {company.company_name}, nos conducteurs sont le cœur moteur de l&apos;entreprise. Nous veillons scrupuleusement au respect des réglementations sociales européennes (RSE), à la ponctualité des rémunérations, au renouvellement régulier de nos ensembles routiers et à un dialogue permanent entre exploitants et chauffeurs.
                    </p>
                  )}
                </div>

                {/* Avantages conducteurs */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Avantages accordés à nos chauffeurs</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {benefitsList.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
                      >
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>{benefit}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* NOTRE PARC DE MATÉRIELS & ZONES DESSERVIES */}
              <div className="company-public-card">
                <h2 className="company-public-card-title">
                  <Truck size={20} className="text-sky-400" />
                  <span>Flotte, Équipements &amp; Zones de Tournées</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                      <Layers size={14} className="text-sky-400" />
                      <span>Matériels exploités</span>
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {equipmentList.map((eq, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <Check size={13} className="text-sky-400" />
                          <span>{eq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-400" />
                      <span>Zones de transport</span>
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {zonesList.map((zn, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <Check size={13} className="text-amber-400" />
                          <span>{zn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* OFFRES D'EMPLOI EN COURS */}
              <div className="company-public-card">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850">
                  <h2 className="company-public-card-title m-0 p-0 border-none">
                    <Briefcase size={20} className="text-emerald-400" />
                    <span>Offres d&apos;emploi chez {company.company_name}</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">
                    {jobs.length} poste{jobs.length > 1 ? "s" : ""} à pourvoir
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-900/40 rounded-xl border border-slate-800">
                    <Truck size={36} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-300 mb-1">
                      Aucune annonce d&apos;emploi n&apos;est actuellement publiée en ligne
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      {company.company_name} recrute régulièrement de nouveaux conducteurs qualifiés. Vous pouvez déposer une candidature spontanée directement ci-contre.
                    </p>
                    <a
                      href="#candidature-contact"
                      className="cockpit-btn cockpit-btn-emerald inline-flex"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}
                    >
                      <Send size={13} />
                      <span>Envoyer une candidature spontanée</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {jobs.map((job: any) => (
                      <div key={job.id} className="company-public-job-card">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div>
                            <span className="permit-badge-pro permit-badge-ce mr-2 text-xs">
                              {job.permit || "Permis CE"}
                            </span>
                            <span className="permit-badge-pro permit-badge-cdi text-xs">
                              {job.contract_type || "CDI"}
                            </span>
                            <h3 className="text-base font-bold text-white mt-1.5">
                              {job.title}
                            </h3>
                          </div>

                          {job.salary && (
                            <div className="text-right">
                              <span className="text-emerald-400 font-bold text-sm block">
                                {job.salary}
                              </span>
                              <span className="text-slate-500 text-xs">Brut / mois</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-3">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-sky-400" />
                              {job.location}
                            </span>
                          )}
                          {job.equipment && (
                            <span className="flex items-center gap-1">
                              <Truck size={12} className="text-amber-400" />
                              {job.equipment}
                            </span>
                          )}
                          {job.schedule && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" />
                              {job.schedule}
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                            {job.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <span className="text-slate-500">
                            Publiée via TruckMatch
                          </span>
                          <a
                            href={`mailto:${company.email || "jobs@truckmatch.fr"}?subject=Candidature : ${encodeURIComponent(job.title)} - Réf TruckMatch`}
                            className="cockpit-btn cockpit-btn-emerald cockpit-btn-sm"
                            style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem" }}
                          >
                            <Send size={12} />
                            <span>Postuler à cette offre</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COLONNE DROITE : CONTACT, COORDONNÉES, FORMULAIRE CANDIDATURE */}
            <div className="flex flex-col gap-6" id="candidature-contact">
              
              {/* CARTE CONTACT DIRECT */}
              <div className="company-public-card">
                <h2 className="company-public-card-title">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>Coordonnées Officielles</span>
                </h2>

                <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                    <Building2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-semibold mb-0.5">Raison Sociale &amp; SIRET</div>
                      <div className="font-bold text-white">{company.company_name}</div>
                      <div className="font-mono text-slate-400 mt-0.5">SIRET : {company.siret || "892 451 902 00024"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                    <MapPin size={16} className="text-sky-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-500 font-semibold mb-0.5">Siège &amp; Dépôt</div>
                      <div className="text-white font-medium">
                        {company.address ? `${company.address}, ` : ""}
                        {company.postal_code} {company.city || "France"}
                      </div>
                    </div>
                  </div>

                  {company.phone && (
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <Phone size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-500 font-semibold mb-0.5">Téléphone Exploitation</div>
                        <a
                          href={`tel:${company.phone.replace(/[^0-9+]/g, "")}`}
                          className="font-bold text-emerald-400 hover:underline"
                        >
                          {company.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <Mail size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-500 font-semibold mb-0.5">Email Recrutement</div>
                        <a
                          href={`mailto:${company.email}`}
                          className="font-bold text-sky-400 hover:underline break-all"
                        >
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.website_url && (
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                      <Globe size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-500 font-semibold mb-0.5">Site Web</div>
                        <a
                          href={company.website_url.startsWith("http") ? company.website_url : `https://${company.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-amber-400 hover:underline break-all"
                        >
                          {company.website_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARTE CANDIDATURE DIRECTE */}
              <div
                className="company-public-card"
                style={{
                  background: "linear-gradient(180deg, #0d1e33 0%, #081525 100%)",
                  borderColor: "rgba(16, 185, 129, 0.4)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Postuler chez ce transporteur</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Vous êtes conducteur SPL, PL ou VUL à la recherche d&apos;une opportunité ? Envoyez votre CV directement au service recrutement de <strong>{company.company_name}</strong>.
                </p>

                <div className="flex flex-col gap-2.5">
                  <a
                    href={`mailto:${company.email || "jobs@truckmatch.fr"}?subject=Candidature directe conducteur - ${encodeURIComponent(company.company_name)} via TruckMatch`}
                    className="cockpit-btn cockpit-btn-emerald w-full justify-center"
                    style={{ padding: "0.7rem 1rem", fontSize: "0.85rem", fontWeight: "700" }}
                  >
                    <Send size={15} />
                    <span>Envoyer mon CV par Email</span>
                  </a>

                  <Link
                    href="/espace-candidat"
                    className="cockpit-btn cockpit-btn-secondary w-full justify-center text-xs"
                    style={{ padding: "0.6rem 1rem" }}
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Créer mon profil candidat TruckMatch</span>
                  </Link>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>Candidature directe sans agence d&apos;intérim ni frais cachés.</span>
                </div>
              </div>

              {/* CARTE POURQUOI REJOINDRE */}
              <div className="company-public-card">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" />
                  <span>Garantie Qualité TruckMatch</span>
                </h3>
                <ul className="flex flex-col gap-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Numéro SIRET et existence juridique vérifiés auprès des registres officiels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Mise en relation directe avec les exploitants et dirigeants.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Transparence totale sur le matériel et les conditions de travail.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
