"use client";

import React, { useState } from "react";
import {
  Unlock,
  ShieldCheck,
  Check,
  CheckCircle2,
  X,
  Zap,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  AlertCircle,
  Loader2,
  Crown,
  Gift,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface DriverUnlockModalProps {
  driver: any;
  company?: any;
  currentPlan?: any;
  creditsBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: (driverId: string, updatedBalance: number) => void;
  onGoToBuyCredits: () => void;
  onGoToPlans?: () => void;
}

export function DriverUnlockModal({
  driver,
  company,
  currentPlan,
  creditsBalance,
  isOpen,
  onClose,
  onSuccessUnlock,
  onGoToBuyCredits,
  onGoToPlans,
}: DriverUnlockModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !driver) return null;

  const planId = company?.subscription_plan || "decouverte";
  const isGifted = company?.is_subscription_gifted || false;
  const isPlanActive = company?.subscription_status === "active";

  const planName = currentPlan?.name || (
    planId === "flotte_reseau" ? "Flotte & Réseau" :
    planId === "transport_pro" ? "Transport Pro" :
    planId === "recruteur" ? "Recruteur" : "Découverte"
  );

  const monthlyQuota = Number(currentPlan?.monthly_credits ?? (
    planId === "flotte_reseau" ? 25 :
    planId === "transport_pro" ? 10 :
    planId === "recruteur" ? 3 : 0
  ));

  const hasCredits = Number(creditsBalance || 0) >= 1;

  const handleUnlock = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/company/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unlock_driver",
          data: { driverId: driver.id },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible de débloquer ce candidat.");
      }
      onSuccessUnlock(driver.id, data.newCreditsBalance);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commercial-modal-backdrop">
      <div className="commercial-modal-card" style={{ maxWidth: "560px", background: "#0b1526", border: "1px solid #1c3254" }}>
        {/* Bouton fermeture */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* En-tête Chauffeur */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
          <div style={{ width: 46, height: 46, borderRadius: "14px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8", flexShrink: 0 }}>
            <Unlock size={22} />
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", color: "#38bdf8", letterSpacing: "0.06em" }}>
              Mise en relation directe &amp; Coordonnées
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "850", color: "#ffffff", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>{driver.first_name} {driver.last_name ? `${driver.last_name.charAt(0)}.` : ""}</span>
              <span style={{ fontSize: "0.72rem", padding: "0.15rem 0.55rem", borderRadius: "9999px", background: "#0284c7", color: "#ffffff", fontWeight: "800" }}>
                Permis {Array.isArray(driver.permits) ? driver.permits.join(", ") : driver.category || "CE"}
              </span>
            </h3>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.15rem" }}>
              📍 {driver.city || "Secteur régional"} {driver.postal_code ? `(${driver.postal_code})` : ""}
            </div>
          </div>
        </div>

        {/* 1. SECTION VÉRIFICATION ABONNEMENT EN COURS & QUOTAS */}
        <div style={{ background: "#060d17", border: "1px solid #14243b", borderRadius: "14px", padding: "1rem", marginBottom: "1.15rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #0f1d30" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: "800", color: "#e2e8f0" }}>
              <ShieldCheck size={16} className="text-sky-400" />
              <span>Vérification Forfait &amp; Quotas en cours</span>
            </div>
            {/* Badge Abonnement */}
            {planId !== "decouverte" ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  background: isGifted ? "rgba(168, 85, 247, 0.2)" : "rgba(2, 132, 199, 0.2)",
                  color: isGifted ? "#d8b4fe" : "#38bdf8",
                  border: `1px solid ${isGifted ? "rgba(168, 85, 247, 0.4)" : "rgba(2, 132, 199, 0.4)"}`,
                }}
              >
                {isGifted ? <Gift size={11} /> : <Crown size={11} />}
                <span>{planName} ({isGifted ? "Offert" : "Actif"})</span>
              </span>
            ) : (
              <span style={{ fontSize: "0.72rem", fontWeight: "700", padding: "0.2rem 0.6rem", borderRadius: "9999px", background: "rgba(100, 116, 139, 0.2)", color: "#94a3b8", border: "1px solid rgba(100, 116, 139, 0.3)" }}>
                Compte Découverte
              </span>
            )}
          </div>

          {/* Analyse des crédits et du quota */}
          {hasCredits ? (
            /* CAS A : Quota vérifié et suffisant */
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
              <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.82rem", color: "#d1fae5", lineHeight: 1.45 }}>
                <div style={{ fontWeight: "800", color: "#34d399", marginBottom: "0.15rem" }}>
                  Solde validé : Vous disposez de {creditsBalance} crédit(s) disponible(s).
                </div>
                <div>
                  Ce déblocage consommera <strong>1 crédit</strong> sur votre compte. Solde restant après opération : <strong style={{ color: "#38bdf8" }}>{creditsBalance - 1} crédit(s)</strong>.
                </div>
              </div>
            </div>
          ) : planId !== "decouverte" ? (
            /* CAS B : Quota du forfait mensuel épuisé */
            <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.35)", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
              <AlertCircle size={18} style={{ color: "#fbbf24", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.82rem", color: "#fef3c7", lineHeight: 1.45 }}>
                <div style={{ fontWeight: "800", color: "#fbbf24", marginBottom: "0.15rem" }}>
                  Quota mensuel atteint (0 crédit restant).
                </div>
                <div>
                  Votre forfait <strong>{planName}</strong> inclut {monthlyQuota} crédits par mois. Vous avez utilisé l&apos;intégralité de vos crédits inclus pour le cycle actuel.
                </div>
                <div style={{ marginTop: "0.35rem", fontSize: "0.76rem", color: "#fcd34d" }}>
                  👉 Rechargez un pack de crédits supplémentaires ou passez au forfait supérieur pour contacter ce conducteur immédiatement.
                </div>
              </div>
            </div>
          ) : (
            /* CAS C : Découverte sans crédits */
            <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
              <AlertCircle size={18} style={{ color: "#f87171", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.82rem", color: "#fee2e2", lineHeight: 1.45 }}>
                <div style={{ fontWeight: "800", color: "#f87171", marginBottom: "0.15rem" }}>
                  Aucun crédit disponible sur votre compte (Solde : 0).
                </div>
                <div>
                  Votre entreprise est en formule Découverte. Pour débloquer ce candidat et accéder à ses coordonnées directes, vous devez acquérir des crédits ou activer un forfait recruteur.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. CE QUE DONNE LE DÉBLOCAGE */}
        <div style={{ background: "#070e1a", border: "1px solid #142236", borderRadius: "14px", padding: "0.95rem 1rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.74rem", fontWeight: "800", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "0.65rem" }}>
            Informations débloquées en accès direct &amp; permanent :
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.82rem", color: "#e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Phone size={14} color="#10b981" />
              <span>Numéro de téléphone direct vérifié (Appel &amp; SMS)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Mail size={14} color="#38bdf8" />
              <span>Adresse email professionnelle du chauffeur</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <FileText size={14} color="#a855f7" />
              <span>Nom complet &amp; téléchargement du CV PDF original (si disponible)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <MessageSquare size={14} color="#f59e0b" />
              <span>Accès illimité au tchat direct sécurisé TruckMatch</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1.15rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3. BOUTONS D'ACTION SELON DISPONIBILITÉ DES CRÉDITS */}
        {hasCredits ? (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", fontWeight: "700", cursor: "pointer" }}
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleUnlock}
              style={{
                flex: 2,
                padding: "0.75rem",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                color: "#ffffff",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Déblocage en cours...</span>
                </>
              ) : (
                <>
                  <Unlock size={16} />
                  <span>Débloquer ce candidat (1 crédit déduit)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", fontWeight: "700", cursor: "pointer" }}
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToBuyCredits();
                }}
                style={{
                  flex: 2,
                  padding: "0.75rem",
                  borderRadius: "10px",
                  background: "#0284c7",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                }}
              >
                <Zap size={16} />
                <span>Recharger des crédits (dès 19 €)</span>
              </button>
            </div>

            {planId === "decouverte" ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onGoToPlans) onGoToPlans();
                  else onGoToBuyCredits();
                }}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  borderRadius: "9px",
                  background: "rgba(168, 85, 247, 0.15)",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  color: "#d8b4fe",
                  fontSize: "0.8rem",
                  fontWeight: "750",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                }}
              >
                <Crown size={14} className="text-purple-400" />
                <span>Découvrir les forfaits avec crédits mensuels inclus (dès 39 €/m)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onGoToPlans) onGoToPlans();
                  else onGoToBuyCredits();
                }}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  borderRadius: "9px",
                  background: "rgba(2, 132, 199, 0.12)",
                  border: "1px solid rgba(2, 132, 199, 0.3)",
                  color: "#7dd3fc",
                  fontSize: "0.8rem",
                  fontWeight: "750",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                }}
              >
                <Crown size={14} className="text-sky-400" />
                <span>Passer au forfait supérieur pour augmenter votre quota mensuel</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
