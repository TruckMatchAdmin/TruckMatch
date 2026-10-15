"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  User,
  FileText,
  Loader2,
  Award,
} from "lucide-react";

export interface ApplyModalJobData {
  id?: string;
  title: string;
  company_name: string;
  location_city?: string;
  location_department?: string;
  category?: string;
  apply_url?: string;
}

interface ApplyJobModalProps {
  job: ApplyModalJobData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyJobModal({ job, isOpen, onClose }: ApplyJobModalProps) {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidateCity, setCandidateCity] = useState("");
  const [permits, setPermits] = useState<string[]>(["CE"]);
  const [fimo, setFimo] = useState(true);
  const [fco, setFco] = useState(true);
  const [chronoCard, setChronoCard] = useState(true);
  const [experience, setExperience] = useState("3 à 5 ans");
  const [message, setMessage] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    emailSent: boolean;
    destinationEmail?: string | null;
    redirectUrl?: string | null;
    message?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Préremplissage automatique si le candidat est connecté
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setErrorMsg(null);
      return;
    }

    async function loadCandidateProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/candidate/data");
        if (res.ok) {
          const json = await res.json();
          if (json.driver) {
            const d = json.driver;
            const fullName = [d.first_name, d.last_name].filter(Boolean).join(" ");
            if (fullName) setCandidateName(fullName);
            if (d.email) setCandidateEmail(d.email);
            if (d.phone) setCandidatePhone(d.phone);
            if (d.city) setCandidateCity(d.city);
            if (Array.isArray(d.permits) && d.permits.length > 0) setPermits(d.permits);
            if (typeof d.fimo === "boolean") setFimo(d.fimo);
            if (typeof d.fco === "boolean") setFco(d.fco);
            if (typeof d.chrono_card === "boolean") setChronoCard(d.chrono_card);
            if (d.experience) setExperience(d.experience);
            if (d.resume_url) setResumeUrl(d.resume_url);
          }
        }
      } catch (err) {
        // Mode invité / non connecté
      } finally {
        setLoading(false);
      }
    }

    loadCandidateProfile();
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const togglePermit = (p: string) => {
    setPermits((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!candidateName.trim() || !candidateEmail.trim() || !candidatePhone.trim()) {
      setErrorMsg("Veuillez renseigner votre nom, téléphone et adresse email.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          company_name: job.company_name,
          candidate_name: candidateName.trim(),
          candidate_email: candidateEmail.trim(),
          candidate_phone: candidatePhone.trim(),
          candidate_city: candidateCity.trim(),
          permits,
          fimo,
          fco,
          chrono_card: chronoCard,
          experience_years: experience,
          resume_url: resumeUrl,
          message: message.trim(),
          apply_url: job.apply_url,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Une erreur est survenue lors de l'envoi.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 p-6 md:p-8">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
          title="Fermer"
        >
          <X size={20} />
        </button>

        {/* Vue de Succès */}
        {result ? (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                {result.emailSent ? "Candidature transmise par email !" : "Candidature pré-enregistrée !"}
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {result.message}
              </p>
            </div>

            {result.emailSent && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-left text-xs text-emerald-200 space-y-1.5">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  Email officiel TruckMatch envoyé au recruteur
                </p>
                <p className="text-slate-300">
                  Le service recrutement de <strong>{job.company_name}</strong> a reçu votre fiche conducteur, vos permis et votre numéro direct.
                </p>
              </div>
            )}

            {result.redirectUrl && (
              <div className="pt-2">
                <a
                  href={result.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all text-sm"
                >
                  <span>Accéder à l'espace candidature de {job.company_name}</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-sm"
            >
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          /* Formulaire de Candidature */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header de l'offre */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <Briefcase size={14} />
                <span>Postuler avec TruckMatch</span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight mb-2">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-200 font-medium">
                  <Building2 size={13} className="text-sky-400" />
                  {job.company_name}
                </span>
                {(job.location_city || job.location_department) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-400" />
                    {job.location_city} {job.location_department ? `(${job.location_department})` : ""}
                  </span>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Coordonnées Chauffeur */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vos Coordonnées Directes
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nom & Prénom *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Ex: Alexandre Laurent"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Téléphone direct *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Adresse Email *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="alexandre@email.fr"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ville ou Département
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={candidateCity}
                      onChange={(e) => setCandidateCity(e.target.value)}
                      placeholder="Ex: Lyon (69)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Permis et Documents */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Permis & Qualifications
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Permis détenus
                </label>
                <div className="flex flex-wrap gap-2">
                  {["CE", "C", "C1", "BE", "D", "ADR de base", "ADR Citerne"].map((p) => {
                    const active = permits.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePermit(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          active
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {active && "✓ "}Permis {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={fimo || fco}
                    onChange={(e) => {
                      setFimo(e.target.checked);
                      setFco(e.target.checked);
                    }}
                    className="rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-600"
                  />
                  <span className="text-xs text-slate-200">FIMO / FCO à jour</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={chronoCard}
                    onChange={(e) => setChronoCard(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-600"
                  />
                  <span className="text-xs text-slate-200">Carte chrono valide</span>
                </label>

                <div>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Débutant (< 1 an)">Débutant (&lt; 1 an)</option>
                    <option value="1 à 3 ans">1 à 3 ans d'expérience</option>
                    <option value="3 à 5 ans">3 à 5 ans d'expérience</option>
                    <option value="Plus de 5 ans">+5 ans d'expérience</option>
                    <option value="Expert (+ 10 ans)">Expert (+10 ans)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message optionnel */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Message pour le recruteur (optionnel)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Disponible immédiatement pour tournées régionales ou relais de nuit..."
                className="w-full p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Transmission au recruteur en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer ma candidature directe</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
