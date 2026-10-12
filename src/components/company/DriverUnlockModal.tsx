"use client";

import React, { useState } from "react";
import {
  Unlock,
  ShieldCheck,
  Check,
  X,
  Zap,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";

export interface DriverUnlockModalProps {
  driver: any;
  creditsBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: (driverId: string, updatedBalance: number) => void;
  onGoToBuyCredits: () => void;
}

export function DriverUnlockModal({
  driver,
  creditsBalance,
  isOpen,
  onClose,
  onSuccessUnlock,
  onGoToBuyCredits,
}: DriverUnlockModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !driver) return null;

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

  const hasCredits = creditsBalance >= 1;

  return (
    <div className="commercial-modal-backdrop">
      <div className="commercial-modal-card">
        {/* Bouton fermeture */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
            <Unlock size={22} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "#38bdf8", letterSpacing: "0.05em" }}>
              Déblocage de coordonnées directes
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff", marginTop: "0.15rem" }}>
              {driver.first_name} {driver.last_name ? `${driver.last_name.charAt(0)}.` : ""}
            </h3>
          </div>
        </div>

        <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "1.25rem" }}>
          Ce déblocage vous donne un accès direct, immédiat et sans intermédiaire aux informations de contact de ce professionnel de la route :
        </p>

        {/* Liste des éléments débloqués */}
        <div style={{ background: "#070e1a", border: "1px solid #142236", borderRadius: "14px", padding: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.85rem", color: "#e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <Phone size={15} color="#10b981" />
              <span>Numéro de téléphone direct vérifié (Appel &amp; SMS)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <Mail size={15} color="#38bdf8" />
              <span>Adresse email professionnelle du conducteur</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <FileText size={15} color="#a855f7" />
              <span>Nom complet &amp; téléchargement du CV original (si disponible)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <MessageSquare size={15} color="#f59e0b" />
              <span>Accès illimité au tchat privé direct sur TruckMatch</span>
            </div>
          </div>
        </div>

        {/* Solde & Coût */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a1526", border: "1px solid #1c3254", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block" }}>Votre solde actuel</span>
            <strong style={{ fontSize: "1.1rem", color: "#38bdf8", fontFamily: "monospace" }}>{creditsBalance} crédits</strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block" }}>Coût du déblocage</span>
            <strong style={{ fontSize: "1.1rem", color: "#10b981", fontFamily: "monospace" }}>1 crédit</strong>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1.25rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Boutons d'action */}
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
              style={{ flex: 2, padding: "0.75rem", borderRadius: "10px", background: "#0284c7", border: "none", color: "#ffffff", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Déblocage en cours...</span>
                </>
              ) : (
                <>
                  <Unlock size={16} />
                  <span>Débloquer avec 1 crédit</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", padding: "0.85rem", fontSize: "0.82rem", color: "#fbbf24", marginBottom: "1rem" }}>
              Votre solde est de 0 crédit. Vous devez acquérir un pack ou souscrire un forfait pour débloquer ce candidat.
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToBuyCredits();
              }}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", background: "#0284c7", border: "none", color: "#fff", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <Zap size={16} />
              <span>Acheter des crédits (dès 19 €)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
