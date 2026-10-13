"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Euro,
  CreditCard,
  Crown,
  Users,
  Search,
  Filter,
  Gift,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FileText,
  Building2,
  Zap,
  BarChart3,
  Calendar,
  X,
  Plus,
  Loader2,
  Trash2,
  Settings,
  HelpCircle,
  Eye,
  MapPin,
  BadgeEuro,
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  LayoutGrid,
  TableProperties,
} from "lucide-react";

export function AdminCommercialModule() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "month" | "year" | "all">("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Vue Cartes (style Offres d'Emploi) ou Tableau (style Entreprises)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Recherche et filtres entreprises
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "paid" | "gifted" | "free" | "recruteur" | "transport_pro" | "flotte_reseau">("all");

  // Modale « Attribuer un abonnement offert »
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftTargetCompany, setGiftTargetCompany] = useState<any>(null);
  const [giftForm, setGiftForm] = useState({
    planId: "recruteur",
    durationDays: 30,
    reason: "Partenariat de lancement",
    notes: "",
  });
  const [giftLoading, setGiftLoading] = useState(false);

  // Modale Fiscalité
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxForm, setTaxForm] = useState({
    regime: "micro_entreprise",
    isVatExempt: true,
    vatLegalNotice: "TVA non applicable, art. 293 B du CGI",
    vatNumber: "",
    companyLegalName: "TruckMatch",
    companySiret: "",
    companyAddress: "",
    companyBillingEmail: "jobs@truckmatch.fr",
  });
  const [taxLoading, setTaxLoading] = useState(false);

  const loadData = async (selectedPeriod = period) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/commercial?period=${selectedPeriod}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.taxSettings) {
          setTaxForm(json.taxSettings);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Impossible de charger les données commerciales.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  // Valider l'attribution d'un abonnement offert
  const handleConfirmGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTargetCompany) return;
    setGiftLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gift_subscription",
          data: {
            companyId: giftTargetCompany.id,
            planId: giftForm.planId,
            durationDays: Number(giftForm.durationDays),
            reason: giftForm.reason,
            notes: giftForm.notes,
          },
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Échec de l'attribution.");
      }

      setSuccessMsg(resJson.message);
      setIsGiftModalOpen(false);
      setGiftTargetCompany(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGiftLoading(false);
    }
  };

  // Révoquer un abonnement offert
  const handleRevokeGift = async (companyId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer cet abonnement offert ? L'entreprise repassera en Découverte.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke_gift",
          data: { companyId },
        }),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Échec de la révocation.");
      }
      setSuccessMsg(resJson.message);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder la fiscalité
  const handleSaveTaxSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxLoading(true);
    try {
      const res = await fetch("/api/admin/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_tax_settings",
          data: taxForm,
        }),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Échec de l'enregistrement fiscal.");
      }
      setSuccessMsg("Configuration fiscale micro-entreprise mise à jour.");
      setIsTaxModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setTaxLoading(false);
    }
  };

  const kpis = data?.kpis || {};
  const chartData = data?.chartData || [];
  const companies = data?.companies || [];
  const auditLogs = data?.auditLogs || [];

  // Statistiques des forfaits pour la Carte 2 (identique à stats-site)
  const totalCompaniesCount = companies.length || 1;
  const recruteurCount = companies.filter((c: any) => c.subscriptionPlan === "recruteur" && !c.isGifted).length;
  const transportProCount = companies.filter((c: any) => c.subscriptionPlan === "transport_pro" && !c.isGifted).length;
  const flotteReseauCount = companies.filter((c: any) => c.subscriptionPlan === "flotte_reseau" && !c.isGifted).length;
  const giftedCount = companies.filter((c: any) => c.isGifted).length;
  const decouverteCount = companies.filter((c: any) => !c.subscriptionPlan || c.subscriptionPlan === "decouverte").length;

  const recruteurPct = Math.round((recruteurCount / totalCompaniesCount) * 100);
  const transportProPct = Math.round((transportProCount / totalCompaniesCount) * 100);
  const flotteReseauPct = Math.round((flotteReseauCount / totalCompaniesCount) * 100);
  const giftedPct = Math.round((giftedCount / totalCompaniesCount) * 100);
  const decouvertePct = Math.round((decouverteCount / totalCompaniesCount) * 100);

  // Seuil franchise TVA micro-entreprise (39 100 €)
  const vatThresholdEur = 39100;
  const currentRevEur = Number(kpis.collectedRevenueEur || 0);
  const vatThresholdPct = Math.min(100, Math.max(1, Math.round((currentRevEur / vatThresholdEur) * 100)));

  // Filtrage des entreprises
  const filteredCompanies = companies.filter((c: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchCity = c.city?.toLowerCase().includes(q);
      const matchCp = c.postalCode?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCity && !matchCp) return false;
    }

    if (filterPlan === "paid") {
      return !c.isGifted && c.subscriptionPlan && c.subscriptionPlan !== "decouverte";
    }
    if (filterPlan === "gifted") {
      return c.isGifted;
    }
    if (filterPlan === "free") {
      return !c.subscriptionPlan || c.subscriptionPlan === "decouverte";
    }
    if (filterPlan === "recruteur") return c.subscriptionPlan === "recruteur";
    if (filterPlan === "transport_pro") return c.subscriptionPlan === "transport_pro";
    if (filterPlan === "flotte_reseau") return c.subscriptionPlan === "flotte_reseau";

    return true;
  });

  // Calcul du max pour le graphique SVG
  const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue || 0), 100);

  const periodLabels: Record<string, string> = {
    today: "Aujourd'hui",
    "7d": "7 derniers jours",
    "30d": "30 derniers jours",
    month: "Ce mois-ci",
    year: "Cette année",
    all: "Historique complet",
  };

  return (
    <div className="candidates-cockpit-view">
      {/* ============================================================== */}
      {/* A. EN-TÊTE COCKPIT (Identique Stats Site & Offres d'Emploi)    */}
      {/* ============================================================== */}
      <div className="candidates-header-block">
        {/* Ligne 1 : Titre + Badges + Actions */}
        <div className="candidates-header-row-1">
          <div className="candidates-title-wrap">
            <h1 className="candidates-page-title">
              <BadgeEuro size={18} className="text-emerald-400" />
              <span>Gestion Commerciale &amp; Abonnements</span>
            </h1>
            <span className="cockpit-panel-badge">{companies.length} entreprises supervisées</span>
            <span className="company-cockpit-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1"></span>
              Régime Micro-Entreprise (0% TVA)
            </span>
          </div>

          <div className="candidates-header-actions">
            <button
              type="button"
              onClick={() => setIsTaxModalOpen(true)}
              className="btn-cockpit-action"
              title="Paramètres de facturation et régime fiscal micro-entreprise"
            >
              <Settings size={13} className="text-amber-400" />
              <span>Fiscalité Micro-Entreprise</span>
            </button>

            <button
              type="button"
              onClick={() => loadData()}
              disabled={loading}
              className="btn-cockpit-action"
              title="Actualiser Supabase"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-sky-400" : "text-emerald-400"} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Ligne 2 : Recherche sombre + Pilules filtres claires */}
        <div className="candidates-header-row-2">
          <div className="candidates-search-dark">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Chercher entreprise, email, ville, code postal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="candidates-pills-bar">
            {/* Périodes */}
            {[
              { id: "today", label: "Aujourd'hui" },
              { id: "7d", label: "7 jours" },
              { id: "30d", label: "30 jours" },
              { id: "month", label: "Ce mois" },
              { id: "year", label: "2026" },
              { id: "all", label: "Tout" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id as any)}
                className={`candidates-filter-pill ${period === p.id ? "active" : ""}`}
              >
                {p.label}
              </button>
            ))}

            <span className="text-slate-600 hidden sm:inline">|</span>

            {/* Filtres de forfaits */}
            <button
              type="button"
              onClick={() => setFilterPlan("all")}
              className={`candidates-filter-pill ${filterPlan === "all" ? "active" : ""}`}
            >
              Tous ({companies.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPlan("paid")}
              className={`candidates-filter-pill ${filterPlan === "paid" ? "active" : ""}`}
            >
              Payants ({companies.filter((c: any) => !c.isGifted && c.subscriptionPlan && c.subscriptionPlan !== "decouverte").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPlan("gifted")}
              className={`candidates-filter-pill ${filterPlan === "gifted" ? "active" : ""}`}
            >
              Offerts ({companies.filter((c: any) => c.isGifted).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPlan("free")}
              className={`candidates-filter-pill ${filterPlan === "free" ? "active" : ""}`}
            >
              Découverte ({companies.filter((c: any) => !c.subscriptionPlan || c.subscriptionPlan === "decouverte").length})
            </button>

            <span className="text-slate-600 hidden sm:inline">|</span>

            {/* Sélecteur de mode d'affichage */}
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`candidates-filter-pill ${viewMode === "cards" ? "active" : ""}`}
              title="Affichage en cartes comme l'onglet Offres d'Emploi"
            >
              <LayoutGrid size={12} className="inline mr-1" />
              Cartes
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`candidates-filter-pill ${viewMode === "table" ? "active" : ""}`}
              title="Affichage en tableau comme l'onglet Entreprises"
            >
              <TableProperties size={12} className="inline mr-1" />
              Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Notifications retour */}
      {errorMsg && (
        <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "0.6rem 1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem" }}>
          <AlertCircle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#6ee7b7", padding: "0.6rem 1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem" }}>
          <CheckCircle2 size={15} style={{ color: "#10b981", flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* B. BANDEAU KPI TRAFIC & REVENUS (6 cartes sombres haute précision) */}
      {/* ============================================================== */}
      <div className="candidates-kpis-strip" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
        <div className="candidates-kpi-item">
          <div>
            <div className="candidates-kpi-lbl">CA Réel Encaissé</div>
            <div className="candidates-kpi-val text-emerald-400">
              {Number(kpis.collectedRevenueEur || 0).toFixed(2)} €
            </div>
          </div>
          <Euro size={18} className="text-emerald-400" />
        </div>

        <div className="candidates-kpi-item">
          <div>
            <div className="candidates-kpi-lbl">Abonnements Payants</div>
            <div className="candidates-kpi-val text-sky-400">
              {kpis.paidActiveCompanies || 0}
            </div>
          </div>
          <Crown size={18} className="text-sky-400" />
        </div>

        <div className="candidates-kpi-item">
          <div>
            <div className="candidates-kpi-lbl">Abonnements Offerts</div>
            <div className="candidates-kpi-val text-purple-400">
              {kpis.giftedCompanies || 0}
            </div>
          </div>
          <Gift size={18} className="text-purple-400" />
        </div>

        <div className="candidates-kpi-item">
          <div>
            <div className="candidates-kpi-lbl">Comptes Découverte</div>
            <div className="candidates-kpi-val text-slate-300">
              {kpis.freeCompanies || 0}
            </div>
          </div>
          <Users size={18} className="text-slate-400" />
        </div>

        <div className="candidates-kpi-item">
          <div>
            <div className="candidates-kpi-lbl">Candidats Débloqués</div>
            <div className="candidates-kpi-val text-amber-400">
              {kpis.unlockedProfilesCount || 0}
            </div>
          </div>
          <Zap size={18} className="text-amber-400" />
        </div>

        <div className="candidates-kpi-item">
          <div>
            <div className="candidates-kpi-lbl">Commandes &amp; Packs</div>
            <div className="candidates-kpi-val text-cyan-400">
              {kpis.creditsPurchasesCount || 0}
            </div>
          </div>
          <CreditCard size={18} className="text-cyan-400" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* C. GRILLE COCKPIT 3 COLONNES SOMBRE (Strictement identique à Stats Site) */}
      {/* ============================================================== */}
      <div className="stats-cockpit-grid" style={{ minHeight: "260px" }}>
        {/* CARTE 1 : Évolution du Chiffre d'Affaires Encaissé */}
        <div className="stats-cockpit-card">
          <div className="stats-card-header-bar">
            <h3>
              <TrendingUp size={16} className="text-emerald-400" />
              <span>Évolution CA Réel Encaissé</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              {Number(kpis.collectedRevenueEur || 0).toFixed(2)} €
            </span>
          </div>

          <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
            <span>Période : {periodLabels[period] || period}</span>
            <span className="font-mono text-[11px] text-slate-400">
              {kpis.creditsPurchasesCount || 0} commande(s)
            </span>
          </div>

          {/* Graphique SVG / Barres sombres */}
          <div style={{ flex: 1, minHeight: "130px", display: "flex", alignItems: "flex-end", gap: "5px", padding: "0.5rem 0 0" }}>
            {chartData.length === 0 ? (
              <div className="w-full text-center text-xs text-slate-500 py-6">
                Aucune commande sur cette période
              </div>
            ) : (
              chartData.map((d: any, idx: number) => {
                const heightPercent = maxRevenue > 0 ? Math.min(100, Math.max(10, (d.revenue / maxRevenue) * 100)) : 10;
                const hasValue = d.revenue > 0;
                return (
                  <div
                    key={idx}
                    title={`${d.date} : ${d.revenue} € (${d.ordersCount} commandes)`}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent}%`,
                        background: hasValue ? "linear-gradient(180deg, #10b981 0%, #059669 100%)" : "#142236",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 200ms ease",
                      }}
                    />
                    <span style={{ fontSize: "0.58rem", color: "#64748b", marginTop: "4px", whiteSpace: "nowrap" }}>
                      {idx % 4 === 0 ? d.date : ""}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Encaissé via Stripe Direct</span>
            <span className="text-emerald-400 font-mono font-bold">100% Réel Supabase</span>
          </div>
        </div>

        {/* CARTE 2 : Répartition des Forfaits & Abonnements Actifs */}
        <div className="stats-cockpit-card">
          <div className="stats-card-header-bar">
            <h3>
              <Crown size={16} className="text-sky-400" />
              <span>Répartition des Forfaits</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{companies.length} comptes</span>
          </div>

          {/* Ligne Recruteur */}
          <div className="stats-metric-row">
            <div className="stats-metric-labels">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                <span>Recruteur (29 € / m)</span>
              </span>
              <span className="font-bold text-slate-300">
                {recruteurCount} ({recruteurPct}%)
              </span>
            </div>
            <div className="stats-metric-track">
              <div className="stats-metric-fill" style={{ width: `${Math.max(4, recruteurPct)}%`, background: "#0ea5e9" }} />
            </div>
          </div>

          {/* Ligne Transport Pro */}
          <div className="stats-metric-row">
            <div className="stats-metric-labels">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                <span>Transport Pro (79 € / m)</span>
              </span>
              <span className="font-bold text-slate-300">
                {transportProCount} ({transportProPct}%)
              </span>
            </div>
            <div className="stats-metric-track">
              <div className="stats-metric-fill" style={{ width: `${Math.max(4, transportProPct)}%`, background: "#6366f1" }} />
            </div>
          </div>

          {/* Ligne Flotte & Réseau */}
          <div className="stats-metric-row">
            <div className="stats-metric-labels">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                <span>Flotte &amp; Réseau (199 € / m)</span>
              </span>
              <span className="font-bold text-slate-300">
                {flotteReseauCount} ({flotteReseauPct}%)
              </span>
            </div>
            <div className="stats-metric-track">
              <div className="stats-metric-fill" style={{ width: `${Math.max(4, flotteReseauPct)}%`, background: "#a855f7" }} />
            </div>
          </div>

          {/* Ligne Forfaits Offerts */}
          <div className="stats-metric-row">
            <div className="stats-metric-labels">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Abonnements Offerts (0 €)</span>
              </span>
              <span className="font-bold text-emerald-400">
                {giftedCount} ({giftedPct}%)
              </span>
            </div>
            <div className="stats-metric-track">
              <div className="stats-metric-fill" style={{ width: `${Math.max(4, giftedPct)}%`, background: "#10b981" }} />
            </div>
          </div>

          {/* Ligne Découverte */}
          <div className="stats-metric-row mb-0">
            <div className="stats-metric-labels">
              <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                <span>Découverte (Sans abonnement)</span>
              </span>
              <span className="font-bold text-slate-400">
                {decouverteCount} ({decouvertePct}%)
              </span>
            </div>
            <div className="stats-metric-track">
              <div className="stats-metric-fill" style={{ width: `${Math.max(4, decouvertePct)}%`, background: "#475569" }} />
            </div>
          </div>
        </div>

        {/* CARTE 3 : Régime Fiscal Micro-Entreprise & Suivi Légal */}
        <div className="stats-cockpit-card">
          <div className="stats-card-header-bar">
            <h3>
              <ShieldCheck size={16} className="text-amber-400" />
              <span>Fiscalité &amp; Suivi Légal</span>
            </h3>
            <span className="text-xs text-amber-400 font-mono">Micro-Entreprise</span>
          </div>

          {/* Seuil franchise TVA */}
          <div className="stats-metric-row mb-3">
            <div className="stats-metric-labels">
              <span className="font-semibold text-white">Franchise TVA (Art. 293 B CGI)</span>
              <span className="font-mono font-bold text-amber-400">
                {currentRevEur.toFixed(0)} € / 39 100 €
              </span>
            </div>
            <div className="stats-metric-track" style={{ height: "7px" }}>
              <div
                className="stats-metric-fill"
                style={{ width: `${vatThresholdPct}%`, background: "linear-gradient(90deg, #10b981, #f59e0b)" }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Exonération de TVA applicable sous le plafond annuel légal.
            </div>
          </div>

          {/* Informations fiscales rapides */}
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs mb-3 space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Mention facturation :</span>
              <span className="font-mono text-[11px] text-amber-300">TVA non applicable</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Email facturation :</span>
              <span className="font-mono text-[11px] text-sky-300 truncate max-w-[150px]">
                {taxForm.companyBillingEmail || "jobs@truckmatch.fr"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTaxModalOpen(true)}
            className="btn-cockpit-action w-full justify-center mt-auto"
            style={{ fontSize: "0.78rem", padding: "0.45rem" }}
          >
            <Settings size={13} className="text-amber-400" />
            <span>Modifier Raison Sociale &amp; SIRET</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* D. SECTION ENTREPRISES (Mode Cartes Style Offres ou Mode Tableau) */}
      {/* ============================================================== */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-sky-400" />
            <h2 className="text-sm font-extrabold text-white">
              Entreprises, Abonnements &amp; Attribution de Forfaits
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
              {filteredCompanies.length} affichée(s)
            </span>
          </div>

          <div className="text-xs text-slate-400">
            {viewMode === "cards" ? "Mode Cartes (Style Offres d'Emploi)" : "Mode Tableau (Style Entreprises)"}
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800">
            <Building2 size={36} className="mx-auto text-slate-600 mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-white mb-1">Aucune entreprise correspondante</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Modifiez votre recherche ou réinitialisez les filtres de forfaits.
            </p>
          </div>
        ) : viewMode === "cards" ? (
          /* ============================================================ */
          /* VUE CARTES : Style identique à l'onglet Offres d'Emploi       */
          /* ============================================================ */
          <div className="flex flex-col gap-3">
            {filteredCompanies.map((c: any) => {
              const planName = c.subscriptionPlan === "flotte_reseau"
                ? "Flotte & Réseau (199 €)"
                : c.subscriptionPlan === "transport_pro"
                ? "Transport Pro (79 €)"
                : c.subscriptionPlan === "recruteur"
                ? "Recruteur (29 €)"
                : "Découverte (0 €)";

              const isPaid = !c.isGifted && c.subscriptionPlan && c.subscriptionPlan !== "decouverte";
              const isGifted = c.isGifted;

              return (
                <div
                  key={c.id}
                  className={`admin-job-card ${
                    isGifted ? "is-pending" : isPaid ? "is-approved" : ""
                  }`}
                  style={{
                    borderLeft: isGifted
                      ? "4px solid #a855f7"
                      : isPaid
                      ? "4px solid #0284c7"
                      : "4px solid #334155",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Bloc Gauche : Nom + Badges + Coordonnées */}
                    <div className="flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="font-extrabold text-white text-sm">
                          {c.name}
                        </span>

                        {/* Pill de Statut de Forfait */}
                        {isGifted && (
                          <span
                            className="job-status-pill"
                            style={{
                              background: "rgba(168, 85, 247, 0.15)",
                              color: "#d8b4fe",
                              border: "1px solid rgba(168, 85, 247, 0.4)",
                            }}
                          >
                            <Gift size={11} />
                            <span>OFFERT • {planName}</span>
                          </span>
                        )}

                        {isPaid && (
                          <span
                            className="job-status-pill approved"
                            style={{
                              background: "rgba(2, 132, 199, 0.15)",
                              color: "#38bdf8",
                              border: "1px solid rgba(2, 132, 199, 0.4)",
                            }}
                          >
                            <Crown size={11} />
                            <span>PAYANT • {planName}</span>
                          </span>
                        )}

                        {!isGifted && !isPaid && (
                          <span
                            className="job-status-pill"
                            style={{
                              background: "rgba(100, 116, 139, 0.15)",
                              color: "#94a3b8",
                              border: "1px solid rgba(100, 116, 139, 0.3)",
                            }}
                          >
                            <Users size={11} />
                            <span>DÉCOUVERTE</span>
                          </span>
                        )}

                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-slate-400 text-xs font-mono">
                          ID: {c.id?.slice(0, 8)}
                        </span>
                      </div>

                      {/* Coordonnées & Métriques claires */}
                      <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                          <Mail size={11} className="text-sky-400" />
                          <span>{c.email}</span>
                        </span>

                        {c.city && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                            <MapPin size={11} className="text-sky-400" />
                            <span>{c.postalCode} {c.city}</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold font-mono">
                          ⚡ {c.creditsBalance || 0} crédit(s)
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          👁️ {c.unlocksCount || 0} déblocage(s)
                        </span>

                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                          💶 {Number(c.totalPaidEur || 0).toFixed(2)} € CA
                        </span>

                        {isGifted && (
                          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-medium">
                            🎁 Valide {c.giftDurationDays || 30}j ({c.giftReason || "Partenariat"})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bloc Droite : Actions d'Attribution Commerciale */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGiftTargetCompany(c);
                          setIsGiftModalOpen(true);
                        }}
                        className="btn-cockpit-action"
                        style={{ fontSize: "0.78rem", padding: "0.42rem 0.85rem" }}
                        title="Attribuer ou modifier un abonnement offert (0 €)"
                      >
                        <Gift size={13} className="text-purple-400" />
                        <span>{isGifted ? "Modifier Offre" : "Offrir un Forfait"}</span>
                      </button>

                      {isGifted && (
                        <button
                          type="button"
                          onClick={() => handleRevokeGift(c.id)}
                          className="btn-cockpit-mini btn-cockpit-mini-danger"
                          title="Révoquer l'abonnement offert et repasser en Découverte"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================ */
          /* VUE TABLEAU : Style sombre identique à l'onglet Entreprises  */
          /* ============================================================ */
          <div className="candidates-table-container">
            <table className="candidates-table-dark">
              <thead>
                <tr>
                  <th>Entreprise Transport</th>
                  <th>Contact / Coordonnées</th>
                  <th>Dépôt / Ville</th>
                  <th>Forfait Actuel</th>
                  <th>Statut</th>
                  <th>Crédits</th>
                  <th>Déblocages</th>
                  <th>CA Encaissé</th>
                  <th style={{ textAlign: "right" }}>Actions Commerciales</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c: any) => {
                  const planName = c.subscriptionPlan === "flotte_reseau"
                    ? "Flotte & Réseau"
                    : c.subscriptionPlan === "transport_pro"
                    ? "Transport Pro"
                    : c.subscriptionPlan === "recruteur"
                    ? "Recruteur"
                    : "Découverte";

                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="font-bold text-white text-sm tracking-tight mb-1">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {c.id?.slice(0, 8)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1">
                          <Mail size={12} className="text-sky-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{c.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs font-semibold text-white mb-1">
                          <MapPin size={12} className="text-sky-400 shrink-0" />
                          <span>{c.postalCode} {c.city}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="cockpit-badge-pill"
                          style={{
                            background: c.isGifted
                              ? "rgba(168, 85, 247, 0.15)"
                              : c.subscriptionPlan !== "decouverte"
                              ? "#0c4a6e"
                              : "#1e293b",
                            color: c.isGifted
                              ? "#d8b4fe"
                              : c.subscriptionPlan !== "decouverte"
                              ? "#38bdf8"
                              : "#94a3b8",
                            border: `1px solid ${
                              c.isGifted
                                ? "rgba(168, 85, 247, 0.4)"
                                : c.subscriptionPlan !== "decouverte"
                                ? "#0284c7"
                                : "#334155"
                            }`,
                          }}
                        >
                          {c.isGifted ? `🎁 ${planName} (Offert)` : c.subscriptionPlan !== "decouverte" ? `👑 ${planName}` : planName}
                        </span>
                      </td>
                      <td>
                        <span className={`cockpit-badge-pill ${c.subscriptionStatus === "active" ? "badge-imm-on" : "badge-imm-off"}`}>
                          {c.subscriptionStatus === "active" ? "Actif" : c.subscriptionStatus}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono font-bold text-sky-400">
                          {c.creditsBalance} cr.
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-slate-300">
                          {c.unlocksCount}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono font-bold text-emerald-400">
                          {Number(c.totalPaidEur || 0).toFixed(2)} €
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setGiftTargetCompany(c);
                              setIsGiftModalOpen(true);
                            }}
                            className="btn-cockpit-action"
                            style={{ fontSize: "0.74rem", padding: "0.3rem 0.65rem", borderRadius: "7px" }}
                            title="Attribuer ou modifier un abonnement offert (0 €)"
                          >
                            <Gift size={13} className="text-purple-400" />
                            <span>{c.isGifted ? "Modifier Offre" : "Offrir Forfait"}</span>
                          </button>

                          {c.isGifted && (
                            <button
                              type="button"
                              onClick={() => handleRevokeGift(c.id)}
                              className="btn-cockpit-mini btn-cockpit-mini-danger"
                              title="Révoquer l'abonnement offert"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* E. MODALE ATTRIBUER ABONNEMENT OFFERT (100% Sombre, 0 blanc)   */}
      {/* ============================================================== */}
      {isGiftModalOpen && giftTargetCompany && (
        <div className="admin-modal-backdrop" onClick={() => { setIsGiftModalOpen(false); setGiftTargetCompany(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-purple-400" />
                <h3 className="font-bold text-white text-base">
                  Attribuer un abonnement offert : {giftTargetCompany.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsGiftModalOpen(false); setGiftTargetCompany(null); }}
                className="btn-cockpit-mini"
              >
                <X size={14} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#fbbf24", lineHeight: 1.45, marginBottom: "0.5rem" }}>
                ⚖️ <strong>Règle comptable :</strong> L&apos;abonnement offert ne déclenche aucun paiement, n&apos;ajoute aucun montant au CA encaissé (0,00 €) et est journalisé dans les audits.
              </div>

              <form onSubmit={handleConfirmGift} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Forfait à attribuer gratuitement</label>
                  <select
                    value={giftForm.planId}
                    onChange={(e) => setGiftForm({ ...giftForm, planId: e.target.value })}
                    className="admin-chat-input-field w-full"
                    style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                  >
                    <option value="recruteur">Recruteur (2 offres, 3 crédits / mois)</option>
                    <option value="transport_pro">Transport Pro (5 offres, 10 crédits / mois, logo bandeau)</option>
                    <option value="flotte_reseau">Flotte &amp; Réseau (15 offres, 25 crédits / mois, visibilité max)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Durée de validité</label>
                    <select
                      value={giftForm.durationDays}
                      onChange={(e) => setGiftForm({ ...giftForm, durationDays: Number(e.target.value) })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    >
                      <option value={30}>30 jours (1 mois)</option>
                      <option value={60}>60 jours (2 mois)</option>
                      <option value={90}>90 jours (3 mois)</option>
                      <option value={180}>180 jours (6 mois)</option>
                      <option value={365}>365 jours (1 an)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Motif administratif obligatoire</label>
                    <select
                      value={giftForm.reason}
                      onChange={(e) => setGiftForm({ ...giftForm, reason: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    >
                      <option value="Partenariat de lancement">Partenariat de lancement</option>
                      <option value="Entreprise partenaire">Entreprise partenaire</option>
                      <option value="Geste commercial">Geste commercial</option>
                      <option value="Test interne / Démo">Test interne / Démo</option>
                      <option value="Offre commerciale spécifique">Offre commerciale spécifique</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Commentaire interne (Audit log)</label>
                  <textarea
                    rows={2}
                    placeholder="Justification de l'attribution pour l'administration..."
                    value={giftForm.notes}
                    onChange={(e) => setGiftForm({ ...giftForm, notes: e.target.value })}
                    className="admin-chat-input-field w-full"
                    style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                  />
                </div>

                <div className="admin-modal-footer mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsGiftModalOpen(false); setGiftTargetCompany(null); }}
                    className="btn-cockpit-action"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={giftLoading}
                    className="btn-cockpit-action btn-cockpit-action-primary"
                  >
                    {giftLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Validation...</span>
                      </>
                    ) : (
                      <>
                        <Gift size={13} />
                        <span>Confirmer l&apos;abonnement offert</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* F. MODALE CONFIGURATION FISCALE MICRO-ENTREPRISE (100% Sombre) */}
      {/* ============================================================== */}
      {isTaxModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsTaxModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Configuration Fiscale &amp; Facturation (Micro-Entreprise)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaxModalOpen(false)}
                className="btn-cockpit-mini"
              >
                <X size={14} />
              </button>
            </div>

            <div className="admin-modal-body">
              <form onSubmit={handleSaveTaxSettings} className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={taxForm.isVatExempt}
                    onChange={(e) => setTaxForm({ ...taxForm, isVatExempt: e.target.checked })}
                    className="w-4 h-4 accent-sky-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Franchise en base de TVA (Micro-Entreprise)</span>
                    <span className="text-[11px] text-slate-400">Application art. 293 B du CGI (TVA non applicable)</span>
                  </div>
                </label>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-bold">Mention légale de TVA sur factures</label>
                  <input
                    type="text"
                    value={taxForm.vatLegalNotice}
                    onChange={(e) => setTaxForm({ ...taxForm, vatLegalNotice: e.target.value })}
                    className="admin-chat-input-field w-full"
                    style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Raison sociale légale</label>
                    <input
                      type="text"
                      value={taxForm.companyLegalName}
                      onChange={(e) => setTaxForm({ ...taxForm, companyLegalName: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-bold">Email de facturation</label>
                    <input
                      type="email"
                      value={taxForm.companyBillingEmail}
                      onChange={(e) => setTaxForm({ ...taxForm, companyBillingEmail: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                </div>

                <div className="admin-modal-footer mt-2">
                  <button
                    type="button"
                    onClick={() => setIsTaxModalOpen(false)}
                    className="btn-cockpit-action"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={taxLoading}
                    className="btn-cockpit-action btn-cockpit-action-primary"
                  >
                    {taxLoading ? "Enregistrement..." : "Enregistrer la configuration"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
