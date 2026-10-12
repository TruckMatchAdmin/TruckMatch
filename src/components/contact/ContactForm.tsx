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
  Clock,
  Sparkles,
  ExternalLink,
  Flame,
} from "lucide-react";
import { FacebookIcon, TelegramIcon } from "@/components/ui/SocialIcons";

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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Halo gradient en arrière-plan */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>Formulaire de Contact Direct</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Envoyez-nous votre message
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Réponse garantie &lt; 24h</span>
          </div>
        </div>

        {successTicket ? (
          /* Confirmation d'envoi avec ticket et options */
          <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-emerald-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 size={26} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Demande transmise avec succès !</h3>
                <p className="text-xs text-emerald-300">
                  Votre message a été envoyé directement à l'équipe et archivé sous la référence :
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-medium">Numéro de Ticket :</span>
              <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                {successTicket}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Une notification prioritaire a été transmise instantanément à la permanence d'exploitation TruckMatch via notre bot Telegram d'administration.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-emerald-500/20">
              <a
                href={`mailto:jobs@truckmatch.fr?subject=Suivi%20Ticket%20${encodeURIComponent(successTicket)}`}
                className="btn btn-outline btn-sm flex-1 text-xs justify-center gap-2"
              >
                <Mail size={14} />
                <span>Envoyer un complément par email</span>
              </a>
              <button
                type="button"
                onClick={() => setSuccessTicket(null)}
                className="btn btn-primary btn-sm flex-1 text-xs justify-center"
              >
                Envoyer un nouveau message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sélecteur de profil */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Vous représentez :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "entreprise", label: "🏢 Entreprise" },
                  { key: "chauffeur", label: "🚛 Chauffeur" },
                  { key: "autre", label: "💬 Autre" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setUserType(t.key as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      userType === t.key
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>Nom complet *</span>
                </label>
                <input
                  type="text"
                  placeholder="Jean Dupont / Transports Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  <span>Téléphone de contact</span>
                </label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>Adresse email *</span>
              </label>
              <input
                type="email"
                placeholder="contact@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Sujet */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag size={13} className="text-slate-400" />
                <span>Sujet de la demande *</span>
              </label>
              <input
                type="text"
                placeholder="Ex : Recrutement chauffeur SPL frigo, question sur mon profil..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                <span>Votre message détaillé *</span>
              </label>
              <textarea
                rows={4}
                placeholder="Précisez votre demande, vos besoins de tournée ou toute question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              />
            </div>

            {/* Urgence Toggle */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isUrgent ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"}`}>
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Besoin urgent / Traitement express</div>
                  <div className="text-[11px] text-slate-400">Pour les besoins immédiats de conducteurs routiers</div>
                </div>
              </div>
              <input
                type="checkbox"
                id="urgent-check"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-700 bg-slate-900 cursor-pointer"
              />
            </div>

            {/* Bouton Soumission */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all mt-2"
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

            {/* Option mailto alternative */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Vous préférez votre messagerie par défaut ?{" "}
                <a
                  href="mailto:jobs@truckmatch.fr"
                  className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
                >
                  Écrire directement à jobs@truckmatch.fr
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
