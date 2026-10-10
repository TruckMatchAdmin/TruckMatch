"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileText,
  LogOut,
  ArrowRight,
  Briefcase,
  Phone,
  Mail,
  Truck,
  RefreshCw,
  Plus,
  Eye,
  ExternalLink,
  Clock,
  Sparkles,
  Award,
  Filter,
  Check,
  X,
  AlertCircle,
  Zap,
} from "lucide-react";

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  postal_code: string;
  address?: string;
  birth_date?: string;
  permits: string[];
  fimo: boolean;
  fco: boolean;
  chrono_card: boolean;
  adr?: string[];
  availability: "immediate" | "flexible";
  resume_url?: string;
  experience_years?: string;
  bio?: string;
  created_at: string;
}

export default function CompanyPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState({
    totalDrivers: 0,
    ceDrivers: 0,
    cDrivers: 0,
    withResume: 0,
    immediate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "ce" | "c" | "immediate" | "resume" | "adr">("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeNav, setActiveNav] = useState<"drivers" | "profile">("drivers");

  // Modal Déposer un besoin express
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [postJobLoading, setPostJobLoading] = useState(false);
  const [postJobSuccess, setPostJobSuccess] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: "",
    permit: "CE",
    location: "",
    contract_type: "CDI",
    salary: "2 600€ - 3 200€ brut/mois",
    urgent: true,
    description: "",
  });

  // Charger profil et vivier de conducteurs Supabase
  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/data");
      if (res.ok) {
        const json = await res.json();
        setDrivers(json.drivers || []);
        if (json.stats) setStats(json.stats);
        if (json.company) setCompany(json.company);
      }
    } catch (err) {
      console.error("Erreur chargement vivier entreprise:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tm_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
    loadCompanyData();
  }, []);

  const handleLogout = () => {
    document.cookie = "tm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      localStorage.removeItem("tm_user");
    }
    router.push("/");
    router.refresh();
  };

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostJobLoading(true);
    try {
      const res = await fetch("/api/company/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "post_job_need",
          data: {
            ...newJob,
            company_name: company?.company_name || user?.name || "Entreprise Partenaire",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPostJobSuccess(data.message || "Recherche de chauffeur publiée avec succès.");
        setTimeout(() => {
          setIsPostJobModalOpen(false);
          setPostJobSuccess(null);
          setNewJob({
            title: "",
            permit: "CE",
            location: "",
            contract_type: "CDI",
            salary: "2 600€ - 3 200€ brut/mois",
            urgent: true,
            description: "",
          });
        }, 1500);
      }
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setPostJobLoading(false);
    }
  };

  // Filtrage conducteurs
  const filteredDrivers = drivers.filter((d) => {
    if (filterType === "ce" && !d.permits?.includes("CE")) return false;
    if (filterType === "c" && !d.permits?.includes("C")) return false;
    if (filterType === "immediate" && d.availability !== "immediate") return false;
    if (filterType === "resume" && !d.resume_url) return false;
    if (filterType === "adr" && (!d.adr || d.adr.length === 0)) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.first_name?.toLowerCase().includes(q) ||
      d.last_name?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.postal_code?.includes(q) ||
      d.phone?.includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="company-cockpit-wrapper">
      {/* ============================================================== */}
      {/* 1. SIDEBAR GAUCHE (MENU À GAUCHE)                              */}
      {/* ============================================================== */}
      <aside className="portal-sidebar-left">
        {/* Brand / Logo */}
        <div className="portal-sidebar-brand">
          <Link href="/" className="brand-title">
            Truck<span>Match</span>
          </Link>
          <span className="portal-role-tag tag-entreprise">Recruteur Pro</span>
        </div>

        {/* Profil Entreprise */}
        <div className="portal-sidebar-user-box">
          <div className="portal-sidebar-user-row">
            <div className="portal-avatar-ring avatar-company">
              <Building2 size={20} />
              <span className="portal-avatar-dot online" title="Compte Recruteur Vérifié" />
            </div>
            <div className="portal-user-meta">
              <h2 className="portal-user-name">
                {company?.company_name || user?.name || "Entreprise de Transport"}
              </h2>
              <div className="portal-user-sub">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>SIRET: {company?.siret || "Vérifié"}</span>
              </div>
            </div>
          </div>

          <div className="portal-status-toggle-btn mt-2 cursor-default">
            <span className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981" }} />
              <span>Flotte Active &amp; Vérifiée</span>
            </span>
          </div>
        </div>

        {/* Menu Navigation Sidebar */}
        <nav className="portal-sidebar-nav-section">
          <span className="portal-sidebar-nav-label">MODULES RECRUTEUR</span>

          <button
            type="button"
            onClick={() => setActiveNav("drivers")}
            className={`portal-nav-btn ${activeNav === "drivers" ? "active-emerald" : ""}`}
          >
            <Users className="nav-icon" />
            <span className="nav-title">Vivier Chauffeurs Direct</span>
            <span className="nav-badge">{drivers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPostJobModalOpen(true)}
            className="portal-nav-btn"
          >
            <Plus className="nav-icon text-emerald-400" />
            <span className="nav-title">Publier un Besoin</span>
          </button>

          <Link href="/carte-chauffeurs" className="portal-nav-btn">
            <MapPin className="nav-icon text-sky-400" />
            <span className="nav-title">Carte Chauffeurs de France</span>
            <ExternalLink size={12} className="text-slate-400 ml-auto" />
          </Link>

          <button
            type="button"
            onClick={() => setActiveNav("profile")}
            className={`portal-nav-btn ${activeNav === "profile" ? "active-emerald" : ""}`}
          >
            <Building2 className="nav-icon" />
            <span className="nav-title">Profil Transporteur &amp; Flotte</span>
          </button>
        </nav>

        {/* KPI Box dans Sidebar */}
        <div className="portal-sidebar-kpi-box">
          <div className="portal-sidebar-kpi-item">
            <span>Permis CE (SPL) :</span>
            <strong className="text-sky-400">{stats.ceDrivers}</strong>
          </div>
          <div className="portal-sidebar-kpi-item">
            <span>Permis C (PL) :</span>
            <strong>{stats.cDrivers}</strong>
          </div>
          <div className="portal-sidebar-kpi-item">
            <span>Disponibles immédiats :</span>
            <strong className="text-emerald-400">{stats.immediate}</strong>
          </div>
          <div className="portal-sidebar-kpi-item">
            <span>Avec CV PDF :</span>
            <strong className="text-purple-400">{stats.withResume}</strong>
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
            <span>Sortie</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. ZONE PRINCIPALE COCKPIT DROITE                              */}
      {/* ============================================================== */}
      <div className="portal-main-area">
        {/* Topbar compacte */}
        <header className="portal-main-topbar">
          <div className="portal-main-topbar-left">
            <h1 className="portal-topbar-page-title">
              <Truck size={18} className="text-emerald-400" />
              <span>
                {activeNav === "drivers"
                  ? "Vivier Conducteurs Disponibles en Direct"
                  : "Fiche Profil Entreprise & Flotte"}
              </span>
            </h1>
            <span className="portal-status-live-pill">
              ● Supabase Live : {drivers.length} conducteurs certifiés
            </span>
          </div>

          <div className="portal-main-topbar-right">
            <button
              type="button"
              onClick={() => setIsPostJobModalOpen(true)}
              className="cockpit-btn cockpit-btn-emerald cockpit-btn-sm"
              title="Déposer un besoin de chauffeur pour votre flotte"
            >
              <Plus size={13} />
              <span>Publier un Besoin</span>
            </button>

            <button
              type="button"
              onClick={loadCompanyData}
              disabled={loading}
              className="cockpit-btn cockpit-btn-secondary cockpit-btn-sm"
              title="Actualiser depuis Supabase"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Actualiser</span>
            </button>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="company-cockpit-main">
          {activeNav === "profile" ? (
            <div className="portal-panel-card" style={{ maxWidth: "800px" }}>
              <div className="portal-panel-card-header">
                <h2 className="portal-panel-card-title">
                  <Building2 size={18} className="text-emerald-400" />
                  <span>Détails de l'Entreprise de Transport</span>
                </h2>
                <span className="permit-badge-pro permit-valid">SIRET Vérifié (URSSAF)</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                <div>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Raison Sociale</label>
                    <input
                      type="text"
                      value={company?.company_name || user?.name || "Entreprise de Transport"}
                      readOnly
                      className="portal-form-input"
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Numéro SIRET</label>
                    <input
                      type="text"
                      value={company?.siret || "892 451 902 00024"}
                      readOnly
                      className="portal-form-input"
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Taille de Flotte</label>
                    <input
                      type="text"
                      value={company?.fleet_size || "10 - 50 Poids Lourds"}
                      readOnly
                      className="portal-form-input"
                    />
                  </div>
                </div>

                <div>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Contact Exploitation</label>
                    <input
                      type="email"
                      value={company?.email || user?.email || "exploitation@transport.fr"}
                      readOnly
                      className="portal-form-input"
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Téléphone Direction</label>
                    <input
                      type="tel"
                      value={company?.phone || user?.phone || "04 78 •• •• ••"}
                      readOnly
                      className="portal-form-input"
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Siège & Dépôt Principal</label>
                    <input
                      type="text"
                      value={`${company?.postal_code || ""} ${company?.city || "France"}`.trim()}
                      readOnly
                      className="portal-form-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#060d17", borderRadius: "8px", border: "1px solid #14243a", fontSize: "0.78rem", color: "#94a3b8" }}>
                ✓ Votre compte entreprise bénéficie d'un accès direct illimité au vivier de conducteurs qualifiés sans intermédiaire.
              </div>
            </div>
          ) : (
            <>
              {/* A. Bloc Contrôle Haut : Recherche + Filtres */}
              <div className="candidates-header-block" style={{ padding: "0.5rem 0.75rem" }}>

          {/* Ligne 2 : Recherche sombre + Pilules filtres claires */}
          <div className="candidates-header-row-2">
            <div className="candidates-search-dark">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par nom, prénom, ville, code postal, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="candidates-pills-bar">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`candidates-filter-pill ${filterType === "all" ? "active" : ""}`}
              >
                Tous ({drivers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("ce")}
                className={`candidates-filter-pill ${filterType === "ce" ? "active" : ""}`}
              >
                Permis CE (SPL) ({stats.ceDrivers})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("c")}
                className={`candidates-filter-pill ${filterType === "c" ? "active" : ""}`}
              >
                Permis C (Porteur) ({stats.cDrivers})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("immediate")}
                className={`candidates-filter-pill ${filterType === "immediate" ? "active" : ""}`}
              >
                Dispo Immédiate ({stats.immediate})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("resume")}
                className={`candidates-filter-pill ${filterType === "resume" ? "active" : ""}`}
              >
                Avec CV ({stats.withResume})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("adr")}
                className={`candidates-filter-pill ${filterType === "adr" ? "active" : ""}`}
              >
                ADR Dangereux
              </button>
            </div>
          </div>
        </div>

        {/* B. Bandeau KPI Aéré (68px) relié en direct à Supabase */}
        <div className="candidates-kpis-strip">
          <div className="candidates-kpi-item">
            <div>
              <div className="candidates-kpi-lbl">Chauffeurs Disponibles</div>
              <div className="candidates-kpi-val">{stats.totalDrivers}</div>
            </div>
            <Users size={18} className="text-sky-400" />
          </div>

          <div className="candidates-kpi-item">
            <div>
              <div className="candidates-kpi-lbl">Permis CE (SPL)</div>
              <div className="candidates-kpi-val">{stats.ceDrivers}</div>
            </div>
            <Truck size={18} className="text-primary" />
          </div>

          <div className="candidates-kpi-item">
            <div>
              <div className="candidates-kpi-lbl">Permis C (Porteur)</div>
              <div className="candidates-kpi-val">{stats.cDrivers}</div>
            </div>
            <Truck size={18} className="text-emerald-400" />
          </div>

          <div className="candidates-kpi-item">
            <div>
              <div className="candidates-kpi-lbl">CVs Documentés</div>
              <div className="candidates-kpi-val">{stats.withResume}</div>
            </div>
            <FileText size={18} className="text-amber-400" />
          </div>

          <div className="candidates-kpi-item">
            <div>
              <div className="candidates-kpi-lbl">Prise de Poste Immédiate</div>
              <div className="candidates-kpi-val">{stats.immediate}</div>
            </div>
            <Clock size={18} className="text-purple-400" />
          </div>
        </div>

        {/* C. Table Vivier Chauffeurs Pro (Zero-scroll, scroll interne) */}
        <div className="candidates-table-container">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users size={36} className="mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="font-bold text-sm text-white">Aucun candidat ne correspond à votre filtre.</p>
              <p className="text-xs mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
              <button
                onClick={() => {
                  setFilterType("all");
                  setSearchQuery("");
                }}
                className="btn-cockpit-action btn-cockpit-action-primary mt-3"
              >
                <span>Afficher tous les conducteurs ({drivers.length})</span>
              </button>
            </div>
          ) : (
            <table className="candidates-table-dark">
              <thead>
                <tr>
                  <th>Conducteur Routier</th>
                  <th>Contact Direct</th>
                  <th>Localisation & Dépôt</th>
                  <th>Permis & Titres Pro</th>
                  <th>Document CV</th>
                  <th>Disponibilité</th>
                  <th>Date Inscription</th>
                  <th style={{ textAlign: "right" }}>Action Recruteur</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="font-bold text-white text-sm tracking-tight mb-1">
                        {d.first_name} {d.last_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {d.birth_date
                          ? `Né(e) le ${new Date(d.birth_date).toLocaleDateString("fr-FR")}`
                          : "Conducteur Professionnel"}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs mb-1">
                        <Phone size={12} className="text-sky-400 shrink-0" />
                        <a href={`tel:${d.phone}`} className="hover:underline font-semibold text-white">
                          {d.phone || "-"}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <a href={`mailto:${d.email}`} className="hover:underline hover:text-white truncate max-w-[170px]">
                          {d.email || "-"}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs font-semibold text-white mb-1">
                        <MapPin size={12} className="text-sky-400 shrink-0" />
                        <span>{d.postal_code} {d.city}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[170px]">
                        {d.address || "Secteur régional & national"}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {Array.isArray(d.permits) &&
                          d.permits.map((p: string) => (
                            <span key={p} className="cockpit-badge-pill" style={{ background: "#0284c7", color: "#fff", fontWeight: 800 }}>
                              {p}
                            </span>
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.fimo && (
                          <span className="cockpit-badge-pill" style={{ background: "#064e3b", color: "#34d399", border: "1px solid #059669" }}>
                            FIMO
                          </span>
                        )}
                        {d.fco && (
                          <span className="cockpit-badge-pill" style={{ background: "#0c4a6e", color: "#38bdf8", border: "1px solid #0284c7" }}>
                            FCO
                          </span>
                        )}
                        {d.chrono_card && (
                          <span className="cockpit-badge-pill" style={{ background: "#451a03", color: "#fbbf24", border: "1px solid #d97706" }}>
                            Chrono
                          </span>
                        )}
                        {Array.isArray(d.adr) && d.adr.length > 0 && (
                          <span className="cockpit-badge-pill" style={{ background: "#7c2d12", color: "#fdba74", border: "1px solid #ea580c" }}>
                            ADR
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {d.resume_url ? (
                        <a
                          href={d.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-cockpit-action"
                          style={{ fontSize: "0.74rem", padding: "0.3rem 0.65rem", borderRadius: "7px" }}
                          title="Consulter le CV PDF"
                        >
                          <FileText size={12} className="text-primary" />
                          <span>Voir CV</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Aucun CV</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`cockpit-badge-pill ${
                          d.availability === "immediate" ? "badge-imm-on" : "badge-imm-off"
                        }`}
                        style={{ padding: "0.35rem 0.75rem", borderRadius: "8px" }}
                      >
                        {d.availability === "immediate" ? "● Immédiat" : "○ Flexible"}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "-"}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDriver(d)}
                          className="btn-cockpit-action btn-cockpit-action-primary"
                          style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                          title="Consulter la fiche complète du chauffeur"
                        >
                          <Eye size={13} />
                          <span>Dossier Complet</span>
                        </button>

                        <a
                          href={`tel:${d.phone}`}
                          className="btn-cockpit-mini"
                          title="Appeler directement ce conducteur"
                        >
                          <Phone size={13} className="text-emerald-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

            </>
          )}
        </main>
      </div>

      {/* MODALE 1 : FICHE DOSSIER CANDIDAT COMPLET */}
      {selectedDriver && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedDriver(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-sky-400" />
                <h3 className="font-black text-white text-base">
                  Dossier Chauffeur : {selectedDriver.first_name} {selectedDriver.last_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold mb-1">Contact Direct</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <Phone size={13} className="text-sky-400" />
                    <a href={`tel:${selectedDriver.phone}`} className="hover:underline">
                      {selectedDriver.phone}
                    </a>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <a href={`mailto:${selectedDriver.email}`} className="hover:underline">
                      {selectedDriver.email}
                    </a>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold mb-1">Localisation & Mobilité</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <MapPin size={13} className="text-sky-400" />
                    <span>{selectedDriver.postal_code} {selectedDriver.city}</span>
                  </div>
                  <div className="text-xs text-slate-400">{selectedDriver.address || "Adresse locale"}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">Permis de conduire validés :</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedDriver.permits) &&
                    selectedDriver.permits.map((p) => (
                      <span
                        key={p}
                        className="px-3 py-1 rounded-md text-xs font-black bg-sky-600 text-white"
                      >
                        Permis {p}
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">Titres professionnels & Validations :</div>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`p-2 rounded text-xs font-bold flex items-center gap-1.5 ${
                      selectedDriver.fimo ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Check size={13} /> FIMO Marchandises
                  </div>
                  <div
                    className={`p-2 rounded text-xs font-bold flex items-center gap-1.5 ${
                      selectedDriver.fco ? "bg-sky-950/80 text-sky-400 border border-sky-800" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Check size={13} /> FCO Continue
                  </div>
                  <div
                    className={`p-2 rounded text-xs font-bold flex items-center gap-1.5 ${
                      selectedDriver.chrono_card ? "bg-amber-950/80 text-amber-400 border border-amber-800" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Check size={13} /> Carte Chronotachygraphe
                  </div>
                </div>
              </div>

              {selectedDriver.resume_url && (
                <div className="bg-sky-950/40 p-4 rounded-lg border border-sky-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-sky-400" />
                    <div>
                      <div className="text-sm font-bold text-white">Curriculum Vitae (PDF)</div>
                      <div className="text-xs text-slate-300">Document vérifié disponible en consultation</div>
                    </div>
                  </div>
                  <a
                    href={selectedDriver.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cockpit-action btn-cockpit-action-primary"
                  >
                    <span>Ouvrir le CV</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="btn-cockpit-action"
              >
                Fermer
              </button>
              <a
                href={`tel:${selectedDriver.phone}`}
                className="btn-cockpit-action btn-cockpit-action-primary"
              >
                <Phone size={13} />
                <span>Appeler {selectedDriver.first_name}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODALE 2 : PUBLIER UN BESOIN EXPRESS CHAUFFEUR */}
      {isPostJobModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsPostJobModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handlePostJobSubmit}>
              <div className="admin-modal-header">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-sky-400" />
                  <h3 className="font-black text-white text-base">
                    Publier un Besoin de Recrutement Express
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-modal-body">
                {postJobSuccess && (
                  <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{postJobSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Permis requis
                    </label>
                    <select
                      value={newJob.permit}
                      onChange={(e) => setNewJob({ ...newJob, permit: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="CE">Permis CE (Semi-remorque / SPL)</option>
                      <option value="C">Permis C (Porteur / PL)</option>
                      <option value="C1">Permis C1</option>
                      <option value="BE">Permis BE (Remorque)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Type de contrat
                    </label>
                    <select
                      value={newJob.contract_type}
                      onChange={(e) => setNewJob({ ...newJob, contract_type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="CDI">CDI - Temps plein</option>
                      <option value="CDD">CDD - Remplacement / Renfort</option>
                      <option value="Traction">Traction régulière / Sous-traitance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Ville / Dépôt de prise de poste
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Lyon, Nantes, Lille, Rungis..."
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Rémunération indicative
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2 600€ - 3 200€ brut + paniers"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Description de la tournée & détails
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Précisez le type de matériel (Frigo, Bâché, Benne, Citerne), horaires (jour, nuit, découchés) et avantages..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="btn-cockpit-action"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={postJobLoading}
                  className="btn-cockpit-action btn-cockpit-action-primary"
                >
                  {postJobLoading ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Zap size={13} />
                  )}
                  <span>Publier dans le réseau</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
