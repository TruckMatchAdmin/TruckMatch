"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Zap,
  ShieldCheck,
  Check,
  Crown,
  Layers,
  ArrowRight,
  Clock,
  FileText,
  Search,
  MessageSquare,
  Sparkles,
  Award,
  AlertCircle,
  Truck,
  ExternalLink,
  ChevronRight,
  Loader2,
  Lock,
  Unlock,
  Building2,
  Users,
  Flame,
  CheckCircle2,
} from "lucide-react";

export const DEFAULT_PLANS = [
  {
    id: "decouverte",
    name: "Découverte",
    price_eur: 0,
    max_active_jobs: 0,
    monthly_credits: 0,
    has_chat: false,
    priority_badge: "Gratuit",
    features: [
      "Page entreprise & logo",
      "Coordonnées publiques des candidats",
      "Achat de crédits à l'unité",
    ],
  },
  {
    id: "recruteur",
    name: "Recruteur",
    price_eur: 39,
    max_active_jobs: 2,
    monthly_credits: 3,
    has_chat: true,
    priority_badge: "Essentiel",
    features: [
      "Jusqu'à 2 offres d'emploi actives",
      "3 crédits de déblocage inclus par mois",
      "Recherche autonome dans la base",
      "Tchat direct avec les candidats débloqués",
      "Coordonnées complètes débloquées",
    ],
  },
  {
    id: "transport_pro",
    name: "Transport Pro",
    price_eur: 79,
    max_active_jobs: 5,
    monthly_credits: 10,
    has_chat: true,
    priority_badge: "Populaire",
    features: [
      "Jusqu'à 5 offres d'emploi actives",
      "10 crédits de déblocage inclus par mois",
      "Recherche avancée dans le vivier",
      "Logo dans le bandeau publicitaire",
      "Page entreprise mise en valeur",
      "Tchat direct avec les candidats",
    ],
  },
  {
    id: "flotte_reseau",
    name: "Flotte & Réseau",
    price_eur: 149,
    max_active_jobs: 15,
    monthly_credits: 25,
    has_chat: true,
    priority_badge: "Premium",
    features: [
      "Jusqu'à 15 offres d'emploi actives",
      "25 crédits de déblocage inclus par mois",
      "Toutes les fonctions de recherche",
      "Tchat direct avec les candidats débloqués",
      "Visibilité publicitaire renforcée",
      "Page entreprise premium",
      "Tarif préférentiel pour les missions de recherche",
    ],
  },
];

export interface CompanyBillingProps {
  company: any;
  onRefreshCompany: () => void;
  onOpenChatWithDriver?: (driverId: string) => void;
}

