"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [userType, setUserType] = useState("entreprise");
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
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccessTicket(data.ticketNumber);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsUrgent(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-card card">
      <h2 className="form-head">Envoyez-nous un message</h2>
      <p className="form-desc">Notre équipe vous répond sous 24h ouvrées.</p>

      {successTicket ? (
        <div className="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <div className="flex items-center gap-2 mb-2 font-bold text-emerald-200">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <span>Message envoyé avec succès !</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">
            Votre demande a été transmise directement à notre équipe sous la référence :
          </p>
          <div className="font-mono text-sm font-bold bg-slate-900/60 p-2 rounded border border-emerald-500/20 text-emerald-400">
            {successTicket}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Une alerte instantanée a été adressée à la permanence d'exploitation TruckMatch.
          </p>
          <button
            type="button"
            onClick={() => setSuccessTicket(null)}
            className="btn btn-outline btn-sm mt-3 text-xs"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-3 mb-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label>Vous êtes</label>
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
              <option value="entreprise">Une entreprise de transport / Recruteur</option>
              <option value="chauffeur">Un chauffeur routier / Candidat</option>
              <option value="autre">Autre demande</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nom et prénom</label>
              <input
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email de contact</label>
            <input
              type="email"
              placeholder="contact@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Sujet de votre message</label>
            <input
              type="text"
              placeholder="Ex: Renseignement recrutement SPL, profil chauffeur..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              rows={5}
              placeholder="Précisez votre demande..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 my-2 text-xs text-slate-300">
            <input
              type="checkbox"
              id="isUrgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="rounded border-slate-700 text-primary"
            />
            <label htmlFor="isUrgent" className="cursor-pointer select-none">
              Besoin urgent / Traitement prioritaire (transport routier)
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{loading ? "Envoi en cours..." : "Envoyer ma demande"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
