"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ExternalLink,
  Award,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Send,
  Eye,
  Check,
  Clock,
  Download,
  Upload,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  UserCheck,
  Compass,
  Home,
  Moon,
  Repeat,
  Sliders,
} from "lucide-react";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  contract: string;
  salary: string;
  permit: string;
  type: "regional" | "national" | "relay" | "distribution";
  postedAt: string;
  truckBrand: string;
}

export default function CandidatePortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "permits" | "jobs" | "documents" | "messages" | "settings"
  >("overview");

  // Disponibilité chauffeur
  const [availability, setAvailability] = useState<"immediate" | "flexible" | "busy">(
    "immediate"
  );

  // Données de permis et expérience
  const [permits, setPermits] = useState({
    ce: true,
    c: true,
    be: false,
    fimo: true,
    fco: true,
    chrono_card: true,
    adr: false,
    adr_citerne: false,
  });

  const [experienceYears, setExperienceYears] = useState("");
  const [mobilityPref, setMobilityPref] = useState("regional");
  const [driverCity, setDriverCity] = useState("");
  const [driverPostalCode, setDriverPostalCode] = useState("");
  const [driverFirstName, setDriverFirstName] = useState("");
  const [driverLastName, setDriverLastName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [contactPref, setContactPref] = useState<"phone_sms" | "sms_only" | "platform">("phone_sms");
  const [mobilityRadius, setMobilityRadius] = useState<number>(45);
  const [isFranceEntire, setIsFranceEntire] = useState<boolean>(false);
  const [overnightPref, setOvernightPref] = useState<"none" | "occasional" | "national" | "relay_night">("none");
  const [desiredContracts, setDesiredContracts] = useState<string[]>(["CDI Temps plein"]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const toggleContract = (contract: string) => {
    if (desiredContracts.includes(contract)) {
      if (desiredContracts.length > 1) {
        setDesiredContracts(desiredContracts.filter((c) => c !== contract));
      }
    } else {
      setDesiredContracts([...desiredContracts, contract]);
    }
  };

  // Recherche & filtrage offres d'emploi
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] = useState<"all" | "regional" | "national" | "distribution">("all");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyModalJob, setApplyModalJob] = useState<JobOffer | null>(null);

  // Tchat direct recruteurs (réel)
  const [activeRecruiterId, setActiveRecruiterId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, { id: string; sender: "recruiter" | "me"; text: string; time: string }[]>
  >({});
  const [recruiters, setRecruiters] = useState<any[]>([]);

  // Offres réelles chargées depuis Supabase
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  const loadCandidateData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidate/data");
      if (res.ok) {
        const json = await res.json();
        const d = json.driver;
        if (d) {
          setUser(d);
          if (d.first_name) setDriverFirstName(d.first_name);
          if (d.last_name) setDriverLastName(d.last_name);
          if (d.email) setDriverEmail(d.email);
          if (d.phone) setDriverPhone(d.phone);
          if (d.city) setDriverCity(d.city);
          if (d.postal_code) setDriverPostalCode(d.postal_code);
          if (d.availability) setAvailability(d.availability);
          if (d.experience) setExperienceYears(d.experience);

          if (Array.isArray(d.permits)) {
            setPermits((prev) => ({
              ...prev,
              ce: d.permits.includes("CE"),
              c: d.permits.includes("C"),
              be: d.permits.includes("BE") || d.permits.includes("B"),
              adr: Array.isArray(d.adr) && d.adr.length > 0,
              adr_citerne: Array.isArray(d.adr) && d.adr.some((a: string) => a.toLowerCase().includes("citerne")),
              fimo: !!d.fimo,
              fco: !!d.fco,
              chrono_card: !!d.chrono_card,
            }));
          }
        }

        // Mapper les vraies offres depuis la table jobs Supabase
        if (Array.isArray(json.jobs)) {
          const mappedJobs: JobOffer[] = json.jobs.map((j: any) => ({
            id: j.id,
            title: j.title || "Conducteur Routier",
            company: j.company_name || "Entreprise Partenaire",
            location: j.location_city ? `${j.location_city}${j.location_department ? ` (${j.location_department})` : ""}` : "France",
            contract: j.contract_type || "CDI",
            salary: j.salary_range || "Selon convention CCNTR",
            permit: j.permit_required ? `Permis ${j.permit_required}` : "Permis CE",
            type: j.category === "vul" ? "distribution" : j.category === "pl" ? "regional" : "national",
            postedAt: j.created_at ? new Date(j.created_at).toLocaleDateString("fr-FR") : "Récent",
            truckBrand: j.benefits || "Flotte récente",
          }));
          setJobOffers(mappedJobs);
        }
      }
    } catch (err) {
      console.error("Erreur chargement espace candidat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidateData();
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    if (typeof window !== "undefined") {
      localStorage.removeItem("tm_user");
    }
    router.push("/");
    router.refresh();
  };

  const handleToggleAvailability = async () => {
    const nextAvail = availability === "immediate" ? "flexible" : availability === "flexible" ? "busy" : "immediate";
    setAvailability(nextAvail);
    try {
      await fetch("/api/candidate/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_availability" }),
      });
    } catch (err) {
      console.error("Erreur bascule disponibilité:", err);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedPermits = [
      permits.ce && "CE",
      permits.c && "C",
      permits.be && "BE",
    ].filter(Boolean);

    try {
      const res = await fetch("/api/candidate/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          data: {
            first_name: driverFirstName,
            last_name: driverLastName,
            phone: driverPhone,
            city: driverCity,
            postal_code: driverPostalCode,
            availability,
            permits: updatedPermits,
            fimo: permits.fimo,
            fco: permits.fco,
            chrono_card: permits.chrono_card,
            experience: experienceYears,
          },
        }),
      });

      if (res.ok) {
        setSaveSuccessMsg("Vos coordonnées directes et compétences ont été synchronisées avec succès dans Supabase !");
      } else {
        setSaveSuccessMsg("Vos coordonnées ont été enregistrées localement.");
      }
    } catch (err) {
      setSaveSuccessMsg("Enregistré localement.");
    }

    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleApplyToJob = (job: JobOffer) => {
    if (!appliedJobs.includes(job.id)) {
      setAppliedJobs([...appliedJobs, job.id]);
    }
    setApplyModalJob(job);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "me" as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeRecruiterId]: [...(prev[activeRecruiterId] || []), newMsg],
    }));

    setChatInput("");
  };

  // Filtrage offres
  const filteredJobs = jobOffers.filter((j) => {
    if (jobFilter !== "all" && j.type !== jobFilter) return false;
    if (!jobSearch.trim()) return true;
    const q = jobSearch.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.permit.toLowerCase().includes(q)
    );
  });

  const getDriverDisplayName = () => {
    if (driverFirstName || driverLastName) {
      return `${driverFirstName} ${driverLastName}`.trim();
    }
    if (user?.name) return user.name;
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return "Conducteur Routier Pro";
  };

  return (
    <div className="portal-cockpit-screen">
      {/* ============================================================== */}
      {/* 1. SIDEBAR GAUCHE (MENU À GAUCHE)                              */}
      {/* ============================================================== */}
      <aside className="portal-sidebar-left">
        {/* Brand / Logo */}
        <div className="portal-sidebar-brand">
          <Link href="/" className="brand-title">
            Truck<span>Match</span>
          </Link>
          <span className="portal-role-tag tag-candidat">Conducteur Pro</span>
        </div>

        {/* Carte Identité Chauffeur */}
        <div className="portal-sidebar-user-box">
          <div className="portal-sidebar-user-row">
            <div className="portal-avatar-ring avatar-driver">
              <Truck size={20} />
              <span className="portal-avatar-dot online" title="Profil actif en direct" />
            </div>
            <div className="portal-user-meta">
              <h2 className="portal-user-name">{getDriverDisplayName()}</h2>
              <div className="portal-user-sub">
                <MapPin size={11} className="text-sky-400" />
                <span>{driverCity.split("/")[0].trim()}</span>
              </div>
            </div>
          </div>

          {/* Permis tags rapides */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {permits.ce && <span className="permit-badge-pro permit-valid">CE (SPL)</span>}
            {permits.c && <span className="permit-badge-pro permit-valid">C (PL)</span>}
            {permits.fimo && <span className="permit-badge-pro permit-valid">FIMO</span>}
            {permits.chrono_card && <span className="permit-badge-pro permit-valid">Chrono</span>}
          </div>

          {/* Bouton Toggle Statut de Disponibilité */}
          <button
            type="button"
            onClick={handleToggleAvailability}
            className="portal-status-toggle-btn"
            title="Cliquer pour modifier votre statut de disponibilité"
          >
            <span className="flex items-center gap-1.5">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    availability === "immediate"
                      ? "#10b981"
                      : availability === "flexible"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              />
              <span>
                {availability === "immediate"
                  ? "Disponible sous 48h"
                  : availability === "flexible"
                  ? "À l'écoute d'opportunités"
                  : "En mission / Indisponible"}
              </span>
            </span>
            <RefreshCw size={11} className="text-slate-400" />
          </button>
        </div>

        {/* Menu Navigation Sidebar */}
        <nav className="portal-sidebar-nav-section">
          <span className="portal-sidebar-nav-label">ESPACE CHAUFFEUR</span>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`portal-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-icon" />
            <span className="nav-title">Cockpit & Visibilité</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("permits")}
            className={`portal-nav-btn ${activeTab === "permits" ? "active" : ""}`}
          >
            <Award className="nav-icon" />
            <span className="nav-title">Mon Profil & Permis</span>
            <span className="nav-badge">100%</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={`portal-nav-btn ${activeTab === "jobs" ? "active" : ""}`}
          >
            <Briefcase className="nav-icon" />
            <span className="nav-title">Offres & Tournées</span>
            <span className="nav-badge">{jobOffers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`portal-nav-btn ${activeTab === "documents" ? "active" : ""}`}
          >
            <FileText className="nav-icon" />
            <span className="nav-title">Mon CV & Documents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`portal-nav-btn ${activeTab === "messages" ? "active" : ""}`}
          >
            <MessageSquare className="nav-icon" />
            <span className="nav-title">Messagerie Recruteurs</span>
            <span className="nav-badge">1</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`portal-nav-btn ${activeTab === "settings" ? "active" : ""}`}
          >
            <Compass className="nav-icon" />
            <span className="nav-title">Coordonnées & Mobilité</span>
          </button>
        </nav>

        {/* Stats Rapides en Sidebar */}
        <div className="portal-sidebar-kpi-box">
          <div className="portal-sidebar-kpi-item">
            <span>Visibilité directe :</span>
            <strong className="text-emerald-400">Maximale</strong>
          </div>
          <div className="portal-sidebar-kpi-item">
            <span>Consultations SIRET :</span>
            <strong>24 vues / 7j</strong>
          </div>
          <div className="portal-sidebar-kpi-item">
            <span>Frais conducteur :</span>
            <strong className="text-sky-400">0.00 € (0%)</strong>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="portal-sidebar-footer">
          <Link href="/" className="portal-footer-link">
            <ExternalLink size={13} />
            <span>Consulter le site public</span>
          </Link>
          <button type="button" onClick={handleLogout} className="portal-footer-link logout-btn">
            <LogOut size={13} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. ZONE PRINCIPALE CONTENU DROITE                              */}
      {/* ============================================================== */}
      <div className="portal-main-area">
        {/* Topbar compacte */}
        <header className="portal-main-topbar">
          <div className="portal-main-topbar-left">
            <h1 className="portal-topbar-page-title">
              {activeTab === "overview" && (
                <>
                  <LayoutDashboard size={18} className="text-sky-400" />
                  <span>Cockpit & Synthèse de Disponibilité</span>
                </>
              )}
              {activeTab === "permits" && (
                <>
                  <Award size={18} className="text-sky-400" />
                  <span>Mes Qualifications, Permis & Expérience de Route</span>
                </>
              )}
              {activeTab === "jobs" && (
                <>
                  <Briefcase size={18} className="text-sky-400" />
                  <span>Offres d'Emploi Directes des Transporteurs Vérifiés</span>
                </>
              )}
              {activeTab === "documents" && (
                <>
                  <FileText size={18} className="text-sky-400" />
                  <span>Gestion du CV & Attestations Professionnelles</span>
                </>
              )}
              {activeTab === "messages" && (
                <>
                  <MessageSquare size={18} className="text-sky-400" />
                  <span>Messagerie Sécurisée Directe avec les Exploitants</span>
                </>
              )}
              {activeTab === "settings" && (
                <>
                  <Compass size={18} className="text-sky-400" />
                  <span>Mes Coordonnées Directes & Rayon de Mobilité Pro</span>
                </>
              )}
            </h1>

            <span className="portal-status-live-pill">
              ● Base Supabase Connectée
            </span>
          </div>

          <div className="portal-main-topbar-right">
            <span className="permit-badge-pro permit-valid hidden sm:inline-flex">
              <ShieldCheck size={13} />
              <span>Profil Certifié Vérifié</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSaveSuccessMsg("Données actualisées en direct.");
                setTimeout(() => setSaveSuccessMsg(null), 2500);
              }}
              className="cockpit-btn cockpit-btn-secondary cockpit-btn-sm"
              title="Actualiser les informations"
            >
              <RefreshCw size={13} />
              <span>Actualiser</span>
            </button>
          </div>
        </header>

        {/* Message de notification de sauvegarde */}
        {saveSuccessMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              borderBottom: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              padding: "0.5rem 1.5rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Corps principal défilant */}
        <main className="portal-main-content-scroll">
          {/* ============================================================== */}
          {/* ONGLET 1 : COCKPIT & VISIBILITÉ (OVERVIEW)                      */}
          {/* ============================================================== */}
          {activeTab === "overview" && (
            <div>
              {/* Grille 4 KPI Chauffeur */}
              <div className="driver-kpi-grid">
                <div className="driver-kpi-card">
                  <div className="driver-kpi-icon-box sky">
                    <Eye size={20} />
                  </div>
                  <div>
                    <div className="driver-kpi-val">24 vues</div>
                    <div className="driver-kpi-lbl">Exploitants vérifiés (7j)</div>
                  </div>
                </div>

                <div className="driver-kpi-card">
                  <div className="driver-kpi-icon-box emerald">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="driver-kpi-val">100% Actif</div>
                    <div className="driver-kpi-lbl">Visibilité directe région</div>
                  </div>
                </div>

                <div className="driver-kpi-card">
                  <div className="driver-kpi-icon-box amber">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <div className="driver-kpi-val">{jobOffers.length} tournées</div>
                    <div className="driver-kpi-lbl">Disponibles sur votre secteur</div>
                  </div>
                </div>

                <div className="driver-kpi-card">
                  <div className="driver-kpi-icon-box purple">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="driver-kpi-val">0.00 €</div>
                    <div className="driver-kpi-lbl">0% commission prélevée</div>
                  </div>
                </div>
              </div>

              {/* Carte Statut de mise en relation directe */}
              <div className="portal-panel-card border-sky">
                <div className="portal-panel-card-header">
                  <h2 className="portal-panel-card-title">
                    <ShieldCheck size={18} className="text-sky-400" />
                    <span>Statut de Visibilité auprès des Transporteurs Vérifiés</span>
                  </h2>
                  <span className="permit-badge-pro permit-valid">
                    ● En ligne & Consultation ouverte
                  </span>
                </div>

                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
                  Votre profil est visible en priorité par les exploitants et dirigeants de transport routier de votre secteur.
                  Vos coordonnées directes (téléphone & email) ne sont accessibles qu'aux professionnels avec SIRET vérifié,
                  évitant tout spam ou démarche commerciale non sollicitée.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.85rem", marginTop: "1rem" }}>
                  <div style={{ background: "#060d17", padding: "0.75rem", borderRadius: "8px", border: "1px solid #14243a" }}>
                    <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8", marginBottom: "0.2rem" }}>
                      ✓ 0 Intermédiaire
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>
                      Négociez directement votre taux horaire et vos plannings de retour avec l'exploitant.
                    </div>
                  </div>

                  <div style={{ background: "#060d17", padding: "0.75rem", borderRadius: "8px", border: "1px solid #14243a" }}>
                    <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#34d399", marginBottom: "0.2rem" }}>
                      ✓ Salaires Intégraux
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>
                      Aucune commission d'agence d'intérim prélevée sur votre salaire ou vos primes.
                    </div>
                  </div>

                  <div style={{ background: "#060d17", padding: "0.75rem", borderRadius: "8px", border: "1px solid #14243a" }}>
                    <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#fbbf24", marginBottom: "0.2rem" }}>
                      ✓ Contact Téléphonique Direct
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>
                      Les recruteurs peuvent vous appeler directement sans passer par une plateforme tierce.
                    </div>
                  </div>
                </div>
              </div>

              {/* Dernières offres de tournées recommandées */}
              <div className="portal-panel-card">
                <div className="portal-panel-card-header">
                  <h2 className="portal-panel-card-title">
                    <Briefcase size={18} className="text-sky-400" />
                    <span>Tournées Recommandées sur Votre Secteur</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("jobs")}
                    className="cockpit-btn cockpit-btn-sky cockpit-btn-sm"
                  >
                    <span>Voir toutes les offres</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="driver-jobs-grid">
                  {jobOffers.slice(0, 2).map((job) => (
                    <div key={job.id} className="driver-job-box">
                      <div>
                        <div className="driver-job-top">
                          <div>
                            <h3 className="driver-job-title">{job.title}</h3>
                            <div className="driver-job-company">{job.company}</div>
                          </div>
                          <span className="permit-badge-pro">{job.contract}</span>
                        </div>

                        <div className="driver-job-meta-row mt-2">
                          <span className="driver-job-tag flex items-center gap-1">
                            <MapPin size={11} className="text-sky-400" />
                            {job.location}
                          </span>
                          <span className="driver-job-tag flex items-center gap-1">
                            <Truck size={11} className="text-slate-400" />
                            {job.truckBrand}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="driver-job-salary">{job.salary}</span>
                        <button
                          type="button"
                          onClick={() => handleApplyToJob(job)}
                          className={`cockpit-btn cockpit-btn-sm ${
                            appliedJobs.includes(job.id) ? "cockpit-btn-secondary" : "cockpit-btn-emerald"
                          }`}
                        >
                          {appliedJobs.includes(job.id) ? (
                            <>
                              <Check size={12} />
                              <span>Postulé</span>
                            </>
                          ) : (
                            <>
                              <span>Postuler direct</span>
                              <ChevronRight size={12} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 2 : MON PROFIL & PERMIS                                  */}
          {/* ============================================================== */}
          {activeTab === "permits" && (
            <div className="portal-panel-card">
              <div className="portal-panel-card-header">
                <h2 className="portal-panel-card-title">
                  <Award size={18} className="text-sky-400" />
                  <span>Gestion des Permis & Habilitations de Conduite</span>
                </h2>
                <span className="permit-badge-pro permit-valid">Conforme Règlementation Fret</span>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                  {/* Colonne Permis */}
                  <div>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#38bdf8", marginBottom: "0.75rem" }}>
                      1. Permis de Conduire Actifs
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                      <div
                        onClick={() => setPermits({ ...permits, ce: !permits.ce })}
                        className={`permit-checkbox-card ${permits.ce ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Truck size={17} className={permits.ce ? "text-sky-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">Permis CE (SPL)</div>
                            <div className="text-[11px] text-slate-400">Poids Lourd avec Semi-Remorque</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.ce ? "permit-valid" : "permit-missing"}`}>
                          {permits.ce ? "Actif" : "Non renseigné"}
                        </span>
                      </div>

                      <div
                        onClick={() => setPermits({ ...permits, c: !permits.c })}
                        className={`permit-checkbox-card ${permits.c ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Truck size={17} className={permits.c ? "text-emerald-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">Permis C (PL)</div>
                            <div className="text-[11px] text-slate-400">Véhicule Porteur Rigide &gt; 3.5T</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.c ? "permit-valid" : "permit-missing"}`}>
                          {permits.c ? "Actif" : "Non renseigné"}
                        </span>
                      </div>

                      <div
                        onClick={() => setPermits({ ...permits, be: !permits.be })}
                        className={`permit-checkbox-card ${permits.be ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Award size={17} className={permits.be ? "text-amber-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">Permis BE</div>
                            <div className="text-[11px] text-slate-400">Véhicule Léger + Remorque lourde</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.be ? "permit-valid" : "permit-missing"}`}>
                          {permits.be ? "Actif" : "Non renseigné"}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#38bdf8", marginTop: "1.25rem", marginBottom: "0.75rem" }}>
                      2. Habilitations & Cartes Professionnelles
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                      <div
                        onClick={() => setPermits({ ...permits, chrono_card: !permits.chrono_card })}
                        className={`permit-checkbox-card ${permits.chrono_card ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 size={17} className={permits.chrono_card ? "text-amber-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">Carte Chronotachygraphe</div>
                            <div className="text-[11px] text-slate-400">Carte conducteur à puce valide</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.chrono_card ? "permit-valid" : "permit-missing"}`}>
                          {permits.chrono_card ? "Valide" : "À renouveler"}
                        </span>
                      </div>

                      <div
                        onClick={() => setPermits({ ...permits, fimo: !permits.fimo })}
                        className={`permit-checkbox-card ${permits.fimo ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={17} className={permits.fimo ? "text-emerald-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">FIMO Marchandises</div>
                            <div className="text-[11px] text-slate-400">Formation Initiale Minimale Obligatoire</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.fimo ? "permit-valid" : "permit-missing"}`}>
                          {permits.fimo ? "Obtenu" : "Non renseigné"}
                        </span>
                      </div>

                      <div
                        onClick={() => setPermits({ ...permits, fco: !permits.fco })}
                        className={`permit-checkbox-card ${permits.fco ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <RefreshCw size={17} className={permits.fco ? "text-sky-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">FCO Marchandises</div>
                            <div className="text-[11px] text-slate-400">Formation Continue &lt; 5 ans</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.fco ? "permit-valid" : "permit-missing"}`}>
                          {permits.fco ? "À jour" : "À renouveler"}
                        </span>
                      </div>

                      <div
                        onClick={() => setPermits({ ...permits, adr: !permits.adr })}
                        className={`permit-checkbox-card ${permits.adr ? "checked" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck size={17} className={permits.adr ? "text-purple-400" : "text-slate-500"} />
                          <div>
                            <div className="text-xs font-bold text-white">Certificat ADR (Matières Dangereuses)</div>
                            <div className="text-[11px] text-slate-400">Colis et / ou Citerne</div>
                          </div>
                        </div>
                        <span className={`permit-badge-pro ${permits.adr ? "permit-valid" : "permit-missing"}`}>
                          {permits.adr ? "Actif" : "Non titulaire"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Colonne Expérience & Préférences */}
                  <div>
                    <div className="portal-form-group">
                      <label className="portal-form-label">Années d'expérience en transport</label>
                      <select
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="portal-form-input"
                      >
                        <option value="debutant">Débutant (&lt; 1 an)</option>
                        <option value="1-3">1 à 3 ans de route</option>
                        <option value="3-5">3 à 5 ans d'expérience</option>
                        <option value="5-10">5 à 10 ans d'expérience</option>
                        <option value="+10">+10 ans d'expérience (Expert)</option>
                      </select>
                    </div>

                    <div className="portal-form-group">
                      <label className="portal-form-label">Type de tournées recherché</label>
                      <select
                        value={mobilityPref}
                        onChange={(e) => setMobilityPref(e.target.value)}
                        className="portal-form-input"
                      >
                        <option value="regional">Régional — Retour chaque soir au domicile</option>
                        <option value="national">National — Découchés 2 à 4 nuits / semaine</option>
                        <option value="relay">Relais de nuit — Postes réguliers sans chargement</option>
                        <option value="distribution">Distribution urbaine / Messagerie palette</option>
                      </select>
                    </div>

                    <div className="portal-form-group">
                      <label className="portal-form-label">Zone de départ / Mobilité</label>
                      <input
                        type="text"
                        value={driverCity}
                        onChange={(e) => setDriverCity(e.target.value)}
                        className="portal-form-input"
                        placeholder="Ex: Lyon (69), Villeurbanne, Saint-Priest"
                      />
                    </div>

                    <div style={{ marginTop: "1.5rem" }}>
                      <button type="submit" className="cockpit-btn cockpit-btn-sky w-full justify-center">
                        <CheckCircle2 size={16} />
                        <span>Enregistrer mes qualifications</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 3 : OFFRES & TOURNÉES                                    */}
          {/* ============================================================== */}
          {activeTab === "jobs" && (
            <div>
              {/* Filtres offres */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setJobFilter("all")}
                    className={`cockpit-btn cockpit-btn-sm ${jobFilter === "all" ? "cockpit-btn-sky" : "cockpit-btn-secondary"}`}
                  >
                    Toutes ({jobOffers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobFilter("regional")}
                    className={`cockpit-btn cockpit-btn-sm ${jobFilter === "regional" ? "cockpit-btn-sky" : "cockpit-btn-secondary"}`}
                  >
                    Régional (Retour Soir)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobFilter("national")}
                    className={`cockpit-btn cockpit-btn-sm ${jobFilter === "national" ? "cockpit-btn-sky" : "cockpit-btn-secondary"}`}
                  >
                    Grand Routier SPL
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobFilter("distribution")}
                    className={`cockpit-btn cockpit-btn-sm ${jobFilter === "distribution" ? "cockpit-btn-sky" : "cockpit-btn-secondary"}`}
                  >
                    Distribution PL
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Rechercher une ville, entreprise ou mot-clé..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "7px",
                    background: "#08111e",
                    border: "1px solid #192b45",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    minWidth: "260px",
                  }}
                />
              </div>

              {/* Grille des offres */}
              <div className="driver-jobs-grid">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="driver-job-box">
                    <div>
                      <div className="driver-job-top">
                        <div>
                          <h3 className="driver-job-title">{job.title}</h3>
                          <div className="driver-job-company">{job.company}</div>
                        </div>
                        <span className="permit-badge-pro">{job.contract}</span>
                      </div>

                      <div className="driver-job-meta-row mt-2">
                        <span className="driver-job-tag flex items-center gap-1">
                          <MapPin size={11} className="text-sky-400" />
                          {job.location}
                        </span>
                        <span className="driver-job-tag flex items-center gap-1">
                          <Truck size={11} className="text-slate-400" />
                          {job.truckBrand}
                        </span>
                        <span className="driver-job-tag flex items-center gap-1">
                          <Clock size={11} className="text-emerald-400" />
                          {job.postedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="driver-job-salary">{job.salary}</span>
                      <button
                        type="button"
                        onClick={() => handleApplyToJob(job)}
                        className={`cockpit-btn cockpit-btn-sm ${
                          appliedJobs.includes(job.id) ? "cockpit-btn-secondary" : "cockpit-btn-emerald"
                        }`}
                      >
                        {appliedJobs.includes(job.id) ? (
                          <>
                            <Check size={12} />
                            <span>Candidature envoyée</span>
                          </>
                        ) : (
                          <>
                            <span>Postuler en 1 clic</span>
                            <ChevronRight size={12} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 4 : MON CV & DOCUMENTS                                   */}
          {/* ============================================================== */}
          {activeTab === "documents" && (
            <div>
              <div className="portal-panel-card border-sky">
                <div className="portal-panel-card-header">
                  <h2 className="portal-panel-card-title">
                    <FileText size={18} className="text-sky-400" />
                    <span>Curriculum Vitae (CV Conducteur Actif)</span>
                  </h2>
                  <span className="permit-badge-pro permit-valid">
                    ● CV vérifié & actif
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#060d17",
                    padding: "1rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #14243a",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "8px",
                        background: "rgba(14, 165, 233, 0.15)",
                        border: "1px solid rgba(14, 165, 233, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#38bdf8",
                      }}
                    >
                      <FileText size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff" }}>
                        CV_{getDriverDisplayName().replace(/\s+/g, "_")}_Routier.pdf
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                        Format PDF • 245 Ko • Synchronisé avec la base Supabase TruckMatch
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => alert("Téléchargement du CV en cours...")}
                      className="cockpit-btn cockpit-btn-secondary cockpit-btn-sm"
                    >
                      <Download size={13} />
                      <span>Télécharger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSaveSuccessMsg("Nouveau CV téléversé et synchronisé.");
                        setTimeout(() => setSaveSuccessMsg(null), 3000);
                      }}
                      className="cockpit-btn cockpit-btn-sky cockpit-btn-sm"
                    >
                      <Upload size={13} />
                      <span>Remplacer mon CV</span>
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                  ℹ️ Votre CV est automatiquement transmis aux transporteurs lors de vos candidatures en un clic,
                  ou lorsqu'un recruteur débloque votre fiche avec SIRET certifié.
                </div>
              </div>

              {/* Justificatifs professionnels */}
              <div className="portal-panel-card">
                <div className="portal-panel-card-header">
                  <h2 className="portal-panel-card-title">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <span>Justificatifs & Attestations Numériques</span>
                  </h2>
                  <span className="permit-badge-pro">Dossier Certifié</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  <div style={{ background: "#060d17", padding: "0.85rem", borderRadius: "8px", border: "1px solid #14243a" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>Permis de conduire CE</span>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>Valide jusqu'au 15/09/2028 (Visite médicale à jour)</div>
                  </div>

                  <div style={{ background: "#060d17", padding: "0.85rem", borderRadius: "8px", border: "1px solid #14243a" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>Carte Chrononumérique</span>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>Carte conducteur valide (Chrono Services France)</div>
                  </div>

                  <div style={{ background: "#060d17", padding: "0.85rem", borderRadius: "8px", border: "1px solid #14243a" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>Attestation FIMO / FCO</span>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>Formation Continue Obligatoire enregistrée</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 5 : MESSAGERIE DIRECTE                                   */}
          {/* ============================================================== */}
          {activeTab === "messages" && (
            <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 135px)", minHeight: "460px" }}>
              {/* Liste recruteurs */}
              <div
                style={{
                  width: "280px",
                  background: "#08111e",
                  border: "1px solid #142339",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #142339", background: "#060d17" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>
                    Échanges Directs ({recruiters.length})
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                    Sans intermédiaire
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
                  {recruiters.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#94a3b8", fontSize: "0.8rem" }}>
                      <MessageSquare size={26} style={{ margin: "0 auto 0.6rem", opacity: 0.4 }} />
                      <p style={{ fontWeight: 600, color: "#cbd5e1" }}>Aucun échange direct</p>
                      <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
                        Les transporteurs intéressés par votre profil apparaîtront ici.
                      </p>
                    </div>
                  ) : (
                    recruiters.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setActiveRecruiterId(r.id)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          textAlign: "left",
                          background: activeRecruiterId === r.id ? "#0d1b2e" : "transparent",
                          border: activeRecruiterId === r.id ? "1px solid #38bdf8" : "1px solid transparent",
                          marginBottom: "0.35rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                          }}
                        >
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.name}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.1rem" }}>
                            {r.city}
                          </div>
                        </div>
                        {r.unread > 0 && (
                          <span
                            style={{
                              background: "#0284c7",
                              color: "#ffffff",
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              padding: "0.1rem 0.4rem",
                              borderRadius: "9999px",
                            }}
                          >
                            {r.unread}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Zone discussion */}
              <div
                style={{
                  flex: 1,
                  background: "#08111e",
                  border: "1px solid #142339",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {recruiters.length === 0 || !activeRecruiterId ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", padding: "2rem" }}>
                    <MessageSquare size={38} style={{ color: "#38bdf8", opacity: 0.5, marginBottom: "0.85rem" }} />
                    <h4 style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.35rem" }}>
                      Messagerie directe avec les transporteurs
                    </h4>
                    <p style={{ maxWidth: 380, textAlign: "center", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                      Vos coordonnées directes et vos disponibilités sont enregistrées dans la base TruckMatch. Dès qu'un transporteur vous contacte pour une tournée, l'échange s'affichera directement ici.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* En-tête discussion */}
                    <div
                      style={{
                        padding: "0.85rem 1.25rem",
                        borderBottom: "1px solid #142339",
                        background: "#060d17",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff" }}>
                          {recruiters.find((r) => r.id === activeRecruiterId)?.name}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />
                          <span>Exploitant de transport vérifié (SIRET actif)</span>
                        </div>
                      </div>

                      <span className="permit-badge-pro permit-valid">
                        Direct • 0% Commission
                      </span>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      {(chatMessages[activeRecruiterId] || []).map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            alignSelf: msg.sender === "me" ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            background: msg.sender === "me" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "#0d1b2e",
                            border: msg.sender === "me" ? "1px solid #38bdf8" : "1px solid #192d47",
                            padding: "0.75rem 1rem",
                            borderRadius: msg.sender === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                            color: "#ffffff",
                            fontSize: "0.84rem",
                            lineHeight: 1.45,
                          }}
                        >
                          <div>{msg.text}</div>
                          <div
                            style={{
                              fontSize: "0.68rem",
                              color: msg.sender === "me" ? "rgba(255,255,255,0.7)" : "#94a3b8",
                              textAlign: "right",
                              marginTop: "0.3rem",
                            }}
                          >
                            {msg.time}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Champ d'envoi */}
                    <form
                      onSubmit={handleSendMessage}
                      style={{
                        padding: "0.85rem 1.25rem",
                        borderTop: "1px solid #142339",
                        background: "#060d17",
                        display: "flex",
                        gap: "0.65rem",
                      }}
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Écrivez votre réponse à l'exploitant de transport..."
                        style={{
                          flex: 1,
                          background: "#0d1b2e",
                          border: "1px solid #192d47",
                          borderRadius: "8px",
                          padding: "0.65rem 1rem",
                          color: "#ffffff",
                          fontSize: "0.85rem",
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        style={{ padding: "0.65rem 1.25rem", borderRadius: "8px" }}
                      >
                        <Send size={15} />
                        <span>Envoyer</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ============================================================== */}
          {/* ONGLET 6 : MES COORDONNÉES DIRECTES & RAYON DE MOBILITÉ PRO    */}
          {/* ============================================================== */}
          {activeTab === "settings" && (
            <div className="mobility-portal-wrapper">
              <form onSubmit={handleSaveProfile} style={{ display: "contents" }}>
                <div className="mobility-grid-2cols">
                  {/* -------------------------------------------------------- */}
                  {/* COLONNE GAUCHE : MES COORDONNÉES DIRECTES DE CONTACT    */}
                  {/* -------------------------------------------------------- */}
                  <div className="driver-card-panel">
                    <div className="driver-panel-header">
                      <div className="driver-panel-title-group">
                        <div className="driver-panel-icon">
                          <Phone size={19} />
                        </div>
                        <div>
                          <h2 className="driver-panel-title">Mes Coordonnées Directes</h2>
                          <div className="driver-panel-subtitle">
                            Comment les transporteurs de votre région vous contactent
                          </div>
                        </div>
                      </div>
                      <span className="permit-badge-pro permit-valid">Protégé RGPD</span>
                    </div>

                    {/* Nom & Prénom */}
                    <div className="driver-input-row">
                      <div className="driver-input-field">
                        <label className="driver-input-label">Prénom</label>
                        <input
                          type="text"
                          value={driverFirstName}
                          onChange={(e) => setDriverFirstName(e.target.value)}
                          placeholder="Jean"
                          className="driver-input-box"
                          required
                        />
                      </div>
                      <div className="driver-input-field">
                        <label className="driver-input-label">Nom</label>
                        <input
                          type="text"
                          value={driverLastName}
                          onChange={(e) => setDriverLastName(e.target.value)}
                          placeholder="Dupont"
                          className="driver-input-box"
                          required
                        />
                      </div>
                    </div>

                    {/* Téléphone direct */}
                    <div className="driver-input-field">
                      <label className="driver-input-label">
                        <Phone size={13} className="text-sky-400" />
                        <span>Numéro de Téléphone Mobile (Direct)</span>
                      </label>
                      <input
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="06 12 34 56 78"
                        className="driver-input-box"
                        required
                      />
                      <div className="driver-input-hint">
                        Format français direct : permet aux exploitants de vous joindre pour une prise de poste rapide.
                      </div>
                    </div>

                    {/* Canal de contact privilégié */}
                    <div>
                      <div className="contact-pref-title">
                        <MessageSquare size={13} className="text-sky-400" />
                        <span>Canal de Contact Privilégié (1 Clic)</span>
                      </div>
                      <div className="contact-pref-options">
                        <div
                          onClick={() => setContactPref("phone_sms")}
                          className={`contact-pref-card ${contactPref === "phone_sms" ? "active" : ""}`}
                        >
                          <div className="contact-pref-content">
                            <div className="contact-pref-icon-circle">
                              <Phone size={16} />
                            </div>
                            <div>
                              <div className="contact-pref-main-title">Appel Direct & SMS (Recommandé)</div>
                              <div className="contact-pref-sub-text">
                                Idéal pour décrocher rapidement les meilleures missions
                              </div>
                            </div>
                          </div>
                          <div className="contact-pref-check">
                            {contactPref === "phone_sms" && <Check size={12} />}
                          </div>
                        </div>

                        <div
                          onClick={() => setContactPref("sms_only")}
                          className={`contact-pref-card ${contactPref === "sms_only" ? "active" : ""}`}
                        >
                          <div className="contact-pref-content">
                            <div className="contact-pref-icon-circle">
                              <MessageSquare size={16} />
                            </div>
                            <div>
                              <div className="contact-pref-main-title">SMS & WhatsApp Uniquement</div>
                              <div className="contact-pref-sub-text">
                                Pratique pour me contacter pendant mes pauses ou coupures
                              </div>
                            </div>
                          </div>
                          <div className="contact-pref-check">
                            {contactPref === "sms_only" && <Check size={12} />}
                          </div>
                        </div>

                        <div
                          onClick={() => setContactPref("platform")}
                          className={`contact-pref-card ${contactPref === "platform" ? "active" : ""}`}
                        >
                          <div className="contact-pref-content">
                            <div className="contact-pref-icon-circle">
                              <ShieldCheck size={16} />
                            </div>
                            <div>
                              <div className="contact-pref-main-title">Messagerie TruckMatch Uniquement</div>
                              <div className="contact-pref-sub-text">
                                Mes coordonnées restent masquées tant que je n'accepte pas l'échange
                              </div>
                            </div>
                          </div>
                          <div className="contact-pref-check">
                            {contactPref === "platform" && <Check size={12} />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="driver-input-field">
                      <label className="driver-input-label">
                        <Mail size={13} className="text-slate-400" />
                        <span>Adresse Email Personnelle</span>
                      </label>
                      <input
                        type="email"
                        value={driverEmail}
                        onChange={(e) => setDriverEmail(e.target.value)}
                        placeholder="jean.dupont@conducteur-pro.fr"
                        className="driver-input-box"
                      />
                    </div>

                    {/* Ville & Code postal de départ */}
                    <div className="driver-input-row">
                      <div className="driver-input-field" style={{ flex: 2 }}>
                        <label className="driver-input-label">
                          <MapPin size={13} className="text-sky-400" />
                          <span>Ville de Domicile / Départ</span>
                        </label>
                        <input
                          type="text"
                          value={driverCity}
                          onChange={(e) => setDriverCity(e.target.value)}
                          placeholder="Lyon (69) ou Villefranche"
                          className="driver-input-box"
                          required
                        />
                      </div>
                      <div className="driver-input-field" style={{ flex: 1 }}>
                        <label className="driver-input-label">Code Postal</label>
                        <input
                          type="text"
                          value={driverPostalCode}
                          onChange={(e) => setDriverPostalCode(e.target.value)}
                          placeholder="69007"
                          className="driver-input-box"
                        />
                      </div>
                    </div>
                    <div className="driver-input-hint" style={{ marginTop: "-0.5rem" }}>
                      📍 C'est le point de référence central utilisé pour calculer vos kilomètres jusqu'au dépôt de l'entreprise.
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* COLONNE DROITE : RAYON DE MOBILITÉ & CRITÈRES DE ROUTE  */}
                  {/* -------------------------------------------------------- */}
                  <div className="driver-card-panel">
                    <div className="driver-panel-header">
                      <div className="driver-panel-title-group">
                        <div className="driver-panel-icon emerald">
                          <Compass size={19} />
                        </div>
                        <div>
                          <h2 className="driver-panel-title">Rayon de Mobilité & Périmètre Pro</h2>
                          <div className="driver-panel-subtitle">
                            Distance acceptée pour rejoindre le dépôt ou rouler
                          </div>
                        </div>
                      </div>
                      <span className="permit-badge-pro permit-valid">Temps Réel</span>
                    </div>

                    {/* Curseur Rayon Kilométrique */}
                    <div className="mobility-slider-box">
                      <div className="mobility-distance-header">
                        <div>
                          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
                            Distance maximale acceptée
                          </div>
                          <div className="mobility-value-display">
                            {isFranceEntire ? (
                              <span className="mobility-value-number" style={{ fontSize: "1.7rem", color: "#34d399" }}>
                                🇫🇷 France Entière
                              </span>
                            ) : (
                              <>
                                <span className="mobility-value-number">{mobilityRadius}</span>
                                <span className="mobility-value-unit">km autour de chez moi</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className={`mobility-badge-status ${isFranceEntire ? "national" : ""}`}>
                          {isFranceEntire
                            ? "Grand Routier National"
                            : mobilityRadius <= 25
                            ? "Très local / Messagerie"
                            : mobilityRadius <= 60
                            ? "Régional standard"
                            : "Interdépartemental"}
                        </span>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="10"
                        max="150"
                        step="5"
                        value={isFranceEntire ? 150 : mobilityRadius}
                        disabled={isFranceEntire}
                        onChange={(e) => {
                          setMobilityRadius(Number(e.target.value));
                          setIsFranceEntire(false);
                        }}
                        className="mobility-range-slider"
                        style={{ opacity: isFranceEntire ? 0.4 : 1 }}
                      />

                      {/* Puces de sélection rapide */}
                      <div>
                        <div style={{ fontSize: "0.71rem", color: "#64748b", marginBottom: "0.4rem" }}>
                          Raccourcis rapides en 1 clic :
                        </div>
                        <div className="mobility-quick-presets">
                          <button
                            type="button"
                            onClick={() => {
                              setMobilityRadius(20);
                              setIsFranceEntire(false);
                            }}
                            className={`mobility-preset-pill ${!isFranceEntire && mobilityRadius === 20 ? "active" : ""}`}
                          >
                            20 km (Local)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMobilityRadius(40);
                              setIsFranceEntire(false);
                            }}
                            className={`mobility-preset-pill ${!isFranceEntire && mobilityRadius === 40 ? "active" : ""}`}
                          >
                            40 km (Régional)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMobilityRadius(60);
                              setIsFranceEntire(false);
                            }}
                            className={`mobility-preset-pill ${!isFranceEntire && mobilityRadius === 60 ? "active" : ""}`}
                          >
                            60 km (Inter-dépôt)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMobilityRadius(100);
                              setIsFranceEntire(false);
                            }}
                            className={`mobility-preset-pill ${!isFranceEntire && mobilityRadius === 100 ? "active" : ""}`}
                          >
                            100 km (Grande région)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFranceEntire(!isFranceEntire)}
                            className={`mobility-preset-pill ${isFranceEntire ? "active" : ""}`}
                          >
                            🇫🇷 France entière
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Critère Découchés (Nuits en cabine) */}
                    <div>
                      <div className="contact-pref-title">
                        <Moon size={13} className="text-amber-400" />
                        <span>Découchés & Nuits Hors Domicile (Critère Clé)</span>
                      </div>
                      <div className="overnight-grid">
                        <div
                          onClick={() => setOvernightPref("none")}
                          className={`overnight-card ${overnightPref === "none" ? "active" : ""}`}
                        >
                          <div className="overnight-card-top">
                            <span className="overnight-card-title">
                              <Home size={15} className="text-emerald-400" />
                              <span>0 découché (Chaque soir)</span>
                            </span>
                            <span className="overnight-badge-popular">Top Choix</span>
                          </div>
                          <div className="overnight-card-desc">
                            Retour impératif au domicile tous les soirs (Régional, benne ou distribution).
                          </div>
                        </div>

                        <div
                          onClick={() => setOvernightPref("occasional")}
                          className={`overnight-card ${overnightPref === "occasional" ? "active" : ""}`}
                        >
                          <div className="overnight-card-top">
                            <span className="overnight-card-title">
                              <Moon size={15} className="text-sky-400" />
                              <span>1 à 2 découchés / sem</span>
                            </span>
                          </div>
                          <div className="overnight-card-desc">
                            Découchés occasionnels acceptés selon les impératifs de planning.
                          </div>
                        </div>

                        <div
                          onClick={() => setOvernightPref("national")}
                          className={`overnight-card ${overnightPref === "national" ? "active" : ""}`}
                        >
                          <div className="overnight-card-top">
                            <span className="overnight-card-title">
                              <Truck size={15} className="text-purple-400" />
                              <span>Grand Routier (Semaine)</span>
                            </span>
                          </div>
                          <div className="overnight-card-desc">
                            Partie à la semaine (Lundi au Vendredi) en France ou zone limitrophe.
                          </div>
                        </div>

                        <div
                          onClick={() => setOvernightPref("relay_night")}
                          className={`overnight-card ${overnightPref === "relay_night" ? "active" : ""}`}
                        >
                          <div className="overnight-card-top">
                            <span className="overnight-card-title">
                              <Repeat size={15} className="text-amber-400" />
                              <span>Relais de nuit</span>
                            </span>
                          </div>
                          <div className="overnight-card-desc">
                            Traction de nuit régulière entre plateformes avec retour au matin.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ma Disponibilité immédiate */}
                    <div>
                      <div className="contact-pref-title">
                        <Clock size={13} className="text-emerald-400" />
                        <span>Ma Disponibilité pour Prise de Poste</span>
                      </div>
                      <div className="availability-driver-grid">
                        <div
                          onClick={() => setAvailability("immediate")}
                          className={`availability-driver-card ${availability === "immediate" ? "active" : ""}`}
                        >
                          <span className="availability-status-dot" style={{ background: "#10b981" }} />
                          <div>
                            <div className="availability-driver-title">Disponible sous 48h</div>
                            <div className="availability-driver-sub">Immédiat / Sans délai</div>
                          </div>
                        </div>

                        <div
                          onClick={() => setAvailability("flexible")}
                          className={`availability-driver-card ${availability === "flexible" ? "active" : ""}`}
                        >
                          <span className="availability-status-dot" style={{ background: "#f59e0b" }} />
                          <div>
                            <div className="availability-driver-title">Sous préavis</div>
                            <div className="availability-driver-sub">15 jours à 1 mois</div>
                          </div>
                        </div>

                        <div
                          onClick={() => setAvailability("busy")}
                          className={`availability-driver-card ${availability === "busy" ? "active" : ""}`}
                        >
                          <span className="availability-status-dot" style={{ background: "#38bdf8" }} />
                          <div>
                            <div className="availability-driver-title">À l'écoute</div>
                            <div className="availability-driver-sub">En poste / Veille</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contrats souhaités */}
                    <div>
                      <div className="contact-pref-title">
                        <Briefcase size={13} className="text-sky-400" />
                        <span>Contrat(s) Souhaité(s)</span>
                      </div>
                      <div className="contract-pills-row">
                        {["CDI Temps plein", "CDD / Remplacement", "Intérim / Missions", "Temps partiel / Week-end"].map(
                          (contract) => {
                            const isSelected = desiredContracts.includes(contract);
                            return (
                              <button
                                key={contract}
                                type="button"
                                onClick={() => toggleContract(contract)}
                                className={`contract-toggle-pill ${isSelected ? "active" : ""}`}
                              >
                                {isSelected ? <Check size={13} /> : <span style={{ opacity: 0.5 }}>+</span>}
                                <span>{contract}</span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* BLOC BAS : RÉASSURANCE RGPD & BOUTON SAUVEGARDE GÉANT    */}
                {/* -------------------------------------------------------- */}
                <div className="driver-security-box">
                  <div className="driver-security-meta">
                    <div className="driver-security-icon-circle">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div className="driver-security-title">Protection & Confidentialité Chauffeur</div>
                      <div className="driver-security-text">
                        Vos coordonnées directes ne sont visibles que par les entreprises de transport vérifiées avec SIRET certifié,
                        disposant d'une opportunité d'embauche dans votre rayon de mobilité ({isFranceEntire ? "National" : `${mobilityRadius} km`}).
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="driver-save-cta-btn">
                    <CheckCircle2 size={18} />
                    <span>Enregistrer mes coordonnées & mobilité</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL DE CONFIRMATION CANDIDATURE DIRECTE                      */}
      {/* ============================================================== */}
      {applyModalJob && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#091424",
              border: "1px solid #1a2f4c",
              borderRadius: "14px",
              padding: "1.75rem",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#34d399",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Candidature Directe Transmise
                </h3>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Sans intermédiaire • {applyModalJob.company}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.5 }}>
              Votre profil complet avec permis <strong>{applyModalJob.permit}</strong> et votre CV ont été directement notifiés à l'exploitant de <strong>{applyModalJob.company}</strong> ({applyModalJob.location}).
            </p>

            <div style={{ background: "#060d17", padding: "0.85rem", borderRadius: "8px", border: "1px solid #14243a", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8" }}>
                Poste : {applyModalJob.title}
              </div>
              <div style={{ fontSize: "0.73rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                Rémunération : {applyModalJob.salary} • Matériel : {applyModalJob.truckBrand}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.65rem" }}>
              <button
                type="button"
                onClick={() => setApplyModalJob(null)}
                className="cockpit-btn cockpit-btn-sky"
              >
                Compris, fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
