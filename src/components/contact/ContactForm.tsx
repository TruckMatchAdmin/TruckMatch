"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Phone,
  Tag,
  MessageSquare,
  Sparkles,
  Flame,
} from "lucide-react";

export function ContactForm() {
  const [userType, setUserType] = useState<"entreprise" | "chauffeur" | "autre">("entreprise");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          name,
          phone,
          email,
          subject,
          message,
          priority: isUrgent ? "urgente" : "normal",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue lors de l'envoi.");
      }

      setSuccessTicket(data.ticketNumber);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsUrgent(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-card">
      <div className="contact-form-head">
        <div className="contact-form-head-title">
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-primary, #0080ff)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Sparkles size={14} />
            <span>Formulaire de Contact Direct</span>
          </span>
          <h2>Envoyez-nous votre message</h2>
        </div>
        <div className="contact-form-head-badge">
          <span className="cat-pulse-dot" />
          <span>Réponse garantie &lt; 24h</span>
        </div>
      </div>

      {successTicket ? (
        <div className="contact-success-box">
          <div className="contact-success-head">
            <CheckCircle2 size={24} color="#059669" />
            <span>Demande transmise avec succès !</span>
          </div>
          <p style={{ fontSize: "0.92rem", lineHeight: "1.6", margin: "0.5rem 0" }}>
            Votre message a été envoyé directement à notre équipe support et archivé sous la référence :
          </p>
          <div className="contact-success-ticket">
            {successTicket}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#047857", lineHeight: "1.5", margin: "0.75rem 0 1.25rem" }}>
            Une notification prioritaire a été transmise instantanément à la permanence d'exploitation TruckMatch via notre bot Telegram d'administration.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <a
              href={`mailto:jobs@truckmatch.fr?subject=Suivi%20Ticket%20${encodeURIComponent(successTicket)}`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.85rem", padding: "0.6rem 1rem", borderRadius: "10px" }}
            >
              <Mail size={14} />
              <span>Envoyer un complément par email</span>
            </a>
            <button
              type="button"
              onClick={() => setSuccessTicket(null)}
              className="btn btn-primary btn-sm"
              style={{ fontSize: "0.85rem", padding: "0.6rem 1rem", borderRadius: "10px" }}
            >
              Envoyer un nouveau message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form-fields">
          {errorMsg && (
            <div className="contact-error-box">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sélecteur de type d'utilisateur */}
          <div className="contact-type-selector">
            <label className="contact-type-label">Vous représentez :</label>
            <div className="contact-type-buttons">
              <button
                type="button"
                className={`contact-type-btn ${userType === "entreprise" ? "active" : ""}`}
                onClick={() => setUserType("entreprise")}
              >
                🏢 Entreprise / Recruteur
              </button>
              <button
                type="button"
                className={`contact-type-btn ${userType === "chauffeur" ? "active" : ""}`}
                onClick={() => setUserType("chauffeur")}
              >
                🚛 Conducteur / Chauffeur
              </button>
              <button
                type="button"
                className={`contact-type-btn ${userType === "autre" ? "active" : ""}`}
                onClick={() => setUserType("autre")}
              >
                💬 Autre demande
              </button>
            </div>
          </div>

          {/* Nom & Téléphone */}
          <div className="contact-form-row">
            <div className="contact-field-group">
              <label className="contact-field-label">Nom complet ou Société *</label>
              <div className="contact-input-wrap">
                <User size={16} className="contact-input-icon" />
                <input
                  type="text"
                  placeholder="Jean Dupont / Transports Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="contact-input"
                />
              </div>
            </div>

            <div className="contact-field-group">
              <label className="contact-field-label">Téléphone de contact</label>
              <div className="contact-input-wrap">
                <Phone size={16} className="contact-input-icon" />
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="contact-input"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="contact-field-group">
            <label className="contact-field-label">Adresse email professionnelle *</label>
            <div className="contact-input-wrap">
              <Mail size={16} className="contact-input-icon" />
              <input
                type="email"
                placeholder="contact@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="contact-input"
              />
            </div>
          </div>

          {/* Sujet */}
          <div className="contact-field-group">
            <label className="contact-field-label">Objet de la demande *</label>
            <div className="contact-input-wrap">
              <Tag size={16} className="contact-input-icon" />
              <input
                type="text"
                placeholder="Ex : Recrutement urgent chauffeur SPL, renseignement profil..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="contact-input"
              />
            </div>
          </div>

          {/* Message */}
          <div className="contact-field-group">
            <label className="contact-field-label">Message détaillé *</label>
            <textarea
              placeholder="Précisez votre demande, secteur géographique, type de véhicule ou tournées concernées..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="contact-textarea"
            />
          </div>

          {/* Urgence checkbox */}
          <label className="contact-urgent-card">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="contact-urgent-checkbox"
            />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Flame size={18} color="#f59e0b" />
              <span className="contact-urgent-text">
                Besoin urgent (Recrutement ou remplacement sous 24h)
              </span>
            </div>
          </label>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="contact-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Transmission directe en cours...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Envoyer ma demande à TruckMatch</span>
              </>
            )}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--color-text-muted, #64748b)", marginTop: "0.5rem" }}>
            Vous préférez votre messagerie par défaut ?{" "}
            <a
              href="mailto:jobs@truckmatch.fr"
              style={{ color: "var(--color-primary, #0080ff)", fontWeight: "700", textDecoration: "underline" }}
            >
              Écrire directement à jobs@truckmatch.fr
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
