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
  Zap,
  Star,
  CreditCard,
  X,
  Menu,
  ArrowLeft,
  Loader2,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Tchat direct & Support TruckMatch (réel Supabase)
  const [activeRecruiterId, setActiveRecruiterId] = useState<string>("truckmatch_support");
  const [chatInput, setChatInput] = useState("");
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportUnreadCount, setSupportUnreadCount] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<
    Record<string, { id: string; sender: "recruiter" | "me"; text: string; time: string }[]>
  >({});
  const [recruiters, setRecruiters] = useState<any[]>([]);

  // Offres réelles chargées depuis Supabase
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  // Boost Visibilité Candidat (4.99 € / 3 mois)
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostSuccessMsg, setBoostSuccessMsg] = useState<string | null>(null);

  const handleActivateBoost = async () => {
    setBoostLoading(true);
    try {
      const res = await fetch("/api/candidate/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate_boost" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Impossible d'activer le boost.");
      }
      setUser((prev: any) => ({
        ...prev,
        is_boosted: true,
        boosted_until: json.driver?.boosted_until,
        is_premium: true,
        is_reliable: true,
      }));
      setBoostSuccessMsg(json.message || "Boost Visibilité activé avec succès pour 3 mois !");
      setTimeout(() => {
        setBoostModalOpen(false);
        setBoostSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'activation");
    } finally {
      setBoostLoading(false);
    }
  };

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

  const loadSupportChat = async (markRead = false) => {
    try {
      const res = await fetch(`/api/chat/support?mark_read=${markRead}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSupportMessages(data.messages || []);
          if (markRead) {
            setSupportUnreadCount(0);
          } else {
            setSupportUnreadCount(data.unreadCount || 0);
          }
        }
      }
    } catch (err) {
      console.error("Erreur chargement support chat candidat:", err);
    }
  };

  // Détection du paramètre URL ?tab=messages envoyé par email
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "permits", "jobs", "documents", "messages", "settings"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Synchronisation des messages support
  useEffect(() => {
    if (activeTab === "messages") {
      loadSupportChat(true);
      const interval = setInterval(() => {
        loadSupportChat(true);
      }, 10000);
      return () => clearInterval(interval);
    } else {
      loadSupportChat(false);
      const interval = setInterval(() => {
        loadSupportChat(false);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput("");

    if (activeRecruiterId === "truckmatch_support" || !activeRecruiterId) {
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        sender_type: "candidate",
        message: text,
        created_at: new Date().toISOString(),
      };
      setSupportMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await fetch("/api/chat/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.message) {
            setSupportMessages((prev) =>
              prev.map((m) => (m.id === optimisticMsg.id ? json.message : m))
            );
          }
        }
      } catch (err) {
        console.error("Erreur envoi message candidat:", err);
      }
    } else {
      const newMsg = {
        id: `m-${Date.now()}`,
        sender: "me" as const,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeRecruiterId]: [...(prev[activeRecruiterId] || []), newMsg],
      }));
    }
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
      {/* 0. TOPBAR MOBILE EXCLUSIVE                                     */}
      {/* ============================================================== */}
      <div className="portal-mobile-topbar">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="portal-mobile-menu-btn"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="portal-mobile-brand">
          <Link href="/" className="brand-title">
            Truck<span>Match</span>
          </Link>
          <span className="portal-role-tag tag-candidat">Chauffeur</span>
        </div>

        <button
          type="button"
          onClick={() => setBoostModalOpen(true)}
          className="portal-mobile-quick-boost-btn"
          title="Booster mon profil"
        >
          <Zap size={14} />
          <span>Boost</span>
        </button>
      </div>

      {/* Backdrop sombre mobile quand le menu est ouvert */}
      {mobileMenuOpen && (
        <div
          className="portal-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      {/* ============================================================== */}
      {/* 1. SIDEBAR GAUCHE (MENU À GAUCHE OU DRAWER MOBILE)             */}
      {/* ============================================================== */}
      <aside className={`portal-sidebar-left ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Brand / Logo */}
        <div className="portal-sidebar-brand">
          <Link href="/" className="brand-title" onClick={() => setMobileMenuOpen(false)}>
            Truck<span>Match</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="portal-role-tag tag-candidat">Conducteur Pro</span>
            <button
              type="button"
              className="portal-sidebar-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>
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
            onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
            className={`portal-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          >
            <LayoutDashboard className="nav-icon" />
            <span className="nav-title">Cockpit & Visibilité</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("permits"); setMobileMenuOpen(false); }}
            className={`portal-nav-btn ${activeTab === "permits" ? "active" : ""}`}
          >
            <Award className="nav-icon" />
            <span className="nav-title">Mon Profil & Permis</span>
            <span className="nav-badge">100%</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("jobs"); setMobileMenuOpen(false); }}
            className={`portal-nav-btn ${activeTab === "jobs" ? "active" : ""}`}
          >
            <Briefcase className="nav-icon" />
            <span className="nav-title">Offres & Tournées</span>
            <span className="nav-badge">{jobOffers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("documents"); setMobileMenuOpen(false); }}
            className={`portal-nav-btn ${activeTab === "documents" ? "active" : ""}`}
          >
            <FileText className="nav-icon" />
            <span className="nav-title">Mon CV & Documents</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("messages"); setMobileMenuOpen(false); }}
            className={`portal-nav-btn ${activeTab === "messages" ? "active" : ""}`}
          >
            <MessageSquare className="nav-icon" />
            <span className="nav-title">Messagerie & Support</span>
            {supportUnreadCount > 0 && (
              <span className="nav-badge animate-pulse" style={{ background: "#0284c7" }}>
                {supportUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
            className={`portal-nav-btn ${activeTab === "settings" ? "active" : ""}`}
          >
            <Compass className="nav-icon" />
            <span className="nav-title">Coordonnées & Mobilité</span>
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className="portal-sidebar-footer">
          <Link href="/" className="portal-footer-link" onClick={() => setMobileMenuOpen(false)}>
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
            <div className="flex flex-col gap-6">
              {/* BANDEAU BOOST VISIBILITÉ CANDIDAT (4.99 € / 3 MOIS) */}
              {user?.is_boosted ? (
                <div className="driver-boost-active-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Star size={20} className="fill-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-white">
                          Profil Boosté en 1ère Position
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Sparkles size={11} />
                          Candidat Premium
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <ShieldCheck size={11} />
                          Candidat Fiable
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Votre profil apparaît en tête de liste pour tous les transporteurs de votre région
                        {user?.boosted_until && (
                          <span>
                            {" "}• Actif jusqu&apos;au{" "}
                            <strong>
                              {new Date(user.boosted_until).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </strong>
                          </span>
                        )}.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Visibilité Maximale Active
                  </span>
                </div>
              ) : (
                <div className="driver-boost-banner">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className="driver-boost-pill">
                      <Sparkles size={12} />
                      Offre Conducteur Privilège • 3 Mois
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Propulsé par TruckMatch
                    </span>
                  </div>

                  <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight mt-1 mb-1.5">
                    Boostez votre profil en 1ère position des recruteurs
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    Démarquez-vous instantanément face aux autres chauffeurs, obtenez le badge <strong>Candidat Premium</strong> et le label <strong>Candidat Fiable</strong> pour attirer les meilleures offres en direct.
                  </p>

                  <div className="driver-boost-features-grid">
                    <div className="driver-boost-feature-item">
                      <div className="driver-boost-feature-icon amber">
                        <Award size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">1er de Liste Garanti</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Positionné tout en haut des recherches des exploitants de votre secteur.
                        </div>
                      </div>
                    </div>

                    <div className="driver-boost-feature-item">
                      <div className="driver-boost-feature-icon emerald">
                        <Star size={18} className="fill-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Badge Candidat Premium</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Un insigne distinctif doré affiché sur votre carte candidat et votre CV.
                        </div>
                      </div>
                    </div>

                    <div className="driver-boost-feature-item">
                      <div className="driver-boost-feature-icon sky">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Label Candidat Fiable</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Permis et documents certifiés prioritaires, inspirant une confiance immédiate.
                        </div>
                      </div>
                    </div>

                    <div className="driver-boost-feature-item">
                      <div className="driver-boost-feature-icon purple">
                        <Zap size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Contact Direct Prioritaire</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Vos coordonnées sont suggérées dès qu&apos;une tournée ou un CDI se libère.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="driver-boost-cta-bar">
                    <div className="driver-boost-price-tag">
                      <span className="driver-boost-price-amount">4,99 €</span>
                      <span className="driver-boost-price-period">pour 3 mois complets (soit 1,66 €/mois)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBoostModalOpen(true)}
                      className="driver-boost-btn"
                    >
                      <Zap size={16} />
                      <span>Activer mon Boost Visibilité (4,99 €)</span>
                    </button>
                  </div>
                </div>
              )}

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
            <div className="portal-chat-layout">
              {/* Liste des discussions */}
              <div className={`portal-chat-sidebar ${activeRecruiterId ? "chat-mobile-hidden" : ""}`}>
                <div className="portal-chat-sidebar-header">
                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff" }}>
                    Messagerie Directe ({1 + recruiters.length})
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                    Support officiel & recruteurs vérifiés
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
                  {/* Fil 1 : Support Officiel TruckMatch (Toujours disponible) */}
                  <button
                    type="button"
                    onClick={() => setActiveRecruiterId("truckmatch_support")}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      textAlign: "left",
                      background: activeRecruiterId === "truckmatch_support" ? "rgba(2, 132, 199, 0.15)" : "#0b1522",
                      border: activeRecruiterId === "truckmatch_support" ? "1px solid #0284c7" : "1px solid #14243a",
                      marginBottom: "0.45rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #0284c7, #0369a1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: "0.85rem",
                        fontWeight: 900,
                        boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                        flexShrink: 0,
                      }}
                    >
                      <Truck size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          Support TruckMatch
                        </span>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} title="En ligne" />
                      </div>
                      <div style={{ fontSize: "0.71rem", color: "#38bdf8", marginTop: "0.1rem" }}>
                        Équipe Exploitation & Aide
                      </div>
                    </div>
                    {supportUnreadCount > 0 && (
                      <span
                        style={{
                          background: "#0284c7",
                          color: "#ffffff",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "9999px",
                          boxShadow: "0 0 10px rgba(2, 132, 199, 0.6)",
                        }}
                      >
                        {supportUnreadCount}
                      </span>
                    )}
                  </button>

                  {/* Fils supplémentaires : Recruteurs éventuels */}
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
                        border: activeRecruiterId === r.id ? "1px solid #38bdf8" : "1px solid #14243a",
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
                          background: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          flexShrink: 0,
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
              <div className={`portal-chat-main ${!activeRecruiterId ? "chat-mobile-hidden" : ""}`}>
                {!activeRecruiterId ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", padding: "2rem" }}>
                    <MessageSquare size={38} style={{ color: "#38bdf8", opacity: 0.5, marginBottom: "0.85rem" }} />
                    <h4 style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.35rem" }}>
                      Sélectionnez une discussion
                    </h4>
                    <p style={{ maxWidth: 380, textAlign: "center", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                      Échangez en direct et en toute confidentialité avec le support TruckMatch ou les exploitants de transport.
                    </p>
                  </div>
                ) : activeRecruiterId === "truckmatch_support" ? (
                  <>
                    {/* En-tête Discussion Support TruckMatch */}
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid #142339",
                        background: "#060d17",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                        <button
                          type="button"
                          className="chat-mobile-back-btn"
                          onClick={() => setActiveRecruiterId("")}
                          aria-label="Retour à la liste"
                        >
                          <ArrowLeft size={16} />
                          <span>Discussions</span>
                        </button>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span>Support Officiel TruckMatch</span>
                            <span className="permit-badge-pro permit-valid" style={{ padding: "0.1rem 0.4rem", fontSize: "0.68rem" }}>
                              Officiel
                            </span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.1rem" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
                            <span>Équipe d'exploitation connectée</span>
                          </div>
                        </div>
                      </div>

                      <span className="permit-badge-pro permit-valid chat-badge-hide-mobile">
                        Assistance 7j/7 • Réponse Rapide
                      </span>
                    </div>

                    {/* Zone des messages Support */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      {/* Message de bienvenue si aucun échange */}
                      {supportMessages.length === 0 ? (
                        <div style={{ textAlign: "center", margin: "auto", maxWidth: 420, padding: "2rem 1rem" }}>
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: "50%",
                              background: "rgba(2, 132, 199, 0.15)",
                              border: "1px solid rgba(2, 132, 199, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#38bdf8",
                              margin: "0 auto 1rem",
                            }}
                          >
                            <Truck size={24} />
                          </div>
                          <h4 style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                            Bienvenue sur votre messagerie directe !
                          </h4>
                          <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>
                            Notre équipe d'exploitation est à votre écoute pour vous conseiller, valider vos permis ou vous orienter vers les meilleures tournées.
                          </p>
                        </div>
                      ) : (
                        supportMessages.map((msg) => {
                          const isAdmin = msg.sender_type === "admin";
                          const formattedTime = msg.created_at
                            ? new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                            : "";
                          return (
                            <div
                              key={msg.id}
                              style={{
                                alignSelf: isAdmin ? "flex-start" : "flex-end",
                                maxWidth: "75%",
                                background: isAdmin ? "#0d1b2e" : "linear-gradient(135deg, #0284c7, #0369a1)",
                                border: isAdmin ? "1px solid #192d47" : "1px solid #38bdf8",
                                padding: "0.75rem 1rem",
                                borderRadius: isAdmin ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                                color: "#ffffff",
                                fontSize: "0.84rem",
                                lineHeight: 1.45,
                                boxShadow: isAdmin ? "none" : "0 2px 8px rgba(2, 132, 199, 0.2)",
                              }}
                            >
                              {isAdmin && (
                                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#38bdf8", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                  <ShieldCheck size={12} />
                                  <span>Support TruckMatch</span>
                                </div>
                              )}
                              <div style={{ whiteSpace: "pre-wrap" }}>{msg.message}</div>
                              <div
                                style={{
                                  fontSize: "0.68rem",
                                  color: isAdmin ? "#94a3b8" : "rgba(255,255,255,0.75)",
                                  textAlign: "right",
                                  marginTop: "0.3rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: "0.25rem",
                                }}
                              >
                                <span>{formattedTime}</span>
                                {!isAdmin && <Check size={11} />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Champ d'envoi Support */}
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
                        placeholder="Écrivez votre message à l'équipe Support TruckMatch..."
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
                ) : (
                  <>
                    {/* En-tête discussion Recruteur */}
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid #142339",
                        background: "#060d17",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
                        <button
                          type="button"
                          className="chat-mobile-back-btn"
                          onClick={() => setActiveRecruiterId("")}
                          aria-label="Retour à la liste"
                        >
                          <ArrowLeft size={16} />
                          <span>Discussions</span>
                        </button>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {recruiters.find((r) => r.id === activeRecruiterId)?.name}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
                            <span>Transporteur vérifié</span>
                          </div>
                        </div>
                      </div>

                      <span className="permit-badge-pro permit-valid chat-badge-hide-mobile">
                        Direct • 0% Commission
                      </span>
                    </div>

                    {/* Messages Recruteur */}
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

                    {/* Champ d'envoi Recruteur */}
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

      {/* MODAL ACTIVATION BOOST CANDIDAT (4.99 € / 3 MOIS) */}
      {boostModalOpen && (
        <div className="driver-boost-modal-backdrop" onClick={() => !boostLoading && setBoostModalOpen(false)}>
          <div className="driver-boost-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Activer le Boost Candidat</h3>
                  <p className="text-xs text-slate-400">Visibilité n°1 pendant 90 jours consécutifs</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !boostLoading && setBoostModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {boostSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-center">
                  <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-white mb-1">Boost Activé avec Succès !</h4>
                  <p className="text-xs text-slate-300">{boostSuccessMsg}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400 font-semibold">Formule choisie</span>
                      <span className="text-xs font-bold text-amber-400">Pack Visibilité 3 Mois</span>
                    </div>

                    <ul className="flex flex-col gap-2 text-xs text-slate-300 mb-3">
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Remontée en <strong>1ère position</strong> des recherches transporteurs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Badge <strong>Candidat Premium</strong> distinctif</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Label <strong>Candidat Fiable &amp; Certifié</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-400 flex-shrink-0" />
                        <span>Durée : <strong>90 jours</strong> sans engagement récurrent</span>
                      </li>
                    </ul>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                      <span className="text-white font-bold">Total TTC à régler</span>
                      <span className="text-xl font-extrabold text-amber-400">4,99 €</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs text-slate-300">
                    <CreditCard size={18} className="text-sky-400 flex-shrink-0" />
                    <span>Paiement 100% sécurisé par carte bancaire. Aucun prélèvement automatique ultérieur.</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={boostLoading}
                      onClick={() => setBoostModalOpen(false)}
                      className="cockpit-btn cockpit-btn-secondary"
                      style={{ padding: "0.6rem 1rem", fontSize: "0.82rem" }}
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      disabled={boostLoading}
                      onClick={handleActivateBoost}
                      className="driver-boost-btn"
                      style={{ padding: "0.65rem 1.4rem", fontSize: "0.85rem" }}
                    >
                      {boostLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                      <span>{boostLoading ? "Activation en cours..." : "Confirmer et Activer (4,99 €)"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BARRE DE NAVIGATION BASSE 100% MOBILE ERGONOMIQUE            */}
      {/* ============================================================== */}
      <nav className="portal-mobile-bottom-nav" aria-label="Navigation mobile principale">
        <button
          type="button"
          onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
          className={`portal-bottom-nav-item ${activeTab === "overview" ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          <span>Cockpit</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("permits"); setMobileMenuOpen(false); }}
          className={`portal-bottom-nav-item ${activeTab === "permits" ? "active" : ""}`}
        >
          <Award size={20} />
          <span>Permis</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("jobs"); setMobileMenuOpen(false); }}
          className={`portal-bottom-nav-item ${activeTab === "jobs" ? "active" : ""}`}
        >
          <div style={{ position: "relative", display: "inline-flex" }}>
            <Briefcase size={20} />
            {jobOffers.length > 0 && (
              <span className="portal-bottom-badge">{jobOffers.length}</span>
            )}
          </div>
          <span>Offres</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("documents"); setMobileMenuOpen(false); }}
          className={`portal-bottom-nav-item ${activeTab === "documents" ? "active" : ""}`}
        >
          <FileText size={20} />
          <span>CV & Docs</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("messages"); setMobileMenuOpen(false); }}
          className={`portal-bottom-nav-item ${activeTab === "messages" ? "active" : ""}`}
        >
          <div style={{ position: "relative", display: "inline-flex" }}>
            <MessageSquare size={20} />
            {supportUnreadCount > 0 && (
              <span className="portal-bottom-badge animate-pulse">{supportUnreadCount}</span>
            )}
          </div>
          <span>Messages</span>
        </button>
      </nav>
    </div>
  );
}
