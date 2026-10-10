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

  const [experienceYears, setExperienceYears] = useState("3-5");
  const [mobilityPref, setMobilityPref] = useState("regional");
  const [driverCity, setDriverCity] = useState("Lyon (69) / Auvergne-Rhône-Alpes");
  const [driverPhone, setDriverPhone] = useState("06 12 34 56 78");
  const [driverEmail, setDriverEmail] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Recherche & filtrage offres d'emploi
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] = useState<"all" | "regional" | "national" | "distribution">("all");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyModalJob, setApplyModalJob] = useState<JobOffer | null>(null);

  // Tchat direct recruteurs
  const [activeRecruiterId, setActiveRecruiterId] = useState<string>("comp-1");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, { id: string; sender: "recruiter" | "me"; text: string; time: string }[]>
  >({
    "comp-1": [
      {
        id: "m1",
        sender: "recruiter",
        text: "Bonjour ! Nous avons vu votre profil avec Permis CE et carte chrono à jour. Nous recherchons un conducteur pour des tournées régionales en départ de notre agence. Êtes-vous toujours disponible sous 48h ?",
        time: "09:30",
      },
      {
        id: "m2",
        sender: "me",
        text: "Bonjour, oui tout à fait ! Je suis disponible immédiatement et je recherche justement des tournées régionales avec retour quotidien.",
        time: "09:42",
      },
      {
        id: "m3",
        sender: "recruiter",
        text: "Parfait ! La rémunération est de 2 750 € net/mois + primes de panier. Pouvons-nous convenir d'un échange téléphonique rapide cet après-midi ?",
        time: "10:05",
      },
    ],
    "comp-2": [
      {
        id: "m2-1",
        sender: "recruiter",
        text: "Bonjour, Transports Fret National recherche 2 conducteurs SPL relais de nuit. Seriez-vous intéressé par ce type de tournée ?",
        time: "Hier",
      },
    ],
  });

  const recruiters = [
    {
      id: "comp-1",
      name: "Transports Bernis Express",
      city: "Lyon (69)",
      fleet: "50+ SPL Mercedes Actros",
      unread: 1,
    },
    {
      id: "comp-2",
      name: "Groupe Fret National",
      city: "Mâcon (71)",
      fleet: "Relais de nuit / Frigo",
      unread: 0,
    },
  ];

  // Offres réalistes de transport
  const jobOffers: JobOffer[] = [
    {
      id: "job-1",
      title: "Conducteur Routier SPL Régional (CE)",
      company: "Transports Bernis Express",
      location: "Lyon (69) / Saint-Priest",
      contract: "CDI",
      salary: "2 650 € - 2 950 € net/mois",
      permit: "Permis CE",
      type: "regional",
      postedAt: "Aujourd'hui",
      truckBrand: "Mercedes Actros 2024",
    },
    {
      id: "job-2",
      title: "Chauffeur PL Distribution & Messagerie (C)",
      company: "Logistique Rhône Express",
      location: "Villefranche-sur-Saône (69)",
      contract: "CDI",
      salary: "2 350 € - 2 600 € net/mois",
      permit: "Permis C",
      type: "distribution",
      postedAt: "Hier",
      truckBrand: "Renault D-Wide Hayon",
    },
    {
      id: "job-3",
      title: "Conducteur Grand Routier National SPL (CE)",
      company: "Trans-Europe Frigo",
      location: "Bourg-en-Bresse (01)",
      contract: "CDI",
      salary: "2 900 € - 3 400 € net/mois",
      permit: "Permis CE + FIMO",
      type: "national",
      postedAt: "Il y a 2 jours",
      truckBrand: "Scania R500 V8",
    },
    {
      id: "job-4",
      title: "Chauffeur Benne TP / Enrobés SPL (CE)",
      company: "Carrières & Travaux Publics",
      location: "Grenoble (38)",
      contract: "CDI",
      salary: "2 550 € - 2 850 € net/mois",
      permit: "Permis CE",
      type: "regional",
      postedAt: "Il y a 3 jours",
      truckBrand: "Volvo FMX 460",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tm_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          if (parsed.email) setDriverEmail(parsed.email);
          if (parsed.phone) setDriverPhone(parsed.phone);
          if (parsed.city) setDriverCity(parsed.city);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "tm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      localStorage.removeItem("tm_user");
    }
    router.push("/");
    router.refresh();
  };

  const handleToggleAvailability = () => {
    if (availability === "immediate") setAvailability("flexible");
    else if (availability === "flexible") setAvailability("busy");
    else setAvailability("immediate");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const updated = {
        ...(user || {}),
        phone: driverPhone,
        email: driverEmail,
        city: driverCity,
        permits: [
          permits.ce && "CE",
          permits.c && "C",
          permits.be && "BE",
          permits.adr && "ADR",
        ].filter(Boolean),
      };
      localStorage.setItem("tm_user", JSON.stringify(updated));
      setUser(updated);
    }
    setSaveSuccessMsg("Profil et permis mis à jour avec succès.");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
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
            <Settings className="nav-icon" />
            <span className="nav-title">Mes Coordonnées</span>
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
                  <Settings size={18} className="text-sky-400" />
                  <span>Mes Coordonnées Directes & Rayon de Mobilité</span>
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
                  {recruiters.map((r) => (
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
                  ))}
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
                      padding: "0.65rem 0.95rem",
                      borderRadius: "8px",
                      background: "#0a1320",
                      border: "1px solid #18283f",
                      color: "#ffffff",
                      fontSize: "0.84rem",
                      outline: "none",
                    }}
                  />
                  <button type="submit" className="cockpit-btn cockpit-btn-sky">
                    <Send size={15} />
                    <span>Envoyer</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 6 : MES COORDONNÉES                                      */}
          {/* ============================================================== */}
          {activeTab === "settings" && (
            <div className="portal-panel-card" style={{ maxWidth: "700px" }}>
              <div className="portal-panel-card-header">
                <h2 className="portal-panel-card-title">
                  <Settings size={18} className="text-sky-400" />
                  <span>Mes Informations Personnelles de Contact</span>
                </h2>
                <span className="permit-badge-pro permit-valid">Protégé RGPD</span>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="portal-form-group">
                  <label className="portal-form-label">Nom complet / Identité</label>
                  <input
                    type="text"
                    value={getDriverDisplayName()}
                    readOnly
                    className="portal-form-input"
                    style={{ opacity: 0.8, cursor: "not-allowed" }}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Numéro de Téléphone Direct</label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="portal-form-input"
                    placeholder="06 •• •• •• ••"
                  />
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                    Les exploitants autorisés pourront vous joindre directement par appel ou SMS.
                  </div>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Adresse Email</label>
                  <input
                    type="email"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    className="portal-form-input"
                    placeholder="conducteur@truckmatch.fr"
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Ville & Région de Domiciliation</label>
                  <input
                    type="text"
                    value={driverCity}
                    onChange={(e) => setDriverCity(e.target.value)}
                    className="portal-form-input"
                    placeholder="Ex: Lyon (69)"
                  />
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <button type="submit" className="cockpit-btn cockpit-btn-sky">
                    <CheckCircle2 size={16} />
                    <span>Sauvegarder mes coordonnées</span>
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
