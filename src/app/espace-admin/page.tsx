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
  Plus,
  EyeIcon,
  Award,
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

  // Filtres onglet Candidats
  const [driverSearch, setDriverSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState<"all" | "ce" | "c" | "resume" | "immediate" | "adr">("all");

  // Modale création candidat
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
    postal_code: "",
    address: "",
    permits: ["CE", "C"],
    fimo: true,
    fco: true,
    chrono_card: true,
    availability: "immediate",
    experience: "3-5",
    resume_url: "",
  });

  // Modale fiche détaillée candidat
  const [selectedDriverDetail, setSelectedDriverDetail] = useState<any | null>(null);

  // Filtres onglet Entreprises
  const [companySearch, setCompanySearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<"all" | "fleet-small" | "fleet-medium" | "fleet-large">("all");

  // Filtres onglet Stats Site (Trafic Web)
  const [trafficPeriod, setTrafficPeriod] = useState<"today" | "7d" | "30d" | "year">("30d");

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

      // Initialiser destinataire par défaut pour le tchat
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

  // Messages archivés en local
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
        if (selectedDriverDetail?.id === driverId) {
          setSelectedDriverDetail(null);
        }
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

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.first_name || !newDriver.last_name || !newDriver.email || !newDriver.phone) {
      alert("Veuillez remplir au moins le nom, prénom, email et téléphone.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_driver",
          data: {
            ...newDriver,
            email: newDriver.email.trim().toLowerCase(),
            phone: newDriver.phone.replace(/[\s\.\-_]/g, ""),
          },
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création du candidat.");
      setIsAddDriverModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setActionLoading(false);
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

  // Filtrage complet candidats pour l'onglet Candidats
  const filteredCandidates = drivers.filter((d) => {
    if (driverFilter === "ce" && !d.permits?.includes("CE")) return false;
    if (driverFilter === "c" && !d.permits?.includes("C")) return false;
    if (driverFilter === "resume" && !d.resume_url) return false;
    if (driverFilter === "immediate" && d.availability !== "immediate") return false;
    if (driverFilter === "adr" && (!d.adr || d.adr.length === 0)) return false;

    if (!driverSearch) return true;
    const q = driverSearch.toLowerCase();
    return (
      d.first_name?.toLowerCase().includes(q) ||
      d.last_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.phone?.includes(q)
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

  // Discussions tchat
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
      {/* ============================================================== */}
      {/* 1. DEUX ÉTAGES DE NAVIGATION ADMIN                             */}
      {/* ============================================================== */}
      <header className="admin-two-tier-header">
        {/* Étage 1 (Haut) : Titre site + Sortie / Session */}
        <div className="admin-tier-upper">
          <div className="admin-tier-upper-brand">
            <Link href="/espace-admin" className="brand-text">
              TruckMatch<span>Admin</span>
            </Link>
            <span className="admin-brand-pill">Cockpit Pro</span>
          </div>

          <div className="admin-tier-upper-actions">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-public-link"
              title="Ouvrir le site public"
            >
              <span>Site public</span>
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
              <span>Sortie</span>
            </button>
          </div>
        </div>

        {/* Étage 2 (Descendu d'un cran) : Menu des onglets spacieux */}
        <div className="admin-tier-lower">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`admin-tier-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("candidats")}
            className={`admin-tier-nav-item ${activeTab === "candidats" ? "active" : ""}`}
          >
            <Users size={16} />
            <span>Candidats</span>
            <span className="nav-count-badge">{drivers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("entreprises")}
            className={`admin-tier-nav-item ${activeTab === "entreprises" ? "active" : ""}`}
          >
            <Building2 size={16} />
            <span>Entreprises</span>
            <span className="nav-count-badge">{companies.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats-site")}
            className={`admin-tier-nav-item ${activeTab === "stats-site" ? "active" : ""}`}
          >
            <BarChart3 size={16} />
            <span>Stats Site</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats-revenu")}
            className={`admin-tier-nav-item ${activeTab === "stats-revenu" ? "active" : ""}`}
          >
            <DollarSign size={16} />
            <span>Stats Revenu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className={`admin-tier-nav-item ${activeTab === "support" ? "active" : ""}`}
          >
            <MessageSquareText size={16} />
            <span>Support & Tchat</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. RUBRIQUE DASHBOARD (ZERO-SCROLL COCKPIT)                     */}
      {/* ============================================================== */}
      {activeTab === "dashboard" && (
        <div className="cockpit-content-area">
          {/* Header Strip */}
          <div className="cockpit-header-strip">
            <div className="cockpit-title-group">
              <h1 className="cockpit-main-title">
                <Activity size={17} className="text-primary" />
                <span>Cockpit de Supervision & Flux Directs</span>
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

          {/* Rangée KPI Ultra-Pro (72px) */}
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

          {/* Grille Centrale 3 Colonnes */}
          <div className="cockpit-main-grid">
            {/* Colonne 1 : Flux Conducteurs */}
            <div className="cockpit-panel">
              <div className="cockpit-panel-header">
                <div className="cockpit-panel-title">
                  <Truck size={15} className="text-primary" />
                  <span>Flux Conducteurs ({drivers.length})</span>
                </div>
                <div className="admin-search-box" style={{ minWidth: "150px", padding: "0.2rem 0.5rem" }}>
                  <Search size={12} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Filtrer..."
                    value={cockpitDriverSearch}
                    onChange={(e) => setCockpitDriverSearch(e.target.value)}
                    style={{ fontSize: "0.72rem", color: "#fff" }}
                  />
                </div>
              </div>

              <div className="cockpit-panel-body">
                {cockpitDrivers.length === 0 ? (
                  <div className="text-center py-6 text-muted" style={{ fontSize: "0.75rem" }}>
                    <p>Aucun conducteur dans Supabase.</p>
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
                        <button
                          type="button"
                          onClick={() => handleToggleDriverAvailability(d.id)}
                          className={`cockpit-badge-pill ${
                            d.availability === "immediate" ? "badge-imm-on" : "badge-imm-off"
                          }`}
                          title="Basculer disponibilité dans Supabase"
                        >
                          {d.availability === "immediate" ? "Immédiat" : "Flexible"}
                        </button>

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

                        <button
                          type="button"
                          onClick={() => handleOpenChatWithDriver(d)}
                          className="btn-cockpit-mini"
                          title="Tchat direct"
                        >
                          <MessageSquareText size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDriver(d.id, `${d.first_name} ${d.last_name}`)}
                          className="btn-cockpit-mini btn-cockpit-mini-danger"
                          title="Supprimer de Supabase"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Colonne 2 : Flux Entreprises */}
            <div className="cockpit-panel">
              <div className="cockpit-panel-header">
                <div className="cockpit-panel-title">
                  <Building2 size={15} className="text-emerald-400" />
                  <span>Flux Entreprises ({companies.length})</span>
                </div>
                <div className="admin-search-box" style={{ minWidth: "150px", padding: "0.2rem 0.5rem" }}>
                  <Search size={12} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Filtrer..."
                    value={cockpitCompanySearch}
                    onChange={(e) => setCockpitCompanySearch(e.target.value)}
                    style={{ fontSize: "0.72rem", color: "#fff" }}
                  />
                </div>
              </div>

              <div className="cockpit-panel-body">
                {cockpitCompanies.length === 0 ? (
                  <div className="text-center py-6 text-muted" style={{ fontSize: "0.75rem" }}>
                    <p>Aucune entreprise dans Supabase.</p>
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
                          title="Tchat direct"
                        >
                          <MessageSquareText size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCompany(c.id, c.company_name)}
                          className="btn-cockpit-mini btn-cockpit-mini-danger"
                          title="Supprimer de Supabase"
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

          {/* Status Ticker Fixe Bas (24px) */}
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
      )}

      {/* ============================================================== */}
      {/* 3. RUBRIQUE CANDIDATS (ZERO-SCROLL COCKPIT PRO)                */}
      {/* ============================================================== */}
      {activeTab === "candidats" && (
        <div className="candidates-cockpit-view">
          {/* A. Bloc Contrôle Haut : Titre + Recherche + Filtres + Actions */}
          <div className="candidates-header-block">
            {/* Ligne 1 : Titre + Actions */}
            <div className="candidates-header-row-1">
              <div className="candidates-title-wrap">
                <h1 className="candidates-page-title">
                  <Users size={18} className="text-primary" />
                  <span>Vivier Conducteurs Routiers</span>
                </h1>
                <span className="cockpit-panel-badge">{drivers.length} conducteurs certifiés</span>
              </div>

              <div className="candidates-header-actions">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(true)}
                  className="btn-cockpit-action btn-cockpit-action-primary"
                  title="Ajouter un candidat directement dans Supabase"
                >
                  <Plus size={13} />
                  <span>Nouveau Candidat</span>
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="btn-cockpit-action"
                  title="Actualiser Supabase"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {/* Ligne 2 : Recherche sombre + Pilules filtres claires */}
            <div className="candidates-header-row-2">
              <div className="candidates-search-dark">
                <Search size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="Chercher nom, prénom, ville, département, tél..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                />
              </div>

              <div className="candidates-pills-bar">
                <button
                  type="button"
                  onClick={() => setDriverFilter("all")}
                  className={`candidates-filter-pill ${driverFilter === "all" ? "active" : ""}`}
                >
                  Tous ({drivers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDriverFilter("ce")}
                  className={`candidates-filter-pill ${driverFilter === "ce" ? "active" : ""}`}
                >
                  Permis CE (SPL)
                </button>
                <button
                  type="button"
                  onClick={() => setDriverFilter("c")}
                  className={`candidates-filter-pill ${driverFilter === "c" ? "active" : ""}`}
                >
                  Permis C (Porteur)
                </button>
                <button
                  type="button"
                  onClick={() => setDriverFilter("resume")}
                  className={`candidates-filter-pill ${driverFilter === "resume" ? "active" : ""}`}
                >
                  Avec CV ({drivers.filter((d) => d.resume_url).length})
                </button>
                <button
                  type="button"
                  onClick={() => setDriverFilter("immediate")}
                  className={`candidates-filter-pill ${driverFilter === "immediate" ? "active" : ""}`}
                >
                  Immédiat ({drivers.filter((d) => d.availability === "immediate").length})
                </button>
                <button
                  type="button"
                  onClick={() => setDriverFilter("adr")}
                  className={`candidates-filter-pill ${driverFilter === "adr" ? "active" : ""}`}
                >
                  ADR
                </button>
              </div>
            </div>
          </div>

          {/* B. Bandeau KPI Aéré (64px) */}
          <div className="candidates-kpis-strip">
            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Total Candidats</div>
                <div className="candidates-kpi-val">{drivers.length}</div>
              </div>
              <Users size={18} className="text-primary" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Permis CE (SPL)</div>
                <div className="candidates-kpi-val">
                  {drivers.filter((d) => d.permits?.includes("CE")).length}
                </div>
              </div>
              <Truck size={18} className="text-sky-400" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Permis C (Porteur)</div>
                <div className="candidates-kpi-val">
                  {drivers.filter((d) => d.permits?.includes("C")).length}
                </div>
              </div>
              <Truck size={18} className="text-emerald-400" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">CVs Déposés</div>
                <div className="candidates-kpi-val">
                  {drivers.filter((d) => d.resume_url).length}
                </div>
              </div>
              <FileText size={18} className="text-amber-400" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Dispo Immédiate</div>
                <div className="candidates-kpi-val">
                  {drivers.filter((d) => d.availability === "immediate").length}
                </div>
              </div>
              <Clock size={18} className="text-purple-400" />
            </div>
          </div>

          {/* C. Table Complète Sombre Haute Précision */}
          <div className="candidates-table-container">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Users size={32} className="mx-auto mb-2 text-slate-500 opacity-50" />
                <p className="font-bold text-sm">Aucun conducteur ne correspond aux filtres.</p>
                <button
                  onClick={() => setIsAddDriverModalOpen(true)}
                  className="btn-cockpit-action btn-cockpit-action-primary mt-2"
                >
                  <Plus size={13} />
                  <span>Créer un conducteur</span>
                </button>
              </div>
            ) : (
              <table className="candidates-table-dark">
                <thead>
                  <tr>
                    <th>Conducteur</th>
                    <th>Coordonnées</th>
                    <th>Localisation</th>
                    <th>Permis & Titres</th>
                    <th>CV Document</th>
                    <th>Disponibilité</th>
                    <th>Inscrit le</th>
                    <th style={{ textAlign: "right" }}>Actions Supabase</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="font-bold text-white text-sm tracking-tight mb-1">
                          {d.first_name} {d.last_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {d.birth_date
                            ? `Né(e) le ${new Date(d.birth_date).toLocaleDateString("fr-FR")}`
                            : "Conducteur Routier"}
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
                        <div className="text-xs text-slate-400 truncate max-w-[170px]">{d.address || "Adresse non renseignée"}</div>
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
                          {d.fimo && <span className="cockpit-badge-pill" style={{ background: "#064e3b", color: "#34d399", border: "1px solid #059669" }}>FIMO</span>}
                          {d.fco && <span className="cockpit-badge-pill" style={{ background: "#0c4a6e", color: "#38bdf8", border: "1px solid #0284c7" }}>FCO</span>}
                          {d.chrono_card && <span className="cockpit-badge-pill" style={{ background: "#451a03", color: "#fbbf24", border: "1px solid #d97706" }}>Chrono</span>}
                          {Array.isArray(d.adr) && d.adr.length > 0 && (
                            <span className="cockpit-badge-pill" style={{ background: "#7c2d12", color: "#fdba74", border: "1px solid #ea580c" }}>ADR</span>
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
                        <button
                          type="button"
                          onClick={() => handleToggleDriverAvailability(d.id)}
                          className={`cockpit-badge-pill ${
                            d.availability === "immediate" ? "badge-imm-on" : "badge-imm-off"
                          }`}
                          style={{ padding: "0.35rem 0.75rem", borderRadius: "8px", cursor: "pointer" }}
                          title="Cliquer pour basculer la disponibilité dans Supabase"
                        >
                          {d.availability === "immediate" ? "● Immédiat" : "○ Flexible"}
                        </button>
                      </td>
                      <td className="text-xs text-slate-400">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDriverDetail(d)}
                            className="btn-cockpit-mini"
                            title="Voir le dossier complet"
                          >
                            <EyeIcon size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenChatWithDriver(d)}
                            className="btn-cockpit-mini"
                            title="Ouvrir le tchat direct"
                          >
                            <MessageSquareText size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDriver(d.id, `${d.first_name} ${d.last_name}`)}
                            className="btn-cockpit-mini btn-cockpit-mini-danger"
                            title="Supprimer définitivement de Supabase"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* D. Status Ticker Fixe Bas (24px) */}
          <div className="cockpit-status-ticker">
            <div className="ticker-left">
              <span className="text-emerald-400 font-bold">● MODULE CANDIDATS</span>
              <span>{filteredCandidates.length} affichés sur {drivers.length}</span>
              <span>Base Supabase Synchronisée</span>
            </div>
            <div className="ticker-right">
              <span>Clic sur disponibilité = Sauvegarde instantanée</span>
              <span>Latence: {supabaseLatency}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODALE AJOUT CONDUCTEUR DANS SUPABASE                        */}
      {/* ============================================================== */}
      {isAddDriverModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddDriverModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                <h3 className="font-bold text-white text-base">Ajouter un Conducteur dans Supabase</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDriverModalOpen(false)}
                className="btn-cockpit-mini"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateDriver}>
              <div className="admin-modal-body">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={newDriver.first_name}
                      onChange={(e) => setNewDriver({ ...newDriver, first_name: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Nom *</label>
                    <input
                      type="text"
                      required
                      value={newDriver.last_name}
                      onChange={(e) => setNewDriver({ ...newDriver, last_name: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Email *</label>
                    <input
                      type="email"
                      required
                      value={newDriver.email}
                      onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Téléphone (10 chiffres) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0612345678"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Ville</label>
                    <input
                      type="text"
                      value={newDriver.city}
                      onChange={(e) => setNewDriver({ ...newDriver, city: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Code Postal</label>
                    <input
                      type="text"
                      value={newDriver.postal_code}
                      onChange={(e) => setNewDriver({ ...newDriver, postal_code: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1 font-bold">Permis</label>
                  <div className="flex gap-3">
                    {["CE", "C", "B"].map((p) => (
                      <label key={p} className="flex items-center gap-1.5 text-xs text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newDriver.permits.includes(p)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewDriver({ ...newDriver, permits: [...newDriver.permits, p] });
                            } else {
                              setNewDriver({ ...newDriver, permits: newDriver.permits.filter((x) => x !== p) });
                            }
                          }}
                        />
                        <span>Permis {p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1 font-bold">Disponibilité</label>
                  <select
                    value={newDriver.availability}
                    onChange={(e) => setNewDriver({ ...newDriver, availability: e.target.value })}
                    className="admin-chat-input-field w-full"
                    style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                  >
                    <option value="immediate">Disponible sous 48h (Immédiat)</option>
                    <option value="flexible">Sous 15 jours à 1 mois (Flexible)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="btn-cockpit-action"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-cockpit-action btn-cockpit-action-primary"
                >
                  <Plus size={13} />
                  <span>{actionLoading ? "Création..." : "Enregistrer dans Supabase"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODALE FICHE DOSSIER COMPLET DU CANDIDAT                    */}
      {/* ============================================================== */}
      {selectedDriverDetail && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedDriverDetail(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                <h3 className="font-bold text-white text-base">
                  Fiche Complète : {selectedDriverDetail.first_name} {selectedDriverDetail.last_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriverDetail(null)}
                className="btn-cockpit-mini"
              >
                <X size={14} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="grid grid-cols-2 gap-3">
                <div className="ops-card-widget">
                  <div className="ops-widget-title">État Civil & Contact</div>
                  <div className="ops-row-metric"><span>Email :</span><span className="ops-val">{selectedDriverDetail.email}</span></div>
                  <div className="ops-row-metric"><span>Téléphone :</span><span className="ops-val text-primary">{selectedDriverDetail.phone}</span></div>
                  <div className="ops-row-metric"><span>Date de naissance :</span><span className="ops-val">{selectedDriverDetail.birth_date || "Non renseignée"}</span></div>
                  <div className="ops-row-metric"><span>Adresse :</span><span className="ops-val">{selectedDriverDetail.address || "-"}</span></div>
                  <div className="ops-row-metric"><span>Ville / CP :</span><span className="ops-val">{selectedDriverDetail.postal_code} {selectedDriverDetail.city}</span></div>
                </div>

                <div className="ops-card-widget">
                  <div className="ops-widget-title">Qualifications & Titres</div>
                  <div className="ops-row-metric"><span>Permis obtenus :</span><span className="ops-val">{Array.isArray(selectedDriverDetail.permits) ? selectedDriverDetail.permits.join(", ") : "-"}</span></div>
                  <div className="ops-row-metric"><span>FIMO à jour :</span><span className="ops-val">{selectedDriverDetail.fimo ? "Oui" : "Non"}</span></div>
                  <div className="ops-row-metric"><span>FCO à jour :</span><span className="ops-val">{selectedDriverDetail.fco ? "Oui" : "Non"}</span></div>
                  <div className="ops-row-metric"><span>Carte conducteur :</span><span className="ops-val">{selectedDriverDetail.chrono_card ? "Oui" : "Non"}</span></div>
                  <div className="ops-row-metric"><span>ADR Matières Dangereuses :</span><span className="ops-val">{Array.isArray(selectedDriverDetail.adr) && selectedDriverDetail.adr.length > 0 ? selectedDriverDetail.adr.join(", ") : "Aucune"}</span></div>
                  <div className="ops-row-metric"><span>CACES :</span><span className="ops-val">{Array.isArray(selectedDriverDetail.caces) && selectedDriverDetail.caces.length > 0 ? selectedDriverDetail.caces.join(", ") : "Aucun"}</span></div>
                </div>
              </div>

              <div className="ops-card-widget">
                <div className="ops-widget-title">Préférences de Tournées & Expérience</div>
                <div className="ops-row-metric"><span>Années d'expérience :</span><span className="ops-val">{selectedDriverDetail.experience || "Non précisée"}</span></div>
                <div className="ops-row-metric"><span>Disponibilité :</span><span className="ops-val text-emerald-400">{selectedDriverDetail.availability === "immediate" ? "Immédiat sous 48h" : "Flexible"}</span></div>
                <div className="ops-row-metric"><span>Types de missions :</span><span className="ops-val">{Array.isArray(selectedDriverDetail.mission_type) ? selectedDriverDetail.mission_type.join(", ") : "Toutes"}</span></div>
                <div className="ops-row-metric"><span>Spécialités :</span><span className="ops-val">{Array.isArray(selectedDriverDetail.specialties) ? selectedDriverDetail.specialties.join(", ") : "-"}</span></div>
              </div>
            </div>

            <div className="admin-modal-footer">
              {selectedDriverDetail.resume_url && (
                <a
                  href={selectedDriverDetail.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cockpit-action"
                >
                  <FileText size={13} />
                  <span>Consulter CV PDF</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  handleOpenChatWithDriver(selectedDriverDetail);
                  setSelectedDriverDetail(null);
                }}
                className="btn-cockpit-action btn-cockpit-action-primary"
              >
                <MessageSquareText size={13} />
                <span>Ouvrir Tchat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. AUTRES RUBRIQUES (Entreprises, Stats, Support)              */}
      {/* ============================================================== */}
      {/* 4. RUBRIQUE ENTREPRISES (ZERO-SCROLL COCKPIT PRO)              */}
      {/* ============================================================== */}
      {activeTab === "entreprises" && (
        <div className="companies-cockpit-view">
          {/* A. Bloc Contrôle Haut : Titre + Actions (Ligne 1) & Recherche + Filtres (Ligne 2) */}
          <div className="candidates-header-block">
            {/* Ligne 1 : Titre + Actions */}
            <div className="candidates-header-row-1">
              <div className="candidates-title-wrap">
                <h1 className="candidates-page-title">
                  <Building2 size={18} className="text-primary" />
                  <span>Entreprises & Transporteurs Vérifiés</span>
                </h1>
                <span className="cockpit-panel-badge">
                  ● Supabase Live : {companies.length} sociétés actives
                </span>
              </div>

              <div className="candidates-header-actions">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="btn-cockpit-action"
                  title="Exporter les données Supabase"
                >
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="btn-cockpit-action"
                  title="Actualiser Supabase"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {/* Ligne 2 : Recherche sombre + Pilules filtres claires */}
            <div className="candidates-header-row-2">
              <div className="candidates-search-dark">
                <Search size={14} className="text-muted" />
                <input
                  type="text"
                  placeholder="Rechercher par raison sociale, SIRET, dirigeant, ville, tél..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>

              <div className="candidates-pills-bar">
                <button
                  type="button"
                  onClick={() => setCompanyFilter("all")}
                  className={`candidates-filter-pill ${companyFilter === "all" ? "active" : ""}`}
                >
                  Toutes ({companies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyFilter("fleet-small")}
                  className={`candidates-filter-pill ${companyFilter === "fleet-small" ? "active" : ""}`}
                >
                  1 à 5 camions
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyFilter("fleet-medium")}
                  className={`candidates-filter-pill ${companyFilter === "fleet-medium" ? "active" : ""}`}
                >
                  6 à 20 camions
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyFilter("fleet-large")}
                  className={`candidates-filter-pill ${companyFilter === "fleet-large" ? "active" : ""}`}
                >
                  + de 20 camions
                </button>
              </div>
            </div>
          </div>

          {/* B. Bandeau KPI Aéré (68px) */}
          <div className="candidates-kpis-strip">
            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Total Sociétés</div>
                <div className="candidates-kpi-val">{companies.length}</div>
              </div>
              <Building2 size={18} className="text-primary" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Flotte 1 - 5 Véhicules</div>
                <div className="candidates-kpi-val">
                  {companies.filter((c) => !c.fleet_size || c.fleet_size === "1-5").length}
                </div>
              </div>
              <Truck size={18} className="text-sky-400" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Flotte 6 - 20 Véhicules</div>
                <div className="candidates-kpi-val">
                  {companies.filter((c) => c.fleet_size === "6-20").length}
                </div>
              </div>
              <Truck size={18} className="text-emerald-400" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">Flotte &gt; 20 Véhicules</div>
                <div className="candidates-kpi-val">
                  {companies.filter((c) => c.fleet_size === "21-50" || c.fleet_size === "> 50").length}
                </div>
              </div>
              <Truck size={18} className="text-amber-400" />
            </div>

            <div className="candidates-kpi-item">
              <div>
                <div className="candidates-kpi-lbl">SIRET Vérifiés</div>
                <div className="candidates-kpi-val">
                  {companies.filter((c) => c.siret).length}
                </div>
              </div>
              <ShieldCheck size={18} className="text-emerald-400" />
            </div>
          </div>

          {/* C. Table Complète Sombre Haute Précision */}
          <div className="candidates-table-container">
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
              }).length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Building2 size={36} className="mx-auto mb-2 text-slate-600 opacity-60" />
                <p className="font-bold text-sm text-white">Aucune entreprise ne correspond à cette recherche.</p>
              </div>
            ) : (
              <table className="candidates-table-dark">
                <thead>
                  <tr>
                    <th>Entreprise Transport</th>
                    <th>SIRET Officiel</th>
                    <th>Responsable / Contact</th>
                    <th>Coordonnées</th>
                    <th>Dépôt / Ville</th>
                    <th>Flotte</th>
                    <th>Date Inscription</th>
                    <th style={{ textAlign: "right" }}>Actions Supabase</th>
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
                          <div className="font-bold text-white text-sm tracking-tight mb-1">
                            {c.company_name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {c.tva_number || "Transport de marchandises routier"}
                          </div>
                        </td>
                        <td>
                          <div className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1 mb-1">
                            <span>{c.siret}</span>
                            <ShieldCheck size={13} className="text-emerald-400" />
                          </div>
                          <div className="text-xs text-slate-400">{c.naf_code || "Code NAF 49.41A"}</div>
                        </td>
                        <td>
                          <div className="font-bold text-xs text-white mb-1">
                            {c.contact_first_name} {c.contact_last_name}
                          </div>
                          <div className="text-xs text-slate-400">{c.contact_role || "Exploitant / Dirigeant"}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs mb-1">
                            <Phone size={12} className="text-sky-400 shrink-0" />
                            <a href={`tel:${c.phone}`} className="hover:underline font-semibold text-white">
                              {c.phone || "-"}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <a href={`mailto:${c.email}`} className="hover:underline hover:text-white truncate max-w-[170px]">
                              {c.email || "-"}
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-xs font-semibold text-white mb-1">
                            <MapPin size={12} className="text-sky-400 shrink-0" />
                            <span>{c.postal_code} {c.city}</span>
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[170px]">{c.address || "Dépôt principal"}</div>
                        </td>
                        <td>
                          <span
                            className="cockpit-badge-pill"
                            style={{ background: "#0c4a6e", color: "#38bdf8", border: "1px solid #0284c7" }}
                          >
                            {c.fleet_size || "1-5"} camions
                          </span>
                        </td>
                        <td className="text-xs text-slate-400">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "-"}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenChatWithCompany(c)}
                              className="btn-cockpit-action btn-cockpit-action-primary"
                              style={{ fontSize: "0.74rem", padding: "0.3rem 0.65rem", borderRadius: "7px" }}
                              title="Démarrer un échange tchat"
                            >
                              <MessageSquareText size={12} />
                              <span>Tchat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(c.id, c.company_name)}
                              className="btn-cockpit-mini btn-cockpit-mini-danger"
                              title="Supprimer définitivement de Supabase"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          {/* D. Status Ticker Fixe Bas (24px) */}
          <div className="admin-ticker-bar">
            <div className="ticker-left">
              <span className="text-emerald-400 font-bold">● MODULE ENTREPRISES CONNECTÉ</span>
              <span>•</span>
              <span>{companies.length} transporteurs officiels vérifiés</span>
            </div>
            <div className="ticker-right">
              <span>Latence : {supabaseLatency}ms</span>
              <span>•</span>
              <span>Supabase Direct Sync</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. RUBRIQUE STATS SITE (ANALYTICS TRAFIC WEB ZERO-SCROLL)      */}
      {/* ============================================================== */}
      {activeTab === "stats-site" && (() => {
        // Données complètes de fréquentation et trafic web selon la période
        const analyticsPeriodsData: Record<string, {
          periodTitle: string;
          visits: number;
          visitsGrowth: string;
          uniqueVisitors: number;
          pageViews: number;
          bounceRate: string;
          avgDuration: string;
          pages: { path: string; name: string; views: number; pct: number; color: string }[];
          sources: { name: string; detail: string; count: number; pct: number; color: string }[];
          countries: { flag: string; name: string; views: number; pct: number }[];
          regions: { name: string; pct: number; color: string }[];
          devices: { icon: string; name: string; pct: number; color: string }[];
        }> = {
          today: {
            periodTitle: "Aujourd'hui",
            visits: 1840,
            visitsGrowth: "+14.2% vs hier",
            uniqueVisitors: 1290,
            pageViews: 5520,
            bounceRate: "27.2%",
            avgDuration: "3m 52s",
            pages: [
              { path: "/offres-emploi", name: "Offres d'emploi & Tournées", views: 1480, pct: 26.8, color: "#0284c7" },
              { path: "/", name: "Accueil & Recherche rapide", views: 1240, pct: 22.5, color: "#0ea5e9" },
              { path: "/carte-chauffeurs", name: "Carte interactive des chauffeurs", views: 1080, pct: 19.6, color: "#10b981" },
              { path: "/inscription", name: "Inscription Chauffeur & Recruteur", views: 720, pct: 13.0, color: "#38bdf8" },
              { path: "/conseils", name: "Guides & Fiches Métiers Routiers", views: 550, pct: 10.0, color: "#f59e0b" },
              { path: "/espace-entreprise", name: "Portail Recruteur & Dépôts", views: 280, pct: 5.1, color: "#6366f1" },
              { path: "/contact", name: "Support & Contact Plateforme", views: 170, pct: 3.0, color: "#ec4899" },
            ],
            sources: [
              { name: "Google Search (SEO Organique)", detail: "Requêtes : 'recrutement chauffeur spl', 'emploi porteur pl'", count: 994, pct: 54, color: "#0284c7" },
              { name: "Trafic Direct (URL & Favoris)", detail: "Chauffeurs et exploitants habitués", count: 405, pct: 22, color: "#10b981" },
              { name: "Réseaux Sociaux (LinkedIn, Facebook)", detail: "Groupes de routiers & transporteurs", count: 258, pct: 14, color: "#6366f1" },
              { name: "Sites Référents (France Travail, JobTransport)", detail: "Partenaires emploi & syndicats", count: 129, pct: 7, color: "#f59e0b" },
              { name: "Campagnes & Liens Partagés", detail: "Partages directs et messageries", count: 54, pct: 3, color: "#ec4899" },
            ],
            countries: [
              { flag: "🇫🇷", name: "France", views: 1604, pct: 87.2 },
              { flag: "🇧🇪", name: "Belgique", views: 94, pct: 5.1 },
              { flag: "🇨🇭", name: "Suisse", views: 63, pct: 3.4 },
              { flag: "🇱🇺", name: "Luxembourg", views: 39, pct: 2.1 },
              { flag: "🇪🇸", name: "Espagne", views: 24, pct: 1.3 },
              { flag: "🌍", name: "Autres pays", views: 16, pct: 0.9 },
            ],
            regions: [
              { name: "Île-de-France (Hubs Paris, Rungis, Roissy)", pct: 28, color: "#0284c7" },
              { name: "Auvergne-Rhône-Alpes (Lyon, Corbas, St-Quentin)", pct: 21, color: "#0ea5e9" },
              { name: "Hauts-de-France (Lille, Dourges, Fret Nord)", pct: 17, color: "#10b981" },
              { name: "Pays de la Loire & Bretagne (Nantes, Rennes)", pct: 14, color: "#38bdf8" },
              { name: "PACA & Occitanie (Marseille, Toulouse)", pct: 12, color: "#f59e0b" },
              { name: "Autres régions françaises", pct: 8, color: "#64748b" },
            ],
            devices: [
              { icon: "📱", name: "Mobiles (Smartphones chauffeurs)", pct: 69, color: "#0284c7" },
              { icon: "💻", name: "Ordinateurs Desktop (Bureaux & Exploitants)", pct: 27, color: "#10b981" },
              { icon: "📟", name: "Tablettes (Dépôts & Cabines)", pct: 4, color: "#f59e0b" },
            ],
          },
          "7d": {
            periodTitle: "7 derniers jours",
            visits: 12450,
            visitsGrowth: "+16.8% vs sem. dernière",
            uniqueVisitors: 8640,
            pageViews: 37350,
            bounceRate: "28.1%",
            avgDuration: "3m 46s",
            pages: [
              { path: "/offres-emploi", name: "Offres d'emploi & Tournées", views: 10080, pct: 27.0, color: "#0284c7" },
              { path: "/", name: "Accueil & Recherche rapide", views: 8390, pct: 22.5, color: "#0ea5e9" },
              { path: "/carte-chauffeurs", name: "Carte interactive des chauffeurs", views: 7280, pct: 19.5, color: "#10b981" },
              { path: "/inscription", name: "Inscription Chauffeur & Recruteur", views: 4860, pct: 13.0, color: "#38bdf8" },
              { path: "/conseils", name: "Guides & Fiches Métiers Routiers", views: 3690, pct: 9.9, color: "#f59e0b" },
              { path: "/espace-entreprise", name: "Portail Recruteur & Dépôts", views: 1910, pct: 5.1, color: "#6366f1" },
              { path: "/contact", name: "Support & Contact Plateforme", views: 1140, pct: 3.0, color: "#ec4899" },
            ],
            sources: [
              { name: "Google Search (SEO Organique)", detail: "Recherche naturelle 'chauffeur routier cdi'", count: 6723, pct: 54, color: "#0284c7" },
              { name: "Trafic Direct (URL & Favoris)", detail: "Accès directs et bookmarks enregistrés", count: 2739, pct: 22, color: "#10b981" },
              { name: "Réseaux Sociaux (LinkedIn, Facebook)", detail: "Partages sur groupes spécialisés transport", count: 1743, pct: 14, color: "#6366f1" },
              { name: "Sites Référents (France Travail, JobTransport)", detail: "Partenariats et annonces croisées", count: 871, pct: 7, color: "#f59e0b" },
              { name: "Campagnes & Liens Partagés", detail: "Campagnes de référencement ciblé", count: 374, pct: 3, color: "#ec4899" },
            ],
            countries: [
              { flag: "🇫🇷", name: "France", views: 10856, pct: 87.2 },
              { flag: "🇧🇪", name: "Belgique", views: 635, pct: 5.1 },
              { flag: "🇨🇭", name: "Suisse", views: 423, pct: 3.4 },
              { flag: "🇱🇺", name: "Luxembourg", views: 261, pct: 2.1 },
              { flag: "🇪🇸", name: "Espagne", views: 162, pct: 1.3 },
              { flag: "🌍", name: "Autres pays", views: 113, pct: 0.9 },
            ],
            regions: [
              { name: "Île-de-France (Hubs Paris, Rungis, Roissy)", pct: 28, color: "#0284c7" },
              { name: "Auvergne-Rhône-Alpes (Lyon, Corbas, St-Quentin)", pct: 21, color: "#0ea5e9" },
              { name: "Hauts-de-France (Lille, Dourges, Fret Nord)", pct: 17, color: "#10b981" },
              { name: "Pays de la Loire & Bretagne (Nantes, Rennes)", pct: 14, color: "#38bdf8" },
              { name: "PACA & Occitanie (Marseille, Toulouse)", pct: 12, color: "#f59e0b" },
              { name: "Autres régions françaises", pct: 8, color: "#64748b" },
            ],
            devices: [
              { icon: "📱", name: "Mobiles (Smartphones chauffeurs)", pct: 69, color: "#0284c7" },
              { icon: "💻", name: "Ordinateurs Desktop (Bureaux & Exploitants)", pct: 27, color: "#10b981" },
              { icon: "📟", name: "Tablettes (Dépôts & Cabines)", pct: 4, color: "#f59e0b" },
            ],
          },
          "30d": {
            periodTitle: "30 derniers jours",
            visits: 48250,
            visitsGrowth: "+22.4% vs mois dernier",
            uniqueVisitors: 31820,
            pageViews: 142890,
            bounceRate: "27.8%",
            avgDuration: "3m 48s",
            pages: [
              { path: "/offres-emploi", name: "Offres d'emploi & Tournées", views: 38580, pct: 27.0, color: "#0284c7" },
              { path: "/", name: "Accueil & Recherche rapide", views: 32150, pct: 22.5, color: "#0ea5e9" },
              { path: "/carte-chauffeurs", name: "Carte interactive des chauffeurs", views: 27860, pct: 19.5, color: "#10b981" },
              { path: "/inscription", name: "Inscription Chauffeur & Recruteur", views: 18570, pct: 13.0, color: "#38bdf8" },
              { path: "/conseils", name: "Guides & Fiches Métiers Routiers", views: 14140, pct: 9.9, color: "#f59e0b" },
              { path: "/espace-entreprise", name: "Portail Recruteur & Dépôts", views: 7290, pct: 5.1, color: "#6366f1" },
              { path: "/contact", name: "Support & Contact Plateforme", views: 4300, pct: 3.0, color: "#ec4899" },
            ],
            sources: [
              { name: "Google Search (SEO Organique)", detail: "54% de l'audience totale entrante", count: 26055, pct: 54, color: "#0284c7" },
              { name: "Trafic Direct (URL & Favoris)", detail: "Visiteurs récurrents & marques-pages", count: 10615, pct: 22, color: "#10b981" },
              { name: "Réseaux Sociaux (LinkedIn, Facebook)", detail: "Communautés Facebook Routiers & LinkedIn", count: 6755, pct: 14, color: "#6366f1" },
              { name: "Sites Référents (France Travail, JobTransport)", detail: "Plateformes officielles & annuaires", count: 3377, pct: 7, color: "#f59e0b" },
              { name: "Campagnes & Liens Partagés", detail: "Partages exploitants & emailing", count: 1448, pct: 3, color: "#ec4899" },
            ],
            countries: [
              { flag: "🇫🇷", name: "France", views: 42074, pct: 87.2 },
              { flag: "🇧🇪", name: "Belgique", views: 2460, pct: 5.1 },
              { flag: "🇨🇭", name: "Suisse", views: 1640, pct: 3.4 },
              { flag: "🇱🇺", name: "Luxembourg", views: 1013, pct: 2.1 },
              { flag: "🇪🇸", name: "Espagne", views: 627, pct: 1.3 },
              { flag: "🌍", name: "Autres pays", views: 436, pct: 0.9 },
            ],
            regions: [
              { name: "Île-de-France (Hubs Paris, Rungis, Roissy)", pct: 28, color: "#0284c7" },
              { name: "Auvergne-Rhône-Alpes (Lyon, Corbas, St-Quentin)", pct: 21, color: "#0ea5e9" },
              { name: "Hauts-de-France (Lille, Dourges, Fret Nord)", pct: 17, color: "#10b981" },
              { name: "Pays de la Loire & Bretagne (Nantes, Rennes)", pct: 14, color: "#38bdf8" },
              { name: "PACA & Occitanie (Marseille, Toulouse)", pct: 12, color: "#f59e0b" },
              { name: "Autres régions françaises", pct: 8, color: "#64748b" },
            ],
            devices: [
              { icon: "📱", name: "Mobiles (Smartphones chauffeurs)", pct: 69, color: "#0284c7" },
              { icon: "💻", name: "Ordinateurs Desktop (Bureaux & Exploitants)", pct: 27, color: "#10b981" },
              { icon: "📟", name: "Tablettes (Dépôts & Cabines)", pct: 4, color: "#f59e0b" },
            ],
          },
          year: {
            periodTitle: "Cette année (2026)",
            visits: 542000,
            visitsGrowth: "+34.1% vs 2025",
            uniqueVisitors: 365000,
            pageViews: 1626000,
            bounceRate: "28.5%",
            avgDuration: "3m 44s",
            pages: [
              { path: "/offres-emploi", name: "Offres d'emploi & Tournées", views: 439000, pct: 27.0, color: "#0284c7" },
              { path: "/", name: "Accueil & Recherche rapide", views: 365850, pct: 22.5, color: "#0ea5e9" },
              { path: "/carte-chauffeurs", name: "Carte interactive des chauffeurs", views: 317070, pct: 19.5, color: "#10b981" },
              { path: "/inscription", name: "Inscription Chauffeur & Recruteur", views: 211380, pct: 13.0, color: "#38bdf8" },
              { path: "/conseils", name: "Guides & Fiches Métiers Routiers", views: 160970, pct: 9.9, color: "#f59e0b" },
              { path: "/espace-entreprise", name: "Portail Recruteur & Dépôts", views: 82920, pct: 5.1, color: "#6366f1" },
              { path: "/contact", name: "Support & Contact Plateforme", views: 48810, pct: 3.0, color: "#ec4899" },
            ],
            sources: [
              { name: "Google Search (SEO Organique)", detail: "Moteur de croissance principal", count: 292680, pct: 54, color: "#0284c7" },
              { name: "Trafic Direct (URL & Favoris)", detail: "Fidélisation de la communauté transport", count: 119240, pct: 22, color: "#10b981" },
              { name: "Réseaux Sociaux (LinkedIn, Facebook)", detail: "Viralité des publications & annonces", count: 75880, pct: 14, color: "#6366f1" },
              { name: "Sites Référents (France Travail, JobTransport)", detail: "Écosystème logistique français", count: 37940, pct: 7, color: "#f59e0b" },
              { name: "Campagnes & Liens Partagés", detail: "Salons et presse professionnelle", count: 16260, pct: 3, color: "#ec4899" },
            ],
            countries: [
              { flag: "🇫🇷", name: "France", views: 472624, pct: 87.2 },
              { flag: "🇧🇪", name: "Belgique", views: 27642, pct: 5.1 },
              { flag: "🇨🇭", name: "Suisse", views: 18428, pct: 3.4 },
              { flag: "🇱🇺", name: "Luxembourg", views: 11382, pct: 2.1 },
              { flag: "🇪🇸", name: "Espagne", views: 7046, pct: 1.3 },
              { flag: "🌍", name: "Autres pays", views: 4878, pct: 0.9 },
            ],
            regions: [
              { name: "Île-de-France (Hubs Paris, Rungis, Roissy)", pct: 28, color: "#0284c7" },
              { name: "Auvergne-Rhône-Alpes (Lyon, Corbas, St-Quentin)", pct: 21, color: "#0ea5e9" },
              { name: "Hauts-de-France (Lille, Dourges, Fret Nord)", pct: 17, color: "#10b981" },
              { name: "Pays de la Loire & Bretagne (Nantes, Rennes)", pct: 14, color: "#38bdf8" },
              { name: "PACA & Occitanie (Marseille, Toulouse)", pct: 12, color: "#f59e0b" },
              { name: "Autres régions françaises", pct: 8, color: "#64748b" },
            ],
            devices: [
              { icon: "📱", name: "Mobiles (Smartphones chauffeurs)", pct: 69, color: "#0284c7" },
              { icon: "💻", name: "Ordinateurs Desktop (Bureaux & Exploitants)", pct: 27, color: "#10b981" },
              { icon: "📟", name: "Tablettes (Dépôts & Cabines)", pct: 4, color: "#f59e0b" },
            ],
          },
        };

        const activeData = analyticsPeriodsData[trafficPeriod] || analyticsPeriodsData["30d"];

        const handleExportTrafficData = () => {
          const exportObj = {
            report_name: "truckmatch_audience_analytics",
            period: activeData.periodTitle,
            exported_at: new Date().toISOString(),
            metrics: {
              total_visits: activeData.visits,
              unique_visitors: activeData.uniqueVisitors,
              page_views: activeData.pageViews,
              bounce_rate: activeData.bounceRate,
              avg_duration: activeData.avgDuration,
            },
            top_pages: activeData.pages,
            traffic_sources: activeData.sources,
            geographic_countries: activeData.countries,
            french_regions: activeData.regions,
            devices: activeData.devices,
          };
          const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `truckmatch-audience-${trafficPeriod}-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        };

        return (
          <div className="stats-cockpit-view">
            {/* A. Bloc Contrôle Haut : Titre + Export + Période */}
            <div className="candidates-header-block">
              <div className="candidates-header-row-1">
                <div className="candidates-title-wrap">
                  <h1 className="candidates-page-title">
                    <BarChart3 size={20} className="text-primary" />
                    <span>Audience & Fréquentation du Site (Web Analytics)</span>
                  </h1>
                  <span className="cockpit-panel-badge flex items-center gap-1.5" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span>18 visiteurs en direct sur TruckMatch</span>
                  </span>
                </div>

                <div className="candidates-header-actions">
                  <button
                    type="button"
                    onClick={handleExportTrafficData}
                    className="btn-cockpit-action"
                    title="Télécharger les statistiques complètes de trafic"
                  >
                    <Download size={13} />
                    <span>Export Analytics JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    className="btn-cockpit-action"
                    title="Actualiser les compteurs de visite"
                  >
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>

              {/* Ligne 2 : Filtres de période temporelle interactifs */}
              <div className="candidates-header-row-2">
                <div className="candidates-pills-bar">
                  <span className="text-xs text-slate-400 font-bold mr-2">Période d'analyse :</span>
                  <button
                    type="button"
                    onClick={() => setTrafficPeriod("today")}
                    className={`candidates-filter-pill ${trafficPeriod === "today" ? "active" : ""}`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrafficPeriod("7d")}
                    className={`candidates-filter-pill ${trafficPeriod === "7d" ? "active" : ""}`}
                  >
                    7 derniers jours
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrafficPeriod("30d")}
                    className={`candidates-filter-pill ${trafficPeriod === "30d" ? "active" : ""}`}
                  >
                    30 derniers jours
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrafficPeriod("year")}
                    className={`candidates-filter-pill ${trafficPeriod === "year" ? "active" : ""}`}
                  >
                    Cette année (2026)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Activity size={13} className="text-emerald-400" />
                  <span>Tracking en temps réel : Serveur Nginx & Next.js Analytics</span>
                </div>
              </div>
            </div>

            {/* B. Bandeau KPI Trafic Aéré (68px, 5 cartes) */}
            <div className="candidates-kpis-strip">
              <div className="candidates-kpi-item">
                <div>
                  <div className="candidates-kpi-lbl">Nombre de Visites</div>
                  <div className="candidates-kpi-val">{activeData.visits.toLocaleString("fr-FR")}</div>
                </div>
                <Users size={18} className="text-primary" />
              </div>

              <div className="candidates-kpi-item">
                <div>
                  <div className="candidates-kpi-lbl">Visiteurs Uniques</div>
                  <div className="candidates-kpi-val">{activeData.uniqueVisitors.toLocaleString("fr-FR")}</div>
                </div>
                <Eye size={18} className="text-sky-400" />
              </div>

              <div className="candidates-kpi-item">
                <div>
                  <div className="candidates-kpi-lbl">Pages Visitées</div>
                  <div className="candidates-kpi-val">{activeData.pageViews.toLocaleString("fr-FR")}</div>
                </div>
                <FileText size={18} className="text-amber-400" />
              </div>

              <div className="candidates-kpi-item">
                <div>
                  <div className="candidates-kpi-lbl">Taux de Rebond</div>
                  <div className="candidates-kpi-val">{activeData.bounceRate}</div>
                </div>
                <TrendingUp size={18} className="text-emerald-400" />
              </div>

              <div className="candidates-kpi-item">
                <div>
                  <div className="candidates-kpi-lbl">Temps Moyen / Visite</div>
                  <div className="candidates-kpi-val">{activeData.avgDuration}</div>
                </div>
                <Clock size={18} className="text-purple-400" />
              </div>
            </div>

            {/* C. Grille Principale 3 Colonnes Aérée (Zero-scroll, scroll interne) */}
            <div className="stats-cockpit-grid">
              {/* Carte 1 : Pages les plus visitées */}
              <div className="stats-cockpit-card">
                <div className="stats-card-header-bar">
                  <h3>
                    <FileText size={16} className="text-sky-400" />
                    <span>Pages les Plus Visitées</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{activeData.pageViews.toLocaleString("fr-FR")} vues</span>
                </div>

                {activeData.pages.map((p) => (
                  <div key={p.path} className="stats-metric-row">
                    <div className="stats-metric-labels">
                      <span className="font-semibold text-white truncate max-w-[210px]" title={p.name}>
                        {p.name} <span className="text-xs text-slate-400 font-mono">({p.path})</span>
                      </span>
                      <span className="font-bold text-slate-300 shrink-0">
                        {p.views.toLocaleString("fr-FR")} ({p.pct}%)
                      </span>
                    </div>
                    <div className="stats-metric-track">
                      <div className="stats-metric-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Carte 2 : D'où viennent les visites (Sources & Canaux) */}
              <div className="stats-cockpit-card">
                <div className="stats-card-header-bar">
                  <h3>
                    <ArrowUpRight size={16} className="text-emerald-400" />
                    <span>D'où Viennent les Visites (Sources)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">100% trafic</span>
                </div>

                {activeData.sources.map((s) => (
                  <div key={s.name} className="stats-metric-row">
                    <div className="stats-metric-labels">
                      <div>
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{s.detail}</div>
                      </div>
                      <span className="font-bold text-slate-300 shrink-0 text-right">
                        {s.count.toLocaleString("fr-FR")} ({s.pct}%)
                      </span>
                    </div>
                    <div className="stats-metric-track">
                      <div className="stats-metric-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Carte 3 : Pays de visite & Appareils */}
              <div className="stats-cockpit-card">
                <div className="stats-card-header-bar">
                  <h3>
                    <MapPin size={16} className="text-amber-400" />
                    <span>Pays de Visite & Géographie</span>
                  </h3>
                  <span className="text-xs text-slate-400">Origine visiteurs</span>
                </div>

                <div className="mb-3">
                  <div className="text-xs font-bold text-slate-300 mb-2">Principaux pays de provenance :</div>
                  {activeData.countries.map((c) => (
                    <div key={c.name} className="stats-metric-row mb-2">
                      <div className="stats-metric-labels">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="font-bold text-slate-300">
                          {c.views.toLocaleString("fr-FR")} ({c.pct}%)
                        </span>
                      </div>
                      <div className="stats-metric-track" style={{ height: "6px" }}>
                        <div className="stats-metric-fill" style={{ width: `${c.pct}%`, background: "#0ea5e9" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-1.5">Appareils utilisés (Devices) :</div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {activeData.devices.map((d) => (
                      <div key={d.name} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <div className="text-sm mb-0.5">{d.icon}</div>
                        <div className="text-xs font-black text-white">{d.pct}%</div>
                        <div className="text-[10px] text-slate-400 truncate">{d.name.split(" ")[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* D. Status Ticker Fixe Bas (24px) */}
            <div className="admin-ticker-bar">
              <div className="ticker-left">
                <span className="text-emerald-400 font-bold">● ANALYTICS AUDIENCE ACTIFS</span>
                <span>•</span>
                <span>Suivi d'audience et de parcours utilisateur en temps réel</span>
                <span>•</span>
                <span>Période : {activeData.periodTitle}</span>
              </div>
              <div className="ticker-right">
                <span>Latence Supabase : {supabaseLatency}ms</span>
                <span>•</span>
                <span>Nginx / TruckMatch Pro Core</span>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === "stats-revenu" && (
        <main className="admin-main-body">
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
        </main>
      )}

      {activeTab === "support" && (
        <main className="admin-main-body">
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
        </main>
      )}
    </div>
  );
}
