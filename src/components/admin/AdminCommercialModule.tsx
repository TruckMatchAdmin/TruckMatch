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
} from "lucide-react";

export function AdminCommercialModule() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "month" | "year" | "all">("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Modale Fiche Détail Entreprise
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<any>(null);

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
  const taxSettings = data?.taxSettings || {};
  const auditLogs = data?.auditLogs || [];

  // Filtrage des entreprises
  const filteredCompanies = companies.filter((c: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchCity = c.city?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCity) return false;
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
  const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 100);

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
      {/* A. Bloc Contrôle Haut : Titre + Recherche + Filtres + Actions */}
      <div className="candidates-header-block">
        {/* Ligne 1 : Titre + Actions */}
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
            <Search size={14} className="text-muted" />
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

      {/* B. Bandeau KPI Aéré (68px) identique aux autres pages */}
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
            <div className="candidates-kpi-lbl">Missions Recherche</div>
            <div className="candidates-kpi-val text-cyan-400">
              {kpis.searchMissionsCount || 0}
            </div>
          </div>
          <Search size={18} className="text-cyan-400" />
        </div>
      </div>

      {/* C. Table Complète Sombre Haute Précision (Identique Candidats/Entreprises) */}
      <div className="candidates-table-container">
        {/* Encart Évolution CA Sombre intégré dans le conteneur */}
        <div style={{ background: "#091322", borderBottom: "1px solid #1c2e47", padding: "0.75rem 1.15rem" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              <span className="font-bold text-white text-xs">
                Évolution du chiffre d&apos;affaires ({periodLabels[period] || period})
              </span>
              <span className="text-[11px] text-slate-400">
                • {kpis.creditsPurchasesCount || 0} commandes enregistrées
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {Number(kpis.collectedRevenueEur || 0).toFixed(2)} € encaissés
              </span>
            </div>
          </div>

          <div style={{ height: "64px", width: "100%", display: "flex", alignItems: "flex-end", gap: "4px" }}>
            {chartData.map((d: any, idx: number) => {
              const heightPercent = maxRevenue > 0 ? Math.min(100, Math.max(8, (d.revenue / maxRevenue) * 100)) : 8;
              const hasValue = d.revenue > 0;
              return (
                <div
                  key={idx}
                  title={`${d.date} : ${d.revenue} € (${d.ordersCount} commandes)`}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPercent}%`,
                      background: hasValue ? "#10b981" : "#16263e",
                      borderRadius: "2px 2px 0 0",
                      transition: "height 200ms ease",
                    }}
                  />
                  <span style={{ fontSize: "0.58rem", color: "#64748b", marginTop: "3px", whiteSpace: "nowrap" }}>
                    {idx % 5 === 0 ? d.date : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table Dark */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Building2 size={32} className="mx-auto mb-2 text-slate-600 opacity-50" />
            <p className="font-bold text-sm text-white">Aucune entreprise ne correspond aux critères.</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* D. Modale Attribuer Abonnement Offert (admin-modal-box) */}
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
              <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#fbbf24", lineHeight: 1.45, marginBottom: "1rem" }}>
                ⚖️ <strong>Règle comptable :</strong> L&apos;abonnement offert ne déclenche aucun paiement, n&apos;ajoute aucun montant au CA encaissé (0,00 €) et est journalisé dans les audits.
              </div>

              <form onSubmit={handleConfirmGift} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1 font-bold">Forfait à attribuer gratuitement</label>
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
                    <label className="text-xs text-muted block mb-1 font-bold">Durée de validité</label>
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
                    <label className="text-xs text-muted block mb-1 font-bold">Motif administratif obligatoire</label>
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
                  <label className="text-xs text-muted block mb-1 font-bold">Commentaire interne (Audit log)</label>
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

      {/* E. Modale Configuration Fiscale Micro-Entreprise */}
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
                  <label className="text-xs text-muted block mb-1 font-bold">Mention légale de TVA sur factures</label>
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
                    <label className="text-xs text-muted block mb-1 font-bold">Raison sociale légale</label>
                    <input
                      type="text"
                      value={taxForm.companyLegalName}
                      onChange={(e) => setTaxForm({ ...taxForm, companyLegalName: e.target.value })}
                      className="admin-chat-input-field w-full"
                      style={{ background: "#101c2e", color: "#fff", borderColor: "#1e3352" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1 font-bold">Email de facturation</label>
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
