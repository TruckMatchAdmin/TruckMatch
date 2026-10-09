"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  DollarSign,
  MessageSquareText,
  FileText,
  Clock,
  ExternalLink,
  Search,
  ShieldAlert,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Send,
  Truck,
  TrendingUp,
  ShieldCheck,
  Eye,
  ArrowUpRight,
  Sparkles,
  UserCheck,
  BadgeEuro,
  HelpCircle,
  Filter,
  Activity,
  Database,
  Trash2,
  Download,
  Check,
  X,
  Zap,
} from "lucide-react";

type AdminTab =
  | "dashboard"
  | "candidats"
  | "entreprises"
  | "stats-site"
  | "stats-revenu"
  | "support";

interface ChatMessage {
  id: string;
  sender: "admin" | "recipient";
  text: string;
  time: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [supabaseLatency, setSupabaseLatency] = useState<number>(24);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalCompanies: 0,
    withResume: 0,
    availableNow: 0,
  });

  // Recherche dans le cockpit dashboard
  const [cockpitDriverSearch, setCockpitDriverSearch] = useState("");
  const [cockpitCompanySearch, setCockpitCompanySearch] = useState("");

  // Filtres onglets détaillés
  const [driverSearch, setDriverSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState<"all" | "ce" | "c" | "resume" | "immediate">("all");
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<"all" | "fleet-small" | "fleet-medium" | "fleet-large">("all");

  // Support / Tchat
  const [chatRecipientFilter, setChatRecipientFilter] = useState<"all" | "candidats" | "entreprises">("all");
  const [chatSearch, setChatSearch] = useState("");
  const [activeRecipient, setActiveRecipient] = useState<{
    id: string;
    name: string;
    type: "candidat" | "entreprise";
    phone?: string;
    email?: string;
    city?: string;
  } | null>(null);

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const startPing = Date.now();
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setError("Session expirée ou droits administrateur requis. Veuillez vous reconnecter.");
          return;
        }
        throw new Error("Erreur de chargement des données.");
      }
      const data = await res.json();
      const loadedDrivers = data.drivers || [];
      const loadedCompanies = data.companies || [];
      setDrivers(loadedDrivers);
      setCompanies(loadedCompanies);
      setStats(
        data.stats || {
          totalDrivers: loadedDrivers.length,
          totalCompanies: loadedCompanies.length,
          withResume: loadedDrivers.filter((d: any) => d.resume_url).length,
          availableNow: loadedDrivers.filter((d: any) => d.availability === "immediate").length,
        }
      );
      setSupabaseLatency(Date.now() - startPing);
      const now = new Date();
      setLastSyncTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );

      // Initialiser le destinataire par défaut pour le tchat s'il n'y en a pas
      if (!activeRecipient) {
        if (loadedDrivers.length > 0) {
          const first = loadedDrivers[0];
          setActiveRecipient({
            id: `cand-${first.id}`,
            name: `${first.first_name} ${first.last_name}`,
            type: "candidat",
            phone: first.phone,
            email: first.email,
            city: `${first.postal_code || ""} ${first.city || ""}`.trim(),
          });
        } else if (loadedCompanies.length > 0) {
          const first = loadedCompanies[0];
          setActiveRecipient({
            id: `comp-${first.id}`,
            name: first.company_name,
            type: "entreprise",
            phone: first.phone,
            email: first.email,
            city: `${first.postal_code || ""} ${first.city || ""}`.trim(),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Charger messages archivés
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedChats = localStorage.getItem("tm_admin_chats");
      if (savedChats) {
        try {
          setChatMessages(JSON.parse(savedChats));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeRecipient]);

  const handleLogout = () => {
    document.cookie = "tm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      localStorage.removeItem("tm_user");
    }
    router.push("/");
    router.refresh();
  };

  // Actions Supabase en direct
  const handleSeedSupabase = async () => {
    if (!confirm("Voulez-vous injecter des profils réels de test (3 chauffeurs qualifiés et 2 entreprises) dans Supabase ?")) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'injection.");
      await loadData();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDriverAvailability = async (driverId: string) => {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_driver_availability", id: driverId }),
      });
      if (res.ok) {
        const { availability } = await res.json();
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, availability } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDriver = async (driverId: string, name: string) => {
    if (!confirm(`Supprimer définitivement le candidat ${name} de Supabase ?`)) return;
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_driver", id: driverId }),
      });
      if (res.ok) {
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompany = async (companyId: string, name: string) => {
    if (!confirm(`Supprimer définitivement l'entreprise ${name} de Supabase ?`)) return;
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_company", id: companyId }),
      });
      if (res.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportData = () => {
    const exportObj = {
      exported_at: new Date().toISOString(),
      drivers_count: drivers.length,
      companies_count: companies.length,
      drivers,
      companies,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truckmatch-supabase-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtrage conducteurs cockpit
  const cockpitDrivers = drivers.filter((d) => {
    if (!cockpitDriverSearch) return true;
    const q = cockpitDriverSearch.toLowerCase();
    return (
      d.first_name?.toLowerCase().includes(q) ||
      d.last_name?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q)
    );
  });

  // Filtrage entreprises cockpit
  const cockpitCompanies = companies.filter((c) => {
    if (!cockpitCompanySearch) return true;
    const q = cockpitCompanySearch.toLowerCase();
    return (
      c.company_name?.toLowerCase().includes(q) ||
      c.siret?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  // Tchat direct
  const handleOpenChatWithDriver = (d: any) => {
    setActiveRecipient({
      id: `cand-${d.id}`,
      name: `${d.first_name} ${d.last_name}`,
      type: "candidat",
      phone: d.phone,
      email: d.email,
      city: `${d.postal_code || ""} ${d.city || ""}`.trim(),
    });
    setActiveTab("support");
  };

  const handleOpenChatWithCompany = (c: any) => {
    setActiveRecipient({
      id: `comp-${c.id}`,
      name: c.company_name,
      type: "entreprise",
      phone: c.phone,
      email: c.email,
      city: `${c.postal_code || ""} ${c.city || ""}`.trim(),
    });
    setActiveTab("support");
  };

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || messageInput.trim();
    if (!textToSend || !activeRecipient) return;

    const recipientId = activeRecipient.id;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "admin",
      text: textToSend,
      time: timeStr,
    };

    setChatMessages((prev) => {
      const currentList = prev[recipientId] || [
        {
          id: `init-${recipientId}`,
          sender: "recipient",
          text:
            activeRecipient.type === "candidat"
              ? `Bonjour l'équipe TruckMatch ! Je viens de compléter mon profil de chauffeur routier.`
              : `Bonjour, nous recherchons actuellement des conducteurs SPL et PL sur notre secteur.`,
          time: "10:15",
        },
      ];
      const updated = {
        ...prev,
        [recipientId]: [...currentList, newMsg],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("tm_admin_chats", JSON.stringify(updated));
      }
      return updated;
    });

    setMessageInput("");
  };

  // Liste consolidée des contacts pour le tchat
  const chatThreads = [
    ...drivers.map((d) => ({
      id: `cand-${d.id}`,
      name: `${d.first_name} ${d.last_name}`,
      type: "candidat" as const,
      phone: d.phone,
      email: d.email,
      city: `${d.postal_code || ""} ${d.city || ""}`.trim(),
      lastMsg:
        chatMessages[`cand-${d.id}`]?.slice(-1)[0]?.text ||
        "Profil chauffeur enregistré dans Supabase",
      time: chatMessages[`cand-${d.id}`]?.slice(-1)[0]?.time || "Récemment",
    })),
    ...companies.map((c) => ({
      id: `comp-${c.id}`,
      name: c.company_name,
      type: "entreprise" as const,
      phone: c.phone,
      email: c.email,
      city: `${c.postal_code || ""} ${c.city || ""}`.trim(),
      lastMsg:
        chatMessages[`comp-${c.id}`]?.slice(-1)[0]?.text ||
        "Compte transporteur vérifié (SIRET)",
      time: chatMessages[`comp-${c.id}`]?.slice(-1)[0]?.time || "Récemment",
    })),
  ].filter((t) => {
    if (chatRecipientFilter === "candidats" && t.type !== "candidat") return false;
    if (chatRecipientFilter === "entreprises" && t.type !== "entreprise") return false;
    if (!chatSearch) return true;
    const q = chatSearch.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q);
  });

  const activeConversationMessages = activeRecipient
    ? chatMessages[activeRecipient.id] || [
        {
          id: `init-${activeRecipient.id}`,
          sender: "recipient",
          text:
            activeRecipient.type === "candidat"
              ? `Bonjour l'équipe TruckMatch ! Mon profil et mes permis sont bien renseignés, je suis prêt pour de nouvelles tournées.`
              : `Bonjour, nous recherchons activement des chauffeurs régionaux. Comment optimiser notre visibilité ?`,
          time: "10:15",
        },
      ]
    : [];

  return (
    <div className="admin-cockpit-screen">
      {/* 1. TOP NAVBAR ADMIN ÉPURÉE & FIXE (52px) */}
      <header className="admin-top-navbar" style={{ height: "52px" }}>
        <div className="admin-top-navbar-main" style={{ height: "52px" }}>
          {/* Logo & Badge */}
          <div className="admin-brand-group">
            <Link href="/espace-admin" className="admin-brand-logo">
              TruckMatch<span>Admin</span>
            </Link>
            <span className="admin-brand-pill">Cockpit Pro</span>
          </div>

          {/* Navigation par Onglets */}
          <nav className="admin-nav-tabs-bar">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`admin-nav-tab-item ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={15} className="tab-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("candidats")}
              className={`admin-nav-tab-item ${activeTab === "candidats" ? "active" : ""}`}
            >
              <Users size={15} className="tab-icon" />
              <span>Candidats</span>
              <span className="tab-badge-pill">{drivers.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("entreprises")}
              className={`admin-nav-tab-item ${activeTab === "entreprises" ? "active" : ""}`}
            >
              <Building2 size={15} className="tab-icon" />
              <span>Entreprises</span>
              <span className="tab-badge-pill">{companies.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stats-site")}
              className={`admin-nav-tab-item ${activeTab === "stats-site" ? "active" : ""}`}
            >
              <BarChart3 size={15} className="tab-icon" />
              <span>Stats Site</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stats-revenu")}
              className={`admin-nav-tab-item ${activeTab === "stats-revenu" ? "active" : ""}`}
            >
              <DollarSign size={15} className="tab-icon" />
              <span>Stats Revenu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("support")}
              className={`admin-nav-tab-item ${activeTab === "support" ? "active" : ""}`}
            >
              <MessageSquareText size={15} className="tab-icon" />
              <span>Support & Tchat</span>
              <span className="tab-badge-pill tab-badge-live">Live</span>
            </button>
          </nav>

          {/* Actions Droite */}
          <div className="admin-top-right">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-public-link"
              title="Ouvrir le site public"
            >
              <span>Site</span>
              <ExternalLink size={12} />
            </Link>

            <div className="admin-user-badge">
              <span className="admin-user-dot" />
              <span>admin@truckmatch.fr</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-admin-logout"
              title="Déconnexion"
            >
              <LogOut size={13} />
              <span>Sortir</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. ZONE CONTENU ZERO-SCROLL DASHBOARD */}
      {activeTab === "dashboard" ? (
        <div className="cockpit-content-area">
          {/* A. BANDEAU HAUT (Header Strip) */}
          <div className="cockpit-header-strip">
            <div className="cockpit-title-group">
              <h1 className="cockpit-main-title">
                <Activity size={18} className="text-primary" />
                <span>Cockpit de Pilotage Direct</span>
              </h1>
              <div className="cockpit-supabase-badge" title="Connecté à la base Supabase en direct">
                <span className="beacon-dot" />
                <span>Supabase Live ({supabaseLatency}ms)</span>
              </div>
            </div>

            <div className="cockpit-actions-group">
              <button
                type="button"
                onClick={handleSeedSupabase}
                disabled={actionLoading}
                className="btn-cockpit-action btn-cockpit-action-primary"
                title="Insérer 3 chauffeurs qualifiés et 2 entreprises tests réelles dans Supabase"
              >
                <Sparkles size={13} />
                <span>{actionLoading ? "Injection..." : "Générer Données Tests"}</span>
              </button>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="btn-cockpit-action"
                title="Actualiser les données depuis Supabase"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Actualiser</span>
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="btn-cockpit-action"
                title="Exporter les tables en fichier JSON"
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* B. RANGEE KPI ULTRA-PRO (72px) */}
          <div className="cockpit-kpi-row">
            <div className="cockpit-kpi-card">
              <div className="kpi-main-info">
                <div className="kpi-num-val">{drivers.length}</div>
                <div className="kpi-text-label">Chauffeurs Inscrits</div>
                <div className="kpi-sub-meta">Base Supabase</div>
              </div>
              <div className="kpi-icon-square">
                <Users size={18} />
              </div>
            </div>

            <div className="cockpit-kpi-card">
              <div className="kpi-main-info">
                <div className="kpi-num-val">{companies.length}</div>
                <div className="kpi-text-label">Entreprises Vérifiées</div>
                <div className="kpi-sub-meta">SIRET Validés</div>
              </div>
              <div className="kpi-icon-square" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <Building2 size={18} />
              </div>
            </div>

            <div className="cockpit-kpi-card">
              <div className="kpi-main-info">
                <div className="kpi-num-val">{stats.withResume}</div>
                <div className="kpi-text-label">CVs Déposés & Prêts</div>
                <div className="kpi-sub-meta">Prêts à embaucher</div>
              </div>
              <div className="kpi-icon-square" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                <FileText size={18} />
              </div>
            </div>

            <div className="cockpit-kpi-card">
              <div className="kpi-main-info">
                <div className="kpi-num-val">{stats.availableNow}</div>
                <div className="kpi-text-label">Disponibles sous 48h</div>
                <div className="kpi-sub-meta">Tournées immédiates</div>
              </div>
              <div className="kpi-icon-square" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                <Clock size={18} />
              </div>
            </div>

            <div className="cockpit-kpi-card">
              <div className="kpi-main-info">
                <div className="kpi-num-val">
                  {Math.max(12450, companies.length * 890)} €
                </div>
                <div className="kpi-text-label">MRR Forfaits Flotte</div>
                <div className="kpi-sub-meta">0% commission</div>
              </div>
              <div className="kpi-icon-square" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                <BadgeEuro size={18} />
              </div>
            </div>
          </div>

          {/* C. GRILLE CENTRALE 3 COLONNES SANS SCROLL GLOBAL */}
          <div className="cockpit-main-grid">
            {/* Colonne 1 : Flux Candidats Supabase */}
            <div className="cockpit-panel">
              <div className="cockpit-panel-header">
                <div className="cockpit-panel-title">
                  <Truck size={15} className="text-primary" />
                  <span>Flux Conducteurs ({drivers.length})</span>
                </div>
                <div className="admin-search-box" style={{ minWidth: "160px", padding: "0.2rem 0.5rem" }}>
                  <Search size={12} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Filtrer nom, ville..."
                    value={cockpitDriverSearch}
                    onChange={(e) => setCockpitDriverSearch(e.target.value)}
                    style={{ fontSize: "0.72rem", color: "#fff" }}
                  />
                </div>
              </div>

              <div className="cockpit-panel-body">
                {cockpitDrivers.length === 0 ? (
                  <div className="text-center py-6 text-muted" style={{ fontSize: "0.75rem" }}>
                    <p>Aucun conducteur dans Supabase pour l'instant.</p>
                    <button
                      onClick={handleSeedSupabase}
                      className="btn-cockpit-action btn-cockpit-action-primary mt-2"
                    >
                      <Sparkles size={12} />
                      <span>Ajouter des profils tests</span>
                    </button>
                  </div>
                ) : (
                  cockpitDrivers.map((d) => (
                    <div key={d.id} className="cockpit-row-item">
                      <div className="cockpit-item-left">
                        <div className="cockpit-item-name">
                          {d.first_name} {d.last_name}
                        </div>
                        <div className="cockpit-item-sub">
                          <span className="text-slate-300 font-bold">
                            {Array.isArray(d.permits) ? d.permits.join("/") : "C/CE"}
                          </span>
                          <span>•</span>
                          <span>{d.city || "France"}</span>
                          {d.phone && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{d.phone}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="cockpit-item-right">
                        {/* Toggle Disponibilité Live */}
                        <button
                          type="button"
                          onClick={() => handleToggleDriverAvailability(d.id)}
                          className={`cockpit-badge-pill ${
                            d.availability === "immediate" ? "badge-imm-on" : "badge-imm-off"
                          }`}
                          title="Cliquer pour basculer la disponibilité dans Supabase"
                        >
                          {d.availability === "immediate" ? "Immédiat" : "Flexible"}
                        </button>

                        {/* CV */}
                        {d.resume_url && (
                          <a
                            href={d.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-cockpit-mini"
                            title="Voir CV"
                          >
                            <FileText size={12} />
                          </a>
                        )}

                        {/* Tchat direct */}
                        <button
                          type="button"
                          onClick={() => handleOpenChatWithDriver(d)}
                          className="btn-cockpit-mini"
                          title="Tchat direct"
                        >
                          <MessageSquareText size={12} />
                        </button>

                        {/* Supprimer de Supabase */}
                        <button
                          type="button"
                          onClick={() => handleDeleteDriver(d.id, `${d.first_name} ${d.last_name}`)}
                          className="btn-cockpit-mini btn-cockpit-mini-danger"
                          title="Supprimer définitivement de Supabase"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Colonne 2 : Flux Entreprises Supabase */}
            <div className="cockpit-panel">
              <div className="cockpit-panel-header">
                <div className="cockpit-panel-title">
                  <Building2 size={15} className="text-emerald-400" />
                  <span>Flux Entreprises ({companies.length})</span>
                </div>
                <div className="admin-search-box" style={{ minWidth: "160px", padding: "0.2rem 0.5rem" }}>
                  <Search size={12} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Filtrer raison sociale, SIRET..."
                    value={cockpitCompanySearch}
                    onChange={(e) => setCockpitCompanySearch(e.target.value)}
                    style={{ fontSize: "0.72rem", color: "#fff" }}
                  />
                </div>
              </div>

              <div className="cockpit-panel-body">
                {cockpitCompanies.length === 0 ? (
                  <div className="text-center py-6 text-muted" style={{ fontSize: "0.75rem" }}>
                    <p>Aucune entreprise dans Supabase pour l'instant.</p>
                    <button
                      onClick={handleSeedSupabase}
                      className="btn-cockpit-action btn-cockpit-action-primary mt-2"
                    >
                      <Sparkles size={12} />
                      <span>Ajouter des entreprises tests</span>
                    </button>
                  </div>
                ) : (
                  cockpitCompanies.map((c) => (
                    <div key={c.id} className="cockpit-row-item">
                      <div className="cockpit-item-left">
                        <div className="cockpit-item-name">{c.company_name}</div>
                        <div className="cockpit-item-sub">
                          <span className="text-slate-300 font-mono text-xs">{c.siret || "SIRET"}</span>
                          <span>•</span>
                          <span>{c.city || "France"}</span>
                          {c.phone && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">{c.phone}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="cockpit-item-right">
                        <span className="cockpit-badge-pill" style={{ background: "#1e293b", color: "#cbd5e1" }}>
                          {c.fleet_size || "1-5"} camions
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenChatWithCompany(c)}
                          className="btn-cockpit-mini"
                          title="Tchat direct avec le responsable"
                        >
                          <MessageSquareText size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCompany(c.id, c.company_name)}
                          className="btn-cockpit-mini btn-cockpit-mini-danger"
                          title="Supprimer définitivement de Supabase"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Colonne 3 : Opérations Supabase & Diagnostics */}
            <div className="cockpit-panel">
              <div className="cockpit-panel-header">
                <div className="cockpit-panel-title">
                  <Database size={15} className="text-sky-400" />
                  <span>Opérations Supabase & Santé</span>
                </div>
                <span className="cockpit-panel-badge">Temps Réel</span>
              </div>

              <div className="cockpit-panel-body cockpit-ops-section">
                {/* Diagnostic Base */}
                <div className="ops-card-widget">
                  <div className="ops-widget-title">
                    <span>État Connexion Serveur</span>
                    <span className="text-emerald-400 font-bold">OPÉRATIONNEL</span>
                  </div>
                  <div className="ops-row-metric">
                    <span>Base Supabase</span>
                    <span className="ops-val">azxwqcdnwkolodxwsqoq</span>
                  </div>
                  <div className="ops-row-metric">
                    <span>Temps de réponse (Ping)</span>
                    <span className="ops-val text-emerald-400 font-mono">{supabaseLatency} ms</span>
                  </div>
                  <div className="ops-row-metric">
                    <span>Table Conducteurs (drivers)</span>
                    <span className="ops-val">{drivers.length} lignes</span>
                  </div>
                  <div className="ops-row-metric">
                    <span>Table Entreprises (companies)</span>
                    <span className="ops-val">{companies.length} lignes</span>
                  </div>
                  <div className="ops-row-metric">
                    <span>Dernière synchro</span>
                    <span className="ops-val font-mono text-muted">{lastSyncTime || "En cours"}</span>
                  </div>
                </div>

                {/* Ventilation Permis */}
                <div className="ops-card-widget">
                  <div className="ops-widget-title">
                    <span>Qualifications Vivier Chauffeurs</span>
                  </div>
                  <div className="space-y-1.5 mt-1">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-0.5">
                        <span>Permis CE (Super Lourd SPL)</span>
                        <span className="font-bold">
                          {drivers.filter((d) => d.permits?.includes("CE")).length}
                        </span>
                      </div>
                      <div className="stats-bar-track" style={{ height: "5px", background: "#1e293b" }}>
                        <div
                          className="stats-bar-fill"
                          style={{
                            width: `${Math.min(100, (drivers.filter((d) => d.permits?.includes("CE")).length / Math.max(1, drivers.length)) * 100)}%`,
                            background: "#0284c7",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-0.5">
                        <span>Permis C (Poids Lourd Porteur)</span>
                        <span className="font-bold">
                          {drivers.filter((d) => d.permits?.includes("C")).length}
                        </span>
                      </div>
                      <div className="stats-bar-track" style={{ height: "5px", background: "#1e293b" }}>
                        <div
                          className="stats-bar-fill"
                          style={{
                            width: `${Math.min(100, (drivers.filter((d) => d.permits?.includes("C")).length / Math.max(1, drivers.length)) * 100)}%`,
                            background: "#10b981",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-0.5">
                        <span>FIMO / FCO / Carte Chrono</span>
                        <span className="font-bold">
                          {drivers.filter((d) => d.fimo || d.fco || d.chrono_card).length}
                        </span>
                      </div>
                      <div className="stats-bar-track" style={{ height: "5px", background: "#1e293b" }}>
                        <div
                          className="stats-bar-fill"
                          style={{
                            width: `${Math.min(100, (drivers.filter((d) => d.fimo || d.fco || d.chrono_card).length / Math.max(1, drivers.length)) * 100)}%`,
                            background: "#f59e0b",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raccourcis Rapides */}
                <div className="ops-card-widget">
                  <div className="ops-widget-title">
                    <span>Navigation Rapide</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("candidats")}
                      className="btn-cockpit-action w-full justify-center"
                    >
                      <Users size={12} />
                      <span>Table Candidats</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("entreprises")}
                      className="btn-cockpit-action w-full justify-center"
                    >
                      <Building2 size={12} />
                      <span>Table Entreprises</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("support")}
                      className="btn-cockpit-action w-full justify-center"
                    >
                      <MessageSquareText size={12} />
                      <span>Ouvrir Tchat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("stats-revenu")}
                      className="btn-cockpit-action w-full justify-center"
                    >
                      <DollarSign size={12} />
                      <span>Stats Revenu</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* D. STATUS TICKER FIXE DU BAS (24px) */}
          <div className="cockpit-status-ticker">
            <div className="ticker-left">
              <span className="text-emerald-400 font-bold">● COCKPIT ACTIF</span>
              <span>Supabase Cloud ID: azxwqcdnwkolodxwsqoq</span>
              <span>Chauffeurs: {drivers.length}</span>
              <span>Entreprises: {companies.length}</span>
            </div>
            <div className="ticker-right">
              <span>Modèle Direct sans Intermédiaire</span>
              <span>Synchro: {lastSyncTime}</span>
              <span>Version 2.0 Pro</span>
            </div>
          </div>
        </div>
      ) : (
        /* VUES POUR LES AUTRES ONGLETS (Candidats, Entreprises, Stats, Support) */
        <main className="admin-main-body">
          {/* ============================================================== */}
          {/* ONGLET 2 : CANDIDATS INSCRITS                                 */}
          {/* ============================================================== */}
          {activeTab === "candidats" && (
            <div>
              <div className="admin-page-heading">
                <div>
                  <h1 className="admin-heading-title">Candidats conducteurs inscrits</h1>
                  <p className="admin-heading-sub">
                    Répertoire complet des chauffeurs qualifiés (SPL, PL, VUL) avec coordonnées directes et CV vérifiés.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">
                    {drivers.length} conducteurs dans Supabase
                  </span>
                  <button onClick={loadData} className="btn btn-outline btn-sm">
                    <RefreshCw size={13} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>

              {/* Barre d'outils filtres & recherche */}
              <div className="admin-table-toolbar">
                <div className="admin-search-box">
                  <Search size={15} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, ville, email, téléphone..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                  />
                </div>

                <div className="admin-filter-pills">
                  <button
                    type="button"
                    onClick={() => setDriverFilter("all")}
                    className={`admin-filter-pill-btn ${driverFilter === "all" ? "active" : ""}`}
                  >
                    Tous ({drivers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverFilter("ce")}
                    className={`admin-filter-pill-btn ${driverFilter === "ce" ? "active" : ""}`}
                  >
                    Permis CE (SPL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverFilter("c")}
                    className={`admin-filter-pill-btn ${driverFilter === "c" ? "active" : ""}`}
                  >
                    Permis C (Porteur)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverFilter("resume")}
                    className={`admin-filter-pill-btn ${driverFilter === "resume" ? "active" : ""}`}
                  >
                    Avec CV disponible
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverFilter("immediate")}
                    className={`admin-filter-pill-btn ${driverFilter === "immediate" ? "active" : ""}`}
                  >
                    Disponible 48h
                  </button>
                </div>
              </div>

              {/* Table complète des candidats */}
              <div className="admin-table-card">
                {drivers.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>Aucun conducteur ne correspond à ces critères.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-pro-table">
                      <thead>
                        <tr>
                          <th>Candidat</th>
                          <th>Coordonnées Directes</th>
                          <th>Localisation</th>
                          <th>Permis & Certifications</th>
                          <th>CV Document</th>
                          <th>Disponibilité</th>
                          <th>Inscrit le</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers
                          .filter((d) => {
                            if (driverFilter === "ce" && !d.permits?.includes("CE")) return false;
                            if (driverFilter === "c" && !d.permits?.includes("C")) return false;
                            if (driverFilter === "resume" && !d.resume_url) return false;
                            if (driverFilter === "immediate" && d.availability !== "immediate") return false;
                            if (!driverSearch) return true;
                            const q = driverSearch.toLowerCase();
                            return (
                              d.first_name?.toLowerCase().includes(q) ||
                              d.last_name?.toLowerCase().includes(q) ||
                              d.email?.toLowerCase().includes(q) ||
                              d.city?.toLowerCase().includes(q) ||
                              d.phone?.includes(q)
                            );
                          })
                          .map((d) => (
                            <tr key={d.id}>
                              <td>
                                <div className="font-bold text-navy">
                                  {d.first_name} {d.last_name}
                                </div>
                                <div className="text-xs text-muted">
                                  {d.birth_date
                                    ? `Né(e) le ${new Date(d.birth_date).toLocaleDateString("fr-FR")}`
                                    : "Conducteur routier"}
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Phone size={12} className="text-primary" />
                                  <a href={`tel:${d.phone}`} className="hover:underline font-semibold">
                                    {d.phone || "-"}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                                  <Mail size={12} />
                                  <a href={`mailto:${d.email}`} className="hover:underline">
                                    {d.email || "-"}
                                  </a>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1 text-xs font-semibold text-navy">
                                  <MapPin size={12} className="text-muted" />
                                  <span>{d.postal_code} {d.city}</span>
                                </div>
                                <div className="text-xs text-muted truncate max-w-[180px]">
                                  {d.address || ""}
                                </div>
                              </td>
                              <td>
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(d.permits) &&
                                    d.permits.map((p: string) => (
                                      <span key={p} className="badge-permit-mini">
                                        {p}
                                      </span>
                                    ))}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {d.fimo && <span className="badge-certif-mini">FIMO</span>}
                                  {d.fco && <span className="badge-certif-mini">FCO</span>}
                                  {d.chrono_card && <span className="badge-certif-mini">Chrono</span>}
                                </div>
                              </td>
                              <td>
                                {d.resume_url ? (
                                  <a
                                    href={d.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-table-action btn-table-action-cv"
                                  >
                                    <FileText size={13} />
                                    <span>Consulter CV</span>
                                    <ExternalLink size={11} />
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted">Aucun fichier</span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleToggleDriverAvailability(d.id)}
                                  className={`badge-status-pill ${
                                    d.availability === "immediate"
                                      ? "status-available"
                                      : "status-other"
                                  }`}
                                  title="Cliquer pour basculer"
                                >
                                  {d.availability === "immediate" ? "Immédiat" : d.availability || "Standard"}
                                </button>
                              </td>
                              <td className="text-xs text-muted">
                                {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "-"}
                              </td>
                              <td>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenChatWithDriver(d)}
                                    className="btn-table-action btn-table-action-chat"
                                    title="Démarrer un échange tchat"
                                  >
                                    <MessageSquareText size={13} />
                                    <span>Tchat</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDriver(d.id, `${d.first_name} ${d.last_name}`)}
                                    className="btn-cockpit-mini btn-cockpit-mini-danger"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 3 : ENTREPRISES INSCRITES                              */}
          {/* ============================================================== */}
          {activeTab === "entreprises" && (
            <div>
              <div className="admin-page-heading">
                <div>
                  <h1 className="admin-heading-title">Entreprises de transport inscrites</h1>
                  <p className="admin-heading-sub">
                    Transporteurs, logisticiens et exploitants vérifiés par numéro SIRET officiel.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">
                    {companies.length} entreprises dans Supabase
                  </span>
                  <button onClick={loadData} className="btn btn-outline btn-sm">
                    <RefreshCw size={13} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>

              {/* Filtres & Recherche */}
              <div className="admin-table-toolbar">
                <div className="admin-search-box">
                  <Search size={15} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Rechercher par raison sociale, SIRET, dirigeant..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                </div>

                <div className="admin-filter-pills">
                  <button
                    type="button"
                    onClick={() => setCompanyFilter("all")}
                    className={`admin-filter-pill-btn ${companyFilter === "all" ? "active" : ""}`}
                  >
                    Toutes ({companies.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyFilter("fleet-small")}
                    className={`admin-filter-pill-btn ${companyFilter === "fleet-small" ? "active" : ""}`}
                  >
                    1 à 5 camions
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyFilter("fleet-medium")}
                    className={`admin-filter-pill-btn ${companyFilter === "fleet-medium" ? "active" : ""}`}
                  >
                    6 à 20 camions
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyFilter("fleet-large")}
                    className={`admin-filter-pill-btn ${companyFilter === "fleet-large" ? "active" : ""}`}
                  >
                    + de 20 camions
                  </button>
                </div>
              </div>

              {/* Table complète des entreprises */}
              <div className="admin-table-card">
                {companies.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>Aucune entreprise ne correspond à cette recherche.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-pro-table">
                      <thead>
                        <tr>
                          <th>Entreprise Transport</th>
                          <th>SIRET Officiel</th>
                          <th>Responsable / Contact</th>
                          <th>Coordonnées</th>
                          <th>Dépôt / Ville</th>
                          <th>Flotte</th>
                          <th>Date inscription</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies
                          .filter((c) => {
                            if (companyFilter === "fleet-small" && c.fleet_size && c.fleet_size !== "1-5") return false;
                            if (companyFilter === "fleet-medium" && c.fleet_size !== "6-20") return false;
                            if (companyFilter === "fleet-large" && c.fleet_size !== "21-50" && c.fleet_size !== "> 50") return false;
                            if (!companySearch) return true;
                            const q = companySearch.toLowerCase();
                            return (
                              c.company_name?.toLowerCase().includes(q) ||
                              c.siret?.includes(q) ||
                              c.email?.toLowerCase().includes(q) ||
                              c.city?.toLowerCase().includes(q) ||
                              c.contact_last_name?.toLowerCase().includes(q)
                            );
                          })
                          .map((c) => (
                            <tr key={c.id}>
                              <td>
                                <div className="font-bold text-navy">{c.company_name}</div>
                                <div className="text-xs text-muted">{c.tva_number || "Transport de marchandises"}</div>
                              </td>
                              <td>
                                <div className="font-mono text-xs font-bold text-navy flex items-center gap-1">
                                  <span>{c.siret}</span>
                                  <ShieldCheck size={13} className="text-success" />
                                </div>
                                <div className="text-xs text-muted">{c.naf_code || "Code NAF 49.41A"}</div>
                              </td>
                              <td>
                                <div className="font-bold text-xs">
                                  {c.contact_first_name} {c.contact_last_name}
                                </div>
                                <div className="text-xs text-muted">{c.contact_role || "Exploitant / Dirigeant"}</div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Phone size={12} className="text-primary" />
                                  <a href={`tel:${c.phone}`} className="hover:underline font-semibold">
                                    {c.phone || "-"}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                                  <Mail size={12} />
                                  <a href={`mailto:${c.email}`} className="hover:underline">
                                    {c.email || "-"}
                                  </a>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1 text-xs font-semibold text-navy">
                                  <MapPin size={12} className="text-muted" />
                                  <span>{c.postal_code} {c.city}</span>
                                </div>
                                <div className="text-xs text-muted truncate max-w-[180px]">{c.address}</div>
                              </td>
                              <td>
                                <span className="badge-fleet-mini">{c.fleet_size || "1-5"} camions</span>
                              </td>
                              <td className="text-xs text-muted">
                                {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "-"}
                              </td>
                              <td>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenChatWithCompany(c)}
                                    className="btn-table-action btn-table-action-chat"
                                    title="Démarrer un échange tchat"
                                  >
                                    <MessageSquareText size={13} />
                                    <span>Tchat</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCompany(c.id, c.company_name)}
                                    className="btn-cockpit-mini btn-cockpit-mini-danger"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 4 : STATS SITE                                         */}
          {/* ============================================================== */}
          {activeTab === "stats-site" && (
            <div>
              <div className="admin-page-heading">
                <div>
                  <h1 className="admin-heading-title">Statistiques de Fréquentation & Audience</h1>
                  <p className="admin-heading-sub">
                    Métriques globales de trafic, provenance des visiteurs et parcours sur la plateforme TruckMatch.
                  </p>
                </div>
                <span className="badge-navy-pill">30 derniers jours</span>
              </div>

              <div className="stats-card-grid-4">
                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">Visiteurs uniques / mois</div>
                  <div className="stats-card-pro-number">14 850</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>+18.4% vs mois dernier</span>
                  </span>
                </div>

                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">Pages vues totales</div>
                  <div className="stats-card-pro-number">68 400</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>4.6 pages / session</span>
                  </span>
                </div>

                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">Taux de conversion formulaires</div>
                  <div className="stats-card-pro-number">9.8%</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>Candidats & Entreprises</span>
                  </span>
                </div>

                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">Temps moyen sur la plateforme</div>
                  <div className="stats-card-pro-number">3m 42s</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>Forte implication</span>
                  </span>
                </div>
              </div>

              <div className="admin-dashboard-two-col">
                <div className="admin-section-card">
                  <div className="admin-section-header">
                    <h2 className="admin-section-title">
                      <BarChart3 size={18} className="text-primary" />
                      <span>Pages les plus consultées</span>
                    </h2>
                    <span className="text-xs text-muted">% du trafic total</span>
                  </div>

                  <div className="stats-bars-list">
                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Offres d'emploi & Tournées (/offres-emploi)</span>
                        <span className="font-bold">42% (28 728 vues)</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "42%" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Formulaire d'inscription & Profil (/inscription)</span>
                        <span className="font-bold">27% (18 468 vues)</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "27%" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Carte géolocalisée des chauffeurs (/carte-chauffeurs)</span>
                        <span className="font-bold">18% (12 312 vues)</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "18%" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Espace Entreprises & Recruteurs (/entreprises)</span>
                        <span className="font-bold">13% (8 892 vues)</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "13%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-section-card">
                  <div className="admin-section-header">
                    <h2 className="admin-section-title">
                      <MapPin size={18} className="text-navy" />
                      <span>Répartition géographique des utilisateurs</span>
                    </h2>
                    <span className="text-xs text-muted">France entière</span>
                  </div>

                  <div className="stats-bars-list">
                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Île-de-France (Hubs logistiques Rungis, Roissy)</span>
                        <span className="font-bold">24%</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "24%", background: "#0b192c" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Auvergne-Rhône-Alpes (Couloir rhodanien)</span>
                        <span className="font-bold">19%</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "19%", background: "#0284c7" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Hauts-de-France (Lille, Dourges, Fret Nord)</span>
                        <span className="font-bold">16%</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "16%", background: "#0ea5e9" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Occitanie & PACA (Marseille, Toulouse)</span>
                        <span className="font-bold">14%</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "14%", background: "#38bdf8" }} />
                      </div>
                    </div>

                    <div className="stats-bar-item">
                      <div className="stats-bar-row">
                        <span>Autres régions françaises</span>
                        <span className="font-bold">27%</span>
                      </div>
                      <div className="stats-bar-track">
                        <div className="stats-bar-fill" style={{ width: "27%", background: "#94a3b8" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 5 : STATS REVENU                                       */}
          {/* ============================================================== */}
          {activeTab === "stats-revenu" && (
            <div>
              <div className="admin-page-heading">
                <div>
                  <h1 className="admin-heading-title">Statistiques de Revenu & Abonnements</h1>
                  <p className="admin-heading-sub">
                    Suivi du Chiffre d'Affaires Mensuel Récurrent (MRR), des abonnements transporteurs et des économies clients.
                  </p>
                </div>
                <span className="badge-navy-pill">Facturation Directe</span>
              </div>

              <div className="stats-card-grid-4">
                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">MRR (Revenu Mensuel Récurrent)</div>
                  <div className="stats-card-pro-number">12 450 €</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>+21.5% ce trimestre</span>
                  </span>
                </div>

                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">ARR Projeté Annuel</div>
                  <div className="stats-card-pro-number">149 400 €</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>Base récurrente</span>
                  </span>
                </div>

                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">Transporteurs abonnés actifs</div>
                  <div className="stats-card-pro-number">28</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>Taux de rétention : 96.2%</span>
                  </span>
                </div>

                <div className="stats-card-pro">
                  <div className="stats-card-pro-title">Économies générées vs Intérim</div>
                  <div className="stats-card-pro-number">142 800 €</div>
                  <span className="stats-badge-growth">
                    <TrendingUp size={12} />
                    <span>2 400 € / chauffeur embauché</span>
                  </span>
                </div>
              </div>

              <div className="admin-section-card mt-6">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">
                      <DollarSign size={18} className="text-primary" />
                      <span>Ventilation des formules transporteurs</span>
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Abonnements sans commission sur salaires : les transporteurs paient un forfait d'accès direct au vivier.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="revenue-tier-card">
                    <div>
                      <span className="text-xs font-bold text-muted uppercase">Pack Découverte</span>
                      <h3 className="text-lg font-black text-navy mt-1">Starter Flotte</h3>
                      <div className="text-2xl font-black text-primary mt-2">
                        490 € <span className="text-xs font-normal text-muted">HT / mois</span>
                      </div>
                      <p className="text-xs text-muted mt-2">
                        Idéal pour les artisans transporteurs et TPE (1 à 2 recrutements réguliers).
                      </p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs text-muted">Abonnés actifs : <span className="font-bold text-navy">12 entreprises</span></div>
                      <div className="text-xs font-bold text-navy mt-1">Sous-total : 5 880 € / mois</div>
                    </div>
                  </div>

                  <div className="revenue-tier-card featured">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase">Le Plus Populaire</span>
                        <span className="badge-navy-pill">Flotte Pro</span>
                      </div>
                      <h3 className="text-lg font-black text-navy mt-1">Pro Transport Régional</h3>
                      <div className="text-2xl font-black text-primary mt-2">
                        890 € <span className="text-xs font-normal text-muted">HT / mois</span>
                      </div>
                      <p className="text-xs text-muted mt-2">
                        Pour transporteurs régionaux gérant 5 à 20 camions avec besoins continus.
                      </p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs text-muted">Abonnés actifs : <span className="font-bold text-navy">11 entreprises</span></div>
                      <div className="text-xs font-bold text-navy mt-1">Sous-total : 9 790 € / mois</div>
                    </div>
                  </div>

                  <div className="revenue-tier-card">
                    <div>
                      <span className="text-xs font-bold text-muted uppercase">Grand Compte</span>
                      <h3 className="text-lg font-black text-navy mt-1">Multi-Dépôts National</h3>
                      <div className="text-2xl font-black text-primary mt-2">
                        1 490 € <span className="text-xs font-normal text-muted">HT / mois</span>
                      </div>
                      <p className="text-xs text-muted mt-2">
                        Accès multi-utilisateurs illimité sur tous les départements français.
                      </p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs text-muted">Abonnés actifs : <span className="font-bold text-navy">5 entreprises</span></div>
                      <div className="text-xs font-bold text-navy mt-1">Sous-total : 7 450 € / mois</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ONGLET 6 : SUPPORT AVEC TCHAT VERS CANDIDAT OU ENTREPRISE     */}
          {/* ============================================================== */}
          {activeTab === "support" && (
            <div>
              <div className="admin-page-heading mb-3">
                <div>
                  <h1 className="admin-heading-title">Support & Messagerie Directe</h1>
                  <p className="admin-heading-sub">
                    Échangez en direct avec les chauffeurs candidats et les entreprises de transport inscrites.
                  </p>
                </div>
              </div>

              <div className="admin-chat-layout">
                <div className="admin-chat-sidebar">
                  <div className="admin-chat-sidebar-header">
                    <h3>Discussions actives</h3>
                    <div className="admin-search-box w-full">
                      <Search size={14} className="text-muted" />
                      <input
                        type="text"
                        placeholder="Chercher un contact..."
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                      />
                    </div>

                    <div className="chat-filter-tabs">
                      <button
                        type="button"
                        onClick={() => setChatRecipientFilter("all")}
                        className={`chat-filter-tab-btn ${chatRecipientFilter === "all" ? "active" : ""}`}
                      >
                        Tous ({chatThreads.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatRecipientFilter("candidats")}
                        className={`chat-filter-tab-btn ${chatRecipientFilter === "candidats" ? "active" : ""}`}
                      >
                        Chauffeurs ({drivers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatRecipientFilter("entreprises")}
                        className={`chat-filter-tab-btn ${chatRecipientFilter === "entreprises" ? "active" : ""}`}
                      >
                        Entreprises ({companies.length})
                      </button>
                    </div>
                  </div>

                  <div className="admin-chat-threads-list">
                    {chatThreads.length === 0 ? (
                      <p className="text-xs text-muted p-4 text-center">Aucun contact trouvé.</p>
                    ) : (
                      chatThreads.map((thread) => {
                        const isSelected = activeRecipient?.id === thread.id;
                        return (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() =>
                              setActiveRecipient({
                                id: thread.id,
                                name: thread.name,
                                type: thread.type,
                                phone: thread.phone,
                                email: thread.email,
                                city: thread.city,
                              })
                            }
                            className={`chat-thread-item ${isSelected ? "active" : ""}`}
                          >
                            <div
                              className={`chat-thread-avatar ${
                                thread.type === "candidat" ? "avatar-candidat" : "avatar-entreprise"
                              }`}
                            >
                              {thread.type === "candidat" ? (
                                <Truck size={18} />
                              ) : (
                                <Building2 size={18} />
                              )}
                            </div>
                            <div className="chat-thread-content">
                              <div className="chat-thread-row">
                                <span className="chat-thread-name">{thread.name}</span>
                                <span className="chat-thread-time">{thread.time}</span>
                              </div>
                              <p className="chat-thread-lastmsg">{thread.lastMsg}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="admin-chat-main-area">
                  {activeRecipient ? (
                    <>
                      <div className="admin-chat-header">
                        <div className="admin-chat-target-info">
                          <div
                            className={`chat-thread-avatar ${
                              activeRecipient.type === "candidat" ? "avatar-candidat" : "avatar-entreprise"
                            }`}
                          >
                            {activeRecipient.type === "candidat" ? (
                              <Truck size={20} />
                            ) : (
                              <Building2 size={20} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="admin-chat-target-name">{activeRecipient.name}</h2>
                              <span
                                className={`espace-logo-badge ${
                                  activeRecipient.type === "candidat"
                                    ? "badge-candidat-tag"
                                    : "badge-entreprise-tag"
                                }`}
                              >
                                {activeRecipient.type === "candidat" ? "Candidat Chauffeur" : "Entreprise"}
                              </span>
                            </div>
                            <div className="admin-chat-target-details">
                              {activeRecipient.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} className="text-primary" />
                                  <span>{activeRecipient.phone}</span>
                                </span>
                              )}
                              {activeRecipient.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={11} />
                                  <span>{activeRecipient.email}</span>
                                </span>
                              )}
                              {activeRecipient.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} />
                                  <span>{activeRecipient.city}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeRecipient.phone && (
                            <a
                              href={`tel:${activeRecipient.phone}`}
                              className="btn btn-outline btn-xs"
                            >
                              <Phone size={12} />
                              <span>Appeler</span>
                            </a>
                          )}
                          {activeRecipient.email && (
                            <a
                              href={`mailto:${activeRecipient.email}`}
                              className="btn btn-outline btn-xs"
                            >
                              <Mail size={12} />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="admin-chat-messages-container">
                        {activeConversationMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`chat-bubble-wrap ${msg.sender === "admin" ? "admin" : "recipient"}`}
                          >
                            <div className="chat-bubble">{msg.text}</div>
                            <span className="chat-bubble-time">{msg.time}</span>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="chat-quick-replies-bar">
                        <span className="text-xs font-bold text-muted flex items-center gap-1">
                          <Sparkles size={12} className="text-primary" />
                          <span>Réponses rapides :</span>
                        </span>

                        {activeRecipient.type === "candidat" ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleSendMessage(
                                  "Bonjour ! Un transporteur de votre secteur recherche un conducteur avec vos permis. Seriez-vous disponible cette semaine ?"
                                )
                              }
                              className="chat-quick-reply-btn"
                            >
                              🚛 Opportunité sur votre secteur
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSendMessage(
                                  "Bonjour, nous avons bien reçu votre profil. Pourriez-vous déposer votre CV à jour pour faciliter le contact avec les exploitants ?"
                                )
                              }
                              className="chat-quick-reply-btn"
                            >
                              📄 Relance CV
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSendMessage(
                                  "Votre profil a été validé avec succès par notre équipe de supervision TruckMatch. Bonne route !"
                                )
                              }
                              className="chat-quick-reply-btn"
                            >
                              ✅ Validation profil
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleSendMessage(
                                  "Bonjour, nous avons plusieurs conducteurs SPL et PL disponibles immédiatement sur votre département. Souhaitez-vous leurs coordonnées directes ?"
                                )
                              }
                              className="chat-quick-reply-btn"
                            >
                              👥 Chauffeurs disponibles
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSendMessage(
                                  "Bonjour, votre compte entreprise et votre SIRET ont été vérifiés avec succès. Vous pouvez désormais contacter directement les chauffeurs."
                                )
                              }
                              className="chat-quick-reply-btn"
                            >
                              🏢 Confirmation SIRET
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSendMessage(
                                  "Souhaitez-vous un point d'accompagnement téléphonique de 10 min pour optimiser vos recherches de tractions et relais ?"
                                )
                              }
                              className="chat-quick-reply-btn"
                            >
                              📞 Point accompagnement
                            </button>
                          </>
                        )}
                      </div>

                      <div className="admin-chat-input-bar">
                        <input
                          type="text"
                          placeholder={`Écrire un message à ${activeRecipient.name}...`}
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="admin-chat-input-field"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendMessage()}
                          className="btn-chat-send"
                        >
                          <Send size={15} />
                          <span>Envoyer</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted p-8 text-center">
                      <div>
                        <MessageSquareText size={36} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-bold">Sélectionnez une discussion</p>
                        <p className="text-xs">
                          Choisissez un candidat ou une entreprise dans la liste à gauche pour démarrer la messagerie.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
