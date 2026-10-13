"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  MapPin,
  CheckCircle2,
  Award,
  Briefcase,
  Navigation,
  ShieldCheck,
  Filter,
  Users,
  Search,
  RotateCcw,
} from "lucide-react";

interface DriverRecord {
  id: string;
  first_name: string;
  last_name: string;
  permits: string[];
  city: string;
  postal_code?: string;
  experience?: string;
  experience_years?: string | number;
  specialties?: string[];
  availability?: string;
  bio?: string;
  created_at?: string;
  status?: string;
  is_approved?: boolean;
}

const REGION_DEPTS: Record<string, string[]> = {
  hdf: ["59", "62", "80", "02", "60"],
  idf: ["75", "77", "78", "91", "92", "93", "94", "95"],
  ara: ["69", "38", "01", "42", "73", "74", "03", "15", "43", "63", "07", "26"],
  ge: ["67", "68", "54", "57", "08", "10", "51", "52", "55", "88"],
  paca: ["13", "83", "06", "84", "04", "05"],
  na: ["33", "40", "64", "16", "17", "19", "23", "24", "47", "79", "86", "87"],
  bzh: ["35", "22", "29", "56", "44", "49", "53", "72", "85"],
};

export function QualifiedDriversSection() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [selectedPermit, setSelectedPermit] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");

  useEffect(() => {
    async function loadApprovedDrivers() {
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .neq("status", "rejected")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          setDrivers(data);
        } else {
          setDrivers([]);
        }
      } catch (err) {
        console.error("Erreur chargement chauffeurs qualifiés:", err);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    }

    loadApprovedDrivers();
  }, []);

  // Quick filter handlers
  const handleQuickFilter = (type: string) => {
    setActiveQuickFilter(type);
    if (type === "all") {
      setSelectedPermit("all");
      setSelectedSpecialty("all");
    } else if (type === "spl") {
      setSelectedPermit("spl");
      setSelectedSpecialty("all");
    } else if (type === "pl") {
      setSelectedPermit("pl");
      setSelectedSpecialty("all");
    } else if (type === "adr") {
      setSelectedPermit("all");
      setSelectedSpecialty("adr");
    } else if (type === "grue") {
      setSelectedPermit("all");
      setSelectedSpecialty("grue");
    } else if (type === "nuit") {
      setSelectedPermit("all");
      setSelectedSpecialty("nuit");
    }
  };

  const resetFilters = () => {
    setSelectedPermit("all");
    setSelectedRegion("all");
    setSelectedSpecialty("all");
    setSelectedAvailability("all");
    setActiveQuickFilter("all");
  };

  // Filtrage dynamique
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      // Permis
      if (selectedPermit !== "all") {
        const permitsStr = (d.permits || []).join(" ").toUpperCase();
        if (selectedPermit === "spl" && !permitsStr.includes("CE")) return false;
        if (selectedPermit === "pl" && !permitsStr.includes("C")) return false;
        if (selectedPermit === "vul" && !permitsStr.includes("B")) return false;
      }

      // Région
      if (selectedRegion !== "all") {
        const depts = REGION_DEPTS[selectedRegion] || [];
        const deptPrefix = (d.postal_code || "").slice(0, 2);
        if (!depts.includes(deptPrefix)) return false;
      }

      // Spécialité
      if (selectedSpecialty !== "all") {
        const specs = (d.specialties || []).join(" ").toLowerCase();
        const bio = (d.bio || "").toLowerCase();
        const combined = `${specs} ${bio}`;

        if (selectedSpecialty === "adr" && !combined.includes("adr")) return false;
        if (selectedSpecialty === "grue" && !combined.includes("grue") && !combined.includes("r490")) return false;
        if (selectedSpecialty === "frigo" && !combined.includes("frigo") && !combined.includes("température")) return false;
        if (selectedSpecialty === "nuit" && !combined.includes("nuit") && !combined.includes("relais")) return false;
        if (selectedSpecialty === "benne" && !combined.includes("benne") && !combined.includes("tp")) return false;
      }

      // Disponibilité
      if (selectedAvailability !== "all") {
        const avail = (d.availability || "").toLowerCase();
        if (selectedAvailability === "immediat" && !avail.includes("immediat")) return false;
        if (selectedAvailability === "48h" && !avail.includes("48h") && !avail.includes("semaine")) return false;
        if (selectedAvailability === "preavis" && !avail.includes("preavis") && !avail.includes("mois")) return false;
      }

      return true;
    });
  }, [drivers, selectedPermit, selectedRegion, selectedSpecialty, selectedAvailability]);

  const hasActiveFilters =
    selectedPermit !== "all" ||
    selectedRegion !== "all" ||
    selectedSpecialty !== "all" ||
    selectedAvailability !== "all" ||
    activeQuickFilter !== "all";

  return (
    <>
      {/* 2. Moteur de Recherche & Filtres Rapides */}
      <section className="recruiter-filter-section" id="recherche-chauffeurs">
        <div className="container">
          <div className="recruiter-filter-box">
            <div className="filter-header-wrap">
              <h2 className="filter-title">Filtrer les conducteurs disponibles</h2>
              <p className="filter-subtitle">
                Ciblez précisément les compétences et la zone d&apos;intervention souhaitées pour vos camions.
              </p>
            </div>

            <div className="filter-controls-grid">
              <div className="filter-field">
                <label>Permis requis</label>
                <select
                  value={selectedPermit}
                  onChange={(e) => {
                    setSelectedPermit(e.target.value);
                    setActiveQuickFilter("custom");
                  }}
                >
                  <option value="all">Tous les permis (SPL, PL, VUL)</option>
                  <option value="spl">Permis CE — Super Lourd (SPL)</option>
                  <option value="pl">Permis C — Poids Lourd (PL)</option>
                  <option value="vul">Permis B — VUL / Utilitaire</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Région / Dépôt</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setActiveQuickFilter("custom");
                  }}
                >
                  <option value="all">Toute la France</option>
                  <option value="hdf">Hauts-de-France (59, 62, 80)</option>
                  <option value="idf">Île-de-France (75, 77, 91, 93, 95)</option>
                  <option value="ara">Auvergne-Rhône-Alpes (69, 38, 01, 42)</option>
                  <option value="ge">Grand Est (67, 68, 54, 57)</option>
                  <option value="paca">PACA (13, 83, 06, 84)</option>
                  <option value="na">Nouvelle-Aquitaine (33, 40, 64)</option>
                  <option value="bzh">Bretagne & Pays de la Loire (35, 44)</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Spécialité / Habilitation</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setActiveQuickFilter("custom");
                  }}
                >
                  <option value="all">Toutes habilitations</option>
                  <option value="adr">ADR Citerne ou Colis</option>
                  <option value="grue">CACES Grue R490</option>
                  <option value="frigo">Température dirigée (Frigo)</option>
                  <option value="nuit">Tractions régulières de nuit</option>
                  <option value="benne">Benne TP / Travaux publics</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Disponibilité</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => {
                    setSelectedAvailability(e.target.value);
                    setActiveQuickFilter("custom");
                  }}
                >
                  <option value="all">Toutes disponibilités</option>
                  <option value="immediat">Disponible immédiatement</option>
                  <option value="48h">Sous 48h à 7 jours</option>
                  <option value="preavis">Sous préavis (1 mois)</option>
                </select>
              </div>
            </div>

            <div className="filter-tags-quick">
              <span className="quick-tag-label">Filtres rapides :</span>
              <button
                type="button"
                className={`quick-filter-btn ${activeQuickFilter === "all" ? "active" : ""}`}
                onClick={() => handleQuickFilter("all")}
              >
                Tous les profils
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${activeQuickFilter === "spl" ? "active" : ""}`}
                onClick={() => handleQuickFilter("spl")}
              >
                Conducteurs SPL CE
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${activeQuickFilter === "pl" ? "active" : ""}`}
                onClick={() => handleQuickFilter("pl")}
              >
                Chauffeurs PL C
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${activeQuickFilter === "adr" ? "active" : ""}`}
                onClick={() => handleQuickFilter("adr")}
              >
                ADR Citerne
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${activeQuickFilter === "grue" ? "active" : ""}`}
                onClick={() => handleQuickFilter("grue")}
              >
                CACES Grue
              </button>
              <button
                type="button"
                className={`quick-filter-btn ${activeQuickFilter === "nuit" ? "active" : ""}`}
                onClick={() => handleQuickFilter("nuit")}
              >
                Lignes de Nuit
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="quick-filter-btn"
                  onClick={resetFilters}
                  style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--color-primary)" }}
                >
                  <RotateCcw size={13} />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Aperçu des Profils Chauffeurs Vérifiés */}
      <section className="driver-profiles-section" id="profils-chauffeurs">
        <div className="container">
          <div className="section-head-modern">
            <span className="badge badge-navy">Base de Chauffeurs Actifs</span>
            <h2>Conducteurs qualifiés prêts à prendre la route</h2>
            <p>
              Consultez les dossiers de compétences vérifiés disponibles sur notre réseau de transporteurs.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#94a3b8" }}>
              Chargement des conducteurs vérifiés en direct...
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-xl)",
                padding: "3.5rem 2rem",
                textAlign: "center",
                boxShadow: "var(--shadow-md)",
                border: "1px solid #e2e8f0",
                maxWidth: "760px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <ShieldCheck size={32} />
              </div>

              <h3
                style={{
                  fontSize: "1.28rem",
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: "0.5rem",
                }}
              >
                {drivers.length === 0
                  ? "Dossiers conducteurs en cours de qualification"
                  : "Aucun conducteur ne correspond à ces critères"}
              </h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.65",
                  fontSize: "0.95rem",
                  maxWidth: "580px",
                  margin: "0 auto 1.75rem",
                }}
              >
                {drivers.length === 0
                  ? "Pour garantir une qualification irréprochable aux transporteurs, chaque nouveau profil inscrit est minutieusement contrôlé (titres professionnels, validité FCO et carte chronotachygraphe) avant sa publication sur le réseau."
                  : "Essayez d'élargir votre sélection de filtres ou de réinitialiser la recherche pour voir tous les profils disponibles."}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.85rem",
                  flexWrap: "wrap",
                }}
              >
                {hasActiveFilters && drivers.length > 0 ? (
                  <button type="button" onClick={resetFilters} className="btn btn-primary">
                    <RotateCcw size={16} />
                    <span>Afficher tous les conducteurs ({drivers.length})</span>
                  </button>
                ) : (
                  <>
                    <Link href="/inscription?type=entreprise" className="btn btn-primary">
                      <Briefcase size={16} />
                      <span>Créer mon espace entreprise</span>
                    </Link>
                    <Link href="/inscription?type=candidat" className="btn btn-outline">
                      <Users size={16} />
                      <span>Déposer un profil conducteur</span>
                    </Link>
                  </>
                )}
                <Link href="/carte-chauffeurs" className="btn btn-outline">
                  <Navigation size={16} />
                  <span>Consulter la carte interactive</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="driver-profiles-grid">
              {filteredDrivers.map((driver) => {
                const initials = `${(driver.first_name || "C")[0]}${(driver.last_name || "D")[0]}`.toUpperCase();
                const permitText =
                  driver.permits && driver.permits.length > 0
                    ? `Permis ${driver.permits[0]}`
                    : "Permis CE";
                const roleText = driver.permits?.includes("CE")
                  ? "Conducteur Routier SPL"
                  : driver.permits?.includes("C")
                  ? "Chauffeur Distribution PL"
                  : driver.permits?.includes("B")
                  ? "Conducteur Livreur VUL"
                  : "Conducteur Professionnel";
                const dept = driver.postal_code ? driver.postal_code.slice(0, 2) : "";
                const locationText = driver.city
                  ? `${driver.city} ${dept ? `(${dept})` : ""}`
                  : "France";
                const availText =
                  driver.availability === "immediate"
                    ? "Disponible immédiatement"
                    : driver.availability === "notice"
                    ? "Disponible sous 48h"
                    : "Disponible";

                const expText =
                  driver.experience_years
                    ? `${driver.experience_years} ans d'expérience`
                    : driver.experience === "5+"
                    ? "Plus de 5 ans d'expérience"
                    : driver.experience === "3-5"
                    ? "3 à 5 ans d'expérience"
                    : "1 à 2 ans d'expérience";

                const badgesList =
                  Array.isArray(driver.specialties) && driver.specialties.length > 0
                    ? driver.specialties.slice(0, 4)
                    : ["FCO Valide", "Carte Chrono à jour", "Éco-conduite"];

                return (
                  <div key={driver.id} className="driver-profile-card">
                    <div className="driver-card-top">
                      <div className="driver-avatar-info">
                        <div className="driver-avatar-circle">{initials}</div>
                        <div>
                          <h3 className="driver-card-title">{roleText}</h3>
                          <div className="driver-card-meta">
                            <span className="driver-meta-item">
                              <MapPin size={14} />
                              <span>{locationText}</span>
                            </span>
                            <span className="badge badge-blue">{permitText}</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-green">{availText}</span>
                    </div>

                    <div className="driver-card-badges">
                      {badgesList.map((b, idx) => (
                        <span key={idx} className="permit-pill-modern">
                          <CheckCircle2 size={12} style={{ color: "var(--color-primary)" }} />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>

                    <p className="driver-card-desc">
                      {driver.bio ||
                        "Conducteur expérimenté et rigoureux, disponible pour missions régionales ou nationales dans le respect de la RSE."}
                    </p>

                    <div className="driver-card-footer">
                      <span className="driver-experience-badge">
                        <Award
                          size={14}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: "4px",
                          }}
                        />
                        {expText}
                      </span>

                      <div className="btn-group">
                        <Link href="/inscription?type=entreprise" className="btn btn-primary btn-sm">
                          <Briefcase size={14} />
                          <span>Demander le profil</span>
                        </Link>
                        <Link
                          href={`/carte-chauffeurs?candidat=${driver.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          <span>Voir sur la carte</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
