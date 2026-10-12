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

  return (
    <div className="admin-commercial-container">
      {/* 1. HEADER DU COCKPIT COMMERCIAL */}
      <div className="admin-commercial-header">
        <div className="admin-commercial-title">
          <h2>
            <TrendingUp size={24} style={{ display: "inline-block", marginRight: "0.5rem", color: "var(--color-primary, #0080ff)" }} />
            Gestion Commerciale &amp; Abonnements
          </h2>
          <p>
            Chiffre d&apos;affaires réel, suivi des forfaits, crédits et attribution d&apos;abonnements offerts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Sélecteur de période */}
          <div className="admin-period-pills">
            {[
              { id: "today", label: "Aujourd'hui" },
              { id: "7d", label: "7 jours" },
              { id: "30d", label: "30 jours" },
              { id: "month", label: "Mois" },
              { id: "year", label: "Année" },
              { id: "all", label: "Tout" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id as any)}
                className={`admin-period-btn ${period === p.id ? "active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Bouton Paramètres Fiscaux */}
          <button
            type="button"
            onClick={() => setIsTaxModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer", color: "var(--color-navy, #0b192c)" }}
          >
            <Settings size={14} />
            <span>Fiscalité Micro-Entreprise</span>
          </button>

          {/* Bouton Actualiser */}
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer", color: "var(--color-navy, #0b192c)" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Notifications retour */}
      {errorMsg && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.85rem 1.25rem", borderRadius: "12px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.65rem", fontSize: "0.88rem" }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "0.85rem 1.25rem", borderRadius: "12px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.65rem", fontSize: "0.88rem" }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. GRILLE KPI COMMERCIALE (CHIFFRES RÉELS) */}
      <div className="admin-commercial-kpi-grid">
        {/* CA ENCAISSÉ */}
        <div className="admin-comm-kpi-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="admin-comm-kpi-head">
            <span className="admin-comm-kpi-label">CA Réel Encaissé</span>
            <div className="admin-comm-kpi-icon" style={{ background: "#e6f9f0", color: "#10b981" }}>
              <Euro size={18} />
            </div>
          </div>
          <div className="admin-comm-kpi-value">
            {Number(kpis.collectedRevenueEur || 0).toFixed(2)} €
          </div>
          <div className="admin-comm-kpi-sub">
            Sur la période • Commandes payées uniquement
          </div>
        </div>

        {/* ENTREPRISES AVEC ABO PAYANT */}
        <div className="admin-comm-kpi-card" style={{ borderLeft: "4px solid #0080ff" }}>
          <div className="admin-comm-kpi-head">
            <span className="admin-comm-kpi-label">Abonnements Payants</span>
            <div className="admin-comm-kpi-icon" style={{ background: "#e8f3ff", color: "#0080ff" }}>
              <Crown size={18} />
            </div>
          </div>
          <div className="admin-comm-kpi-value">
            {kpis.paidActiveCompanies || 0}
          </div>
          <div className="admin-comm-kpi-sub">
            Entreprises clientes actives
          </div>
        </div>

        {/* ABONNEMENTS OFFERTS */}
        <div className="admin-comm-kpi-card" style={{ borderLeft: "4px solid #a855f7" }}>
          <div className="admin-comm-kpi-head">
            <span className="admin-comm-kpi-label">Abonnements Offerts</span>
            <div className="admin-comm-kpi-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>
              <Gift size={18} />
            </div>
          </div>
          <div className="admin-comm-kpi-value" style={{ color: "#9333ea" }}>
            {kpis.giftedCompanies || 0}
          </div>
          <div className="admin-comm-kpi-sub">
            Attribués par l&apos;admin (0 € de CA)
          </div>
        </div>

        {/* ENTREPRISES GRATUITES */}
        <div className="admin-comm-kpi-card" style={{ borderLeft: "4px solid #64748b" }}>
          <div className="admin-comm-kpi-head">
            <span className="admin-comm-kpi-label">Comptes Découverte</span>
            <div className="admin-comm-kpi-icon" style={{ background: "#f1f5f9", color: "#64748b" }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-comm-kpi-value">
            {kpis.freeCompanies || 0}
          </div>
          <div className="admin-comm-kpi-sub">
            Total : {kpis.totalCompanies || 0} entreprises
          </div>
        </div>

        {/* PROFILS DÉBLOQUÉS */}
        <div className="admin-comm-kpi-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="admin-comm-kpi-head">
            <span className="admin-comm-kpi-label">Candidats Débloqués</span>
            <div className="admin-comm-kpi-icon" style={{ background: "#fef7e6", color: "#f59e0b" }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="admin-comm-kpi-value">
            {kpis.unlockedProfilesCount || 0}
          </div>
          <div className="admin-comm-kpi-sub">
            {kpis.creditsPurchasesCount || 0} achat(s) de packs crédits
          </div>
        </div>

        {/* MISSIONS DE RECHERCHE */}
        <div className="admin-comm-kpi-card" style={{ borderLeft: "4px solid #06b6d4" }}>
          <div className="admin-comm-kpi-head">
            <span className="admin-comm-kpi-label">Missions Recherche</span>
            <div className="admin-comm-kpi-icon" style={{ background: "#ecfeff", color: "#0891b2" }}>
              <Search size={18} />
            </div>
          </div>
          <div className="admin-comm-kpi-value">
            {kpis.searchMissionsCount || 0}
          </div>
          <div className="admin-comm-kpi-sub">
            {kpis.paidCampaignsCount || 0} campagne(s) pub active(s)
          </div>
        </div>
      </div>

      {/* 3. GRAPHIQUE DES VENTES RÉELLES DANS LE TEMPS (30 JOURS) */}
      <div className="admin-chart-card">
        <div className="admin-chart-head">
          <div>
            <h3>Évolution du chiffre d&apos;affaires encaissé (30 derniers jours)</h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Données directes de la base Supabase sans interpolation
            </span>
          </div>

          <div style={{ display: "flex", gap: "1rem", fontSize: "0.82rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#10b981", fontWeight: "700" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
              Revenus (€)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#0080ff", fontWeight: "700" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0080ff" }} />
              Commandes confirmées
            </span>
          </div>
        </div>

        {/* Histogramme / Barres SVG dynamiques */}
        <div style={{ height: "180px", width: "100%", display: "flex", alignItems: "flex-end", gap: "6px", paddingTop: "20px" }}>
          {chartData.map((d: any, idx: number) => {
            const heightPercent = maxRevenue > 0 ? Math.min(100, Math.max(8, (d.revenue / maxRevenue) * 100)) : 8;
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
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${heightPercent}%`,
                    background: hasValue ? "linear-gradient(180deg, #10b981 0%, #059669 100%)" : "#e2e8f0",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 300ms ease",
                    minHeight: "4px",
                  }}
                />
                <span style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "4px", whiteSpace: "nowrap" }}>
                  {idx % 4 === 0 ? d.date : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TABLEAU DES ENTREPRISES, FORFAITS ET ATTRIBUTION D'ABONNEMENTS */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "1.5rem", boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.05)", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-navy, #0b192c)" }}>
              Entreprises, Forfaits &amp; Soldes de Crédits ({filteredCompanies.length})
            </h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Gérez les forfaits clients ou attribuez manuellement un abonnement offert sans paiement.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
            {/* Barre de recherche */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: "0.75rem", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Rechercher entreprise, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.45rem 0.85rem 0.45rem 2.2rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.82rem", outline: "none", width: "220px" }}
              />
            </div>

            {/* Filtre de formule */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as any)}
              style={{ padding: "0.45rem 0.85rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.82rem", color: "#334155" }}
            >
              <option value="all">Tous les forfaits</option>
              <option value="paid">Payants actifs</option>
              <option value="gifted">Offerts par TruckMatch</option>
              <option value="free">Comptes Découverte</option>
              <option value="recruteur">Recruteur</option>
              <option value="transport_pro">Transport Pro</option>
              <option value="flotte_reseau">Flotte &amp; Réseau</option>
            </select>
          </div>
        </div>

        {/* Table Entreprises */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>Entreprise</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>Email pro</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>Forfait Actuel</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>Statut</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>Crédits</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>Débloqués</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700" }}>CA Encaissé</th>
                <th style={{ padding: "0.75rem 0.85rem", color: "#64748b", fontWeight: "700", textAlign: "right" }}>Actions</th>
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
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem" }}>
                      <strong style={{ color: "var(--color-navy, #0b192c)" }}>{c.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.city} ({c.postalCode})</div>
                    </td>
                    <td style={{ padding: "0.85rem" }}>
                      <code style={{ fontSize: "0.8rem", color: "#475569" }}>{c.email}</code>
                    </td>
                    <td style={{ padding: "0.85rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          background: c.isGifted
                            ? "#f3e8ff"
                            : c.subscriptionPlan !== "decouverte"
                            ? "#e0f2fe"
                            : "#f1f5f9",
                          color: c.isGifted
                            ? "#7e22ce"
                            : c.subscriptionPlan !== "decouverte"
                            ? "#0369a1"
                            : "#64748b",
                        }}
                      >
                        {c.isGifted ? `🎁 ${planName} (Offert)` : planName}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem" }}>
                      <span style={{ color: c.subscriptionStatus === "active" ? "#10b981" : "#f59e0b", fontWeight: "700" }}>
                        {c.subscriptionStatus === "active" ? "Actif" : c.subscriptionStatus}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem", fontWeight: "800", color: "#0080ff" }}>
                      {c.creditsBalance} cr.
                    </td>
                    <td style={{ padding: "0.85rem" }}>
                      {c.unlocksCount}
                    </td>
                    <td style={{ padding: "0.85rem", fontWeight: "700", color: "#10b981" }}>
                      {Number(c.totalPaidEur || 0).toFixed(2)} €
                    </td>
                    <td style={{ padding: "0.85rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        {/* Bouton Attribuer / Modifier abonnement offert */}
                        <button
                          type="button"
                          onClick={() => {
                            setGiftTargetCompany(c);
                            setIsGiftModalOpen(true);
                          }}
                          style={{
                            padding: "0.35rem 0.65rem",
                            borderRadius: "8px",
                            border: "1px solid #c084fc",
                            background: "#faf5ff",
                            color: "#7e22ce",
                            fontSize: "0.78rem",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                          title="Attribuer manuellement un abonnement offert (0 €)"
                        >
                          <Gift size={13} />
                          <span>{c.isGifted ? "Modifier Offre" : "Offrir Forfait"}</span>
                        </button>

                        {c.isGifted && (
                          <button
                            type="button"
                            onClick={() => handleRevokeGift(c.id)}
                            style={{
                              padding: "0.35rem 0.55rem",
                              borderRadius: "8px",
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              fontSize: "0.78rem",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                            title="Révoquer l'abonnement offert"
                          >
                            Révoquer
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
      </div>

      {/* 5. MODALE : ATTRIBUER UN ABONNEMENT OFFERT (RÈGLE MÉTIER STRICTE : 0 € DE CA) */}
      {isGiftModalOpen && giftTargetCompany && (
        <div className="admin-gift-modal-backdrop">
          <div className="admin-gift-modal-card">
            <button
              type="button"
              onClick={() => {
                setIsGiftModalOpen(false);
                setGiftTargetCompany(null);
              }}
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
              <div style={{ width: 42, height: 42, borderRadius: "12px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Gift size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--color-navy, #0b192c)" }}>
                  Attribuer un abonnement offert
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Entreprise : <strong>{giftTargetCompany.name}</strong> ({giftTargetCompany.email})
                </span>
              </div>
            </div>

            <div className="admin-gift-alert-warning">
              ⚖️ <strong>Règle comptable impérative :</strong> L&apos;abonnement offert ne déclenche aucun paiement, n&apos;ajoute aucun montant au chiffre d&apos;affaires encaissé (0,00 €) et est journalisé dans les audits de sécurité.
            </div>

            <form onSubmit={handleConfirmGift} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Forfait à attribuer gratuitement :
                </label>
                <select
                  value={giftForm.planId}
                  onChange={(e) => setGiftForm({ ...giftForm, planId: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", fontWeight: "700" }}
                >
                  <option value="recruteur">Recruteur (2 offres, 3 crédits / mois)</option>
                  <option value="transport_pro">Transport Pro (5 offres, 10 crédits / mois, logo bandeau)</option>
                  <option value="flotte_reseau">Flotte &amp; Réseau (15 offres, 25 crédits / mois, visibilité max)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                    Durée de validité :
                  </label>
                  <select
                    value={giftForm.durationDays}
                    onChange={(e) => setGiftForm({ ...giftForm, durationDays: Number(e.target.value) })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  >
                    <option value={30}>30 jours (1 mois)</option>
                    <option value={60}>60 jours (2 mois)</option>
                    <option value={90}>90 jours (3 mois)</option>
                    <option value={180}>180 jours (6 mois)</option>
                    <option value={365}>365 jours (1 an)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                    Motif administratif obligatoire :
                  </label>
                  <select
                    value={giftForm.reason}
                    onChange={(e) => setGiftForm({ ...giftForm, reason: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
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
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Commentaire interne (Audit log) :
                </label>
                <textarea
                  rows={2}
                  placeholder="Justification de l'attribution pour l'administration..."
                  value={giftForm.notes}
                  onChange={(e) => setGiftForm({ ...giftForm, notes: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b", fontWeight: "700", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={giftLoading}
                  style={{ flex: 2, padding: "0.75rem", borderRadius: "10px", border: "none", background: "#9333ea", color: "#ffffff", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  {giftLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <Gift size={16} />
                      <span>Confirmer l&apos;abonnement offert</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODALE : CONFIGURATION FISCALE MICRO-ENTREPRISE */}
      {isTaxModalOpen && (
        <div className="admin-gift-modal-backdrop">
          <div className="admin-gift-modal-card">
            <button
              type="button"
              onClick={() => setIsTaxModalOpen(false)}
              style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
              <div style={{ width: 42, height: 42, borderRadius: "12px", background: "#e8f3ff", color: "#0080ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--color-navy, #0b192c)" }}>
                  Configuration Fiscale &amp; Facturation
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Régime de micro-entreprise et mentions légales applicables
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveTaxSettings} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer", background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <input
                  type="checkbox"
                  checked={taxForm.isVatExempt}
                  onChange={(e) => setTaxForm({ ...taxForm, isVatExempt: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-navy, #0b192c)" }}>
                  Franchise en base de TVA (Micro-Entreprise)
                </span>
              </label>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                  Mention légale de TVA sur factures et reçus :
                </label>
                <input
                  type="text"
                  value={taxForm.vatLegalNotice}
                  onChange={(e) => setTaxForm({ ...taxForm, vatLegalNotice: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                    Raison sociale légale :
                  </label>
                  <input
                    type="text"
                    value={taxForm.companyLegalName}
                    onChange={(e) => setTaxForm({ ...taxForm, companyLegalName: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                    Email de facturation :
                  </label>
                  <input
                    type="email"
                    value={taxForm.companyBillingEmail}
                    onChange={(e) => setTaxForm({ ...taxForm, companyBillingEmail: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={taxLoading}
                style={{ padding: "0.75rem", borderRadius: "10px", border: "none", background: "var(--color-primary, #0080ff)", color: "#ffffff", fontWeight: "800", cursor: "pointer", marginTop: "0.5rem" }}
              >
                {taxLoading ? "Enregistrement..." : "Enregistrer la configuration fiscale"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. JOURNAL D'AUDIT COMMERCIAL DES OPÉRATIONS SENSIBLES */}
      {auditLogs.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "1.5rem", boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.05)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-navy, #0b192c)", marginBottom: "0.85rem" }}>
            Historique d&apos;Audit Commercial &amp; Attributions Offertes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.82rem" }}>
            {auditLogs.map((log: any) => (
              <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.85rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div>
                  <strong>{log.action === "gift_subscription" ? "🎁 Abonnement offert" : log.action}</strong>
                  <span style={{ color: "#64748b", marginLeft: "0.5rem" }}>
                    → {log.target_company_name || "Entreprise"}
                  </span>
                  {log.details?.reason && (
                    <span style={{ color: "#9333ea", marginLeft: "0.5rem", fontWeight: "600" }}>
                      ({log.details.reason})
                    </span>
                  )}
                </div>
                <div style={{ color: "#94a3b8" }}>
                  Par {log.admin_email} • {new Date(log.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