export function CompanyBillingModule({
  company,
  onRefreshCompany,
  onOpenChatWithDriver,
}: CompanyBillingProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "subscription" | "credits" | "unlocked" | "ads" | "missions" | "invoices"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [commercialData, setCommercialData] = useState<any>(null);

  // Formulaire Mission de recherche
  const [missionForm, setMissionForm] = useState({
    driverCount: 1,
    permitRequired: "CE",
    vehicleType: "Semi-remorque Tautliner",
    regions: "Île-de-France (75, 77, 91, 93, 94)",
    contractType: "CDI",
    experienceRequired: "2 ans minimum",
    startDate: "Immédiat",
    isUrgent: false,
    description: "",
  });

  // Formulaire Campagne publicitaire
  const [adForm, setAdForm] = useState({
    campaignType: "banner_logo",
    title: "",
    logoUrl: "",
    targetUrl: "",
  });

  const loadCommercialData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/commercial");
      if (res.ok) {
        const json = await res.json();
        setCommercialData(json);
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
    loadCommercialData();
  }, []);

  // Souscrire / Changer d'abonnement
  const handleSubscribe = async (planId: string) => {
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe_plan",
          data: { planId },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de la souscription.");
      }
      setSuccessMsg(data.message);
      await loadCommercialData();
      onRefreshCompany();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Acheter pack de crédits
  const handleBuyCredits = async (packSize: number) => {
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buy_credits",
          data: { packSize },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de l'achat de crédits.");
      }
      setSuccessMsg(data.message);
      await loadCommercialData();
      onRefreshCompany();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Commander mission de recherche
  const handleSubmitMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "order_search_mission",
          data: {
            ...missionForm,
            regions: [missionForm.regions],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de la commande de mission.");
      }
      setSuccessMsg(data.message);
      await loadCommercialData();
      setActiveTab("missions");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Commander campagne publicitaire
  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "order_ad_campaign",
          data: adForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de la commande publicitaire.");
      }
      setSuccessMsg(data.message);
      await loadCommercialData();
      setActiveTab("ads");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const plans = (commercialData?.plans && commercialData.plans.length > 0)
    ? commercialData.plans
    : DEFAULT_PLANS;
  const currentPlanId = commercialData?.company?.subscription_plan || company?.subscription_plan || "transport_pro";
  const currentPlan = commercialData?.currentPlan || plans.find((p: any) => p.id === currentPlanId) || plans[0] || {};
  const creditsBalance = commercialData?.company?.credits_balance ?? (company?.credits_balance ?? 0);
  const isGifted = commercialData?.company?.is_subscription_gifted || company?.is_subscription_gifted || false;
  const unlockedDrivers = commercialData?.unlockedDrivers || [];
  const orders = commercialData?.orders || [];
  const searchMissions = commercialData?.searchMissions || [];
  const adCampaigns = commercialData?.adCampaigns || [];
  const taxSettings = commercialData?.taxSettings || {
    company_legal_name: "TruckMatch",
    is_vat_exempt: true,
    vat_legal_notice: "TVA non applicable, art. 293 B du CGI",
  };

  return (
    <div className="commercial-dark-container">
      {/* 1. HEADER DU MODULE COMMERCIAL */}
      <div className="commercial-dark-header">
        <div className="commercial-dark-title-wrap">
          <h1>
            <Crown size={22} color="#38bdf8" />
            <span>Abonnement &amp; Crédits Recruteur</span>
          </h1>
          <p>
            Gérez votre forfait, votre solde de crédits de déblocage et vos campagnes de recrutement.
          </p>
        </div>

        <div className="commercial-balance-pill">
          <div>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
              Solde disponible
            </span>
            <span className="credits-count">{creditsBalance} crédits</span>
          </div>
          <span className="plan-badge">
            {isGifted ? "Offert par TruckMatch" : currentPlan.name || "Découverte"}
          </span>
        </div>
      </div>

      {/* Notifications retour */}
      {errorMsg && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "0.85rem 1.25rem", borderRadius: "12px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.65rem", fontSize: "0.88rem" }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#6ee7b7", padding: "0.85rem 1.25rem", borderRadius: "12px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.65rem", fontSize: "0.88rem" }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. NAVIGATION PAR 7 ONGLETS */}
      <div className="commercial-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`commercial-tab-btn ${activeTab === "overview" ? "active" : ""}`}
        >
          <Layers size={16} />
          <span>Vue d'ensemble</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={`commercial-tab-btn ${activeTab === "subscription" ? "active" : ""}`}
        >
          <Crown size={16} />
          <span>Mon abonnement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("credits")}
          className={`commercial-tab-btn ${activeTab === "credits" ? "active" : ""}`}
        >
          <Zap size={16} />
          <span>Acheter des crédits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unlocked")}
          className={`commercial-tab-btn ${activeTab === "unlocked" ? "active" : ""}`}
        >
          <Unlock size={16} />
          <span>Profils débloqués ({unlockedDrivers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ads")}
          className={`commercial-tab-btn ${activeTab === "ads" ? "active" : ""}`}
        >
          <Sparkles size={16} />
          <span>Publicité &amp; Visibilité</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("missions")}
          className={`commercial-tab-btn ${activeTab === "missions" ? "active" : ""}`}
        >
          <Search size={16} />
          <span>Recherche de chauffeurs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`commercial-tab-btn ${activeTab === "invoices" ? "active" : ""}`}
        >
          <FileText size={16} />
          <span>Factures &amp; Paiements</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 1 : VUE D'ENSEMBLE                                         */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "overview" && (
        <div>
          {/* Cartes KPI récapitulatives */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "14px", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                Forfait Actuel
              </span>
              <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#ffffff", marginTop: "0.35rem" }}>
                {currentPlan.name || "Découverte"}
              </div>
              <div style={{ fontSize: "0.8rem", color: isGifted ? "#34d399" : "#38bdf8", marginTop: "0.25rem" }}>
                {isGifted ? "Offert par l'administration" : `Prix à payer : ${currentPlan.price_eur || 0} € / mois`}
              </div>
            </div>

            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "14px", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                Solde de Crédits
              </span>
              <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#38bdf8", marginTop: "0.35rem" }}>
                {creditsBalance} crédits
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                1 crédit = 1 profil complet débloqué
              </div>
            </div>

            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "14px", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                Candidats Débloqués
              </span>
              <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#10b981", marginTop: "0.35rem" }}>
                {unlockedDrivers.length} contact(s)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                Coordonnées et tchat accessibles
              </div>
            </div>

            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "14px", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
                Offres Actives Autorisées
              </span>
              <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#ffffff", marginTop: "0.35rem" }}>
                {currentPlan.max_active_jobs || 0} offre(s)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                Incluses dans votre forfait
              </div>
            </div>
          </div>

          {/* Raccourcis d'action */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.75rem" }}>
                <Zap size={20} color="#38bdf8" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>Besoin de crédits ?</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.5", marginBottom: "1.25rem" }}>
                Débloquez immédiatement les numéros de téléphone et emails des conducteurs sans attendre votre prochain renouvellement.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("credits")}
                className="btn-subscribe"
                style={{ width: "auto", padding: "0.6rem 1.25rem" }}
              >
                Acheter un pack de crédits
              </button>
            </div>

            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.75rem" }}>
                <Search size={20} color="#10b981" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>Recherche personnalisée</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.5", marginBottom: "1.25rem" }}>
                Confiez votre recherche de chauffeurs routiers à notre équipe de sourcing spécialisée (recherche dès 149 €).
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("missions")}
                className="btn-subscribe"
                style={{ width: "auto", padding: "0.6rem 1.25rem", background: "#059669" }}
              >
                Commander une recherche
              </button>
            </div>
          </div>

          {/* Mention fiscale légale */}
          <div style={{ background: "#070e1a", border: "1px solid #142236", borderRadius: "12px", padding: "1rem 1.25rem", fontSize: "0.8rem", color: "#64748b" }}>
            ⚖️ <strong>Régime fiscal :</strong> {taxSettings.company_legal_name || "TruckMatch"} est exploité sous le régime de la micro-entreprise.
            {taxSettings.is_vat_exempt && (
              <span> {taxSettings.vat_legal_notice || "TVA non applicable, art. 293 B du CGI"}. Tous les montants indiqués sont les prix nets à payer.</span>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 2 : MON ABONNEMENT (LES 4 FORFAITS)                         */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "subscription" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
              Choisissez la formule adaptée à votre rythme de recrutement
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Sans engagement de durée. Quotas et crédits renouvelés automatiquement chaque mois.
            </p>
          </div>

          <div className="commercial-plans-grid">
            {plans.map((p: any) => {
              const isCurrent = (commercialData?.company?.subscription_plan || "decouverte") === p.id;
              const features = Array.isArray(p.features) ? p.features : [];

              return (
                <div key={p.id} className={`commercial-plan-card ${isCurrent ? "current" : ""}`}>
                  {p.priority_badge && (
                    <span className="commercial-plan-badge-top">{p.priority_badge}</span>
                  )}

                  <h3 className="commercial-plan-title">{p.name}</h3>

                  <div className="commercial-price-box">
                    <div className="commercial-price-main">
                      {p.price_eur === 0 ? "Gratuit" : `${p.price_eur} €`}
                    </div>
                    <div className="commercial-price-label">
                      {p.price_eur === 0 ? "Sans carte bancaire" : "Prix à payer / mois"}
                    </div>
                  </div>

                  <ul className="commercial-features-list">
                    {features.map((feat: string, idx: number) => (
                      <li key={idx} className="commercial-feature-item">
                        <Check size={16} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button type="button" disabled className="btn-subscribe current-btn">
                      {isGifted ? "✓ Forfait Offert Actif" : "✓ Forfait Actuel"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSubscribe(p.id)}
                      className="btn-subscribe"
                    >
                      {actionLoading ? "Traitement..." : `Choisir ${p.name}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 3 : ACHETER DES CRÉDITS                                    */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "credits" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
              Packs de crédits de déblocage sans abonnement
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Les crédits n'expirent pas dans le mois. Un même candidat débloqué reste accessible à vie sans surcoût.
            </p>
          </div>

          <div className="credits-packs-grid">
            {[
              { size: 5, price: 19, label: "Idéal pour 1 ou 2 recrutements ponctuels" },
              { size: 15, price: 49, popular: true, label: "Le plus populaire — 3,26 € par profil" },
              { size: 40, price: 99, label: "Grand volume — Meilleur tarif (2,47 € par profil)" },
            ].map((pack) => (
              <div key={pack.size} className="credits-pack-card" style={pack.popular ? { borderColor: "#0284c7" } : {}}>
                {pack.popular && (
                  <span style={{ display: "inline-block", background: "#0284c7", color: "#fff", fontSize: "0.72rem", fontWeight: "800", padding: "0.2rem 0.65rem", borderRadius: "9999px", marginBottom: "0.75rem" }}>
                    Recommandé
                  </span>
                )}
                <div className="credits-pack-badge">{pack.size} Crédits</div>
                <div className="credits-pack-price">Prix à payer : {pack.price} €</div>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem", minHeight: "36px" }}>
                  {pack.label}
                </p>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleBuyCredits(pack.size)}
                  className="btn-subscribe"
                >
                  {actionLoading ? "Validation..." : `Acheter ${pack.size} crédits (${pack.price} €)`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 4 : PROFILS DÉBLOQUÉS                                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "unlocked" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
              Vos candidats débloqués ({unlockedDrivers.length})
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Coordonnées directes et canal de tchat privé permanent avec ces professionnels.
            </p>
          </div>

          {unlockedDrivers.length === 0 ? (
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              <Lock size={36} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
              <h3 style={{ color: "#ffffff", fontWeight: "800", marginBottom: "0.5rem" }}>
                Aucun profil débloqué pour le moment
              </h3>
              <p style={{ maxWidth: "480px", margin: "0 auto 1.5rem", fontSize: "0.88rem" }}>
                Rendez-vous dans le module « Vivier Chauffeurs Direct » pour débloquer les coordonnées d'un conducteur avec vos crédits.
              </p>
            </div>
          ) : (
            <div className="commercial-dark-table-card">
              <table className="commercial-table">
                <thead>
                  <tr>
                    <th>Conducteur</th>
                    <th>Permis</th>
                    <th>Localisation</th>
                    <th>Téléphone Direct</th>
                    <th>Email</th>
                    <th>Débloqué le</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unlockedDrivers.map((item: any) => {
                    const d = item.drivers || {};
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{d.first_name} {d.last_name}</strong>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", gap: "0.25rem" }}>
                            {(d.permits || []).join(", ") || "CE"}
                          </span>
                        </td>
                        <td>{d.city} ({d.postal_code})</td>
                        <td>
                          <a href={`tel:${d.phone}`} style={{ color: "#38bdf8", fontWeight: "700" }}>
                            {d.phone || "Non renseigné"}
                          </a>
                        </td>
                        <td>
                          <a href={`mailto:${d.email}`} style={{ color: "#94a3b8" }}>
                            {d.email || "Non renseigné"}
                          </a>
                        </td>
                        <td>{new Date(item.unlocked_at).toLocaleDateString("fr-FR")}</td>
                        <td>
                          {onOpenChatWithDriver && (
                            <button
                              type="button"
                              onClick={() => onOpenChatWithDriver(d.id)}
                              style={{ background: "#0284c7", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                            >
                              <MessageSquare size={13} />
                              <span>Tchat</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 5 : PUBLICITÉ & VISIBILITÉ                                 */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "ads" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
              Campagnes publicitaires &amp; visibilité entreprise
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Augmentez la notoriété de votre flotte auprès de milliers de conducteurs routiers qualifiés.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
            {/* Formulaire de commande pub */}
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff", marginBottom: "1rem" }}>
                Lancer une campagne de visibilité
              </h3>

              <form onSubmit={handleSubmitAd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Formule de visibilité :
                  </label>
                  <select
                    value={adForm.campaignType}
                    onChange={(e) => setAdForm({ ...adForm, campaignType: e.target.value })}
                    style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                  >
                    <option value="banner_logo">Logo dans le bandeau défilant — Prix à payer : 29 € / mois</option>
                    <option value="priority_logo">Logo prioritaire en tête — Prix à payer : 59 € / mois</option>
                    <option value="featured_company">Entreprise à la une (Page d'accueil) — Prix à payer : 99 € / mois</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Titre ou Nom affiché :
                  </label>
                  <input
                    type="text"
                    placeholder={company?.company_name || "Transports Exemple"}
                    value={adForm.title}
                    onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                    style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Lien vers votre site web ou offre :
                  </label>
                  <input
                    type="url"
                    placeholder="https://votre-entreprise.fr"
                    value={adForm.targetUrl}
                    onChange={(e) => setAdForm({ ...adForm, targetUrl: e.target.value })}
                    style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-subscribe"
                  style={{ marginTop: "0.5rem" }}
                >
                  {actionLoading ? "Traitement..." : "Confirmer et activer la campagne"}
                </button>
              </form>
            </div>

            {/* Historique campagnes */}
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff", marginBottom: "1rem" }}>
                Vos campagnes actives ({adCampaigns.length})
              </h3>
              {adCampaigns.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Aucune campagne en cours. Activez votre visibilité dès aujourd'hui.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {adCampaigns.map((c: any) => (
                    <div key={c.id} style={{ padding: "0.85rem", borderRadius: "10px", background: "#070d17", border: "1px solid #17263c", fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#fff" }}>
                        <span>{c.title}</span>
                        <span style={{ color: "#10b981" }}>Active</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                        Échéance : {new Date(c.expires_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 6 : RECHERCHE DE CHAUFFEURS                                */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "missions" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
              Missions de recherche et présélection de conducteurs
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Confiez votre besoin urgent à nos experts en transport : nous sourçons, qualifions et validons les profils pour vous.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
            {/* Formulaire de commande */}
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff", marginBottom: "1rem" }}>
                Commander une mission de recherche
              </h3>

              <form onSubmit={handleSubmitMission} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                      Nombre de chauffeurs :
                    </label>
                    <select
                      value={missionForm.driverCount}
                      onChange={(e) => setMissionForm({ ...missionForm, driverCount: Number(e.target.value) })}
                      style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                    >
                      <option value={1}>1 chauffeur — Prix à payer : 149 €</option>
                      <option value={3}>3 chauffeurs — Prix à payer : 399 €</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                      Permis requis :
                    </label>
                    <select
                      value={missionForm.permitRequired}
                      onChange={(e) => setMissionForm({ ...missionForm, permitRequired: e.target.value })}
                      style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                    >
                      <option value="CE">Permis CE (SPL)</option>
                      <option value="C">Permis C (PL)</option>
                      <option value="BE">Permis BE (Remorque)</option>
                      <option value="B">Permis B (VUL)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Régions &amp; Départements ciblés :
                  </label>
                  <input
                    type="text"
                    value={missionForm.regions}
                    onChange={(e) => setMissionForm({ ...missionForm, regions: e.target.value })}
                    required
                    style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                      Contrat :
                    </label>
                    <select
                      value={missionForm.contractType}
                      onChange={(e) => setMissionForm({ ...missionForm, contractType: e.target.value })}
                      style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Traction">Traction régulière</option>
                      <option value="Remplacement">Remplacement urgent</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                      Type de matériel :
                    </label>
                    <input
                      type="text"
                      value={missionForm.vehicleType}
                      onChange={(e) => setMissionForm({ ...missionForm, vehicleType: e.target.value })}
                      style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Description précise du besoin :
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Horaires de tournée, type de marchandises, compétences ADR ou grue requises..."
                    value={missionForm.description}
                    onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })}
                    style={{ width: "100%", background: "#070d17", border: "1px solid #1c2e47", color: "#fff", padding: "0.65rem", borderRadius: "8px", fontSize: "0.88rem", resize: "vertical" }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer", fontSize: "0.85rem", color: "#f59e0b" }}>
                  <input
                    type="checkbox"
                    checked={missionForm.isUrgent}
                    onChange={(e) => setMissionForm({ ...missionForm, isUrgent: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Mission urgente (Démarrage sous 24-48h souhaité)</span>
                </label>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-subscribe"
                  style={{ background: "#059669", marginTop: "0.5rem" }}
                >
                  {actionLoading ? "Traitement..." : `Payer et lancer la recherche (${missionForm.driverCount === 3 ? "399 €" : "149 €"})`}
                </button>
              </form>
            </div>

            {/* Suivi des missions commandées */}
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#ffffff", marginBottom: "1rem" }}>
                Missions en cours ({searchMissions.length})
              </h3>
              {searchMissions.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Aucune mission active. Les missions payées démarrent sous 24h.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {searchMissions.map((m: any) => (
                    <div key={m.id} style={{ padding: "0.85rem", borderRadius: "10px", background: "#070d17", border: "1px solid #17263c", fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#fff" }}>
                        <span>{m.mission_number}</span>
                        <span style={{ color: "#38bdf8", textTransform: "capitalize" }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "0.25rem" }}>
                        {m.driver_count} chauffeur(s) {m.permit_required} ({m.contract_type})
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                        Commandée le : {new Date(m.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ONGLET 7 : FACTURES & PAIEMENTS                                   */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "invoices" && (
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
              Historique des transactions &amp; justificatifs
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Retrouvez toutes vos commandes avec les mentions légales et fiscales en vigueur.
            </p>
          </div>

          {orders.length === 0 ? (
            <div style={{ background: "#0a1322", border: "1px solid #17263c", borderRadius: "16px", padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              <FileText size={36} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
              <h3 style={{ color: "#ffffff", fontWeight: "800", marginBottom: "0.5rem" }}>
                Aucune facture pour le moment
              </h3>
              <p style={{ fontSize: "0.88rem" }}>
                Vos achats apparaîtront automatiquement ici dès confirmation.
              </p>
            </div>
          ) : (
            <div className="commercial-dark-table-card">
              <table className="commercial-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Date</th>
                    <th>Produit</th>
                    <th>Montant payé</th>
                    <th>Mode</th>
                    <th>Statut</th>
                    <th>Reçu</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id}>
                      <td><code style={{ color: "#38bdf8" }}>{o.order_number}</code></td>
                      <td>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                      <td><strong>{o.product_name}</strong></td>
                      <td>
                        <strong>{Number(o.total_paid || o.amount_eur || 0).toFixed(2)} €</strong>
                      </td>
                      <td>{o.payment_method || "Carte"}</td>
                      <td>
                        <span style={{ color: o.status === "paid" ? "#10b981" : "#f59e0b", fontWeight: "700" }}>
                          {o.status === "paid" ? "Payé" : o.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {taxSettings.vat_legal_notice || "TVA non applicable"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
