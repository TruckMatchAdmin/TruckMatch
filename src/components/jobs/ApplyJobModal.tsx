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
  Loader2,
  Award,
  Sparkles,
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
  const [isPreFilled, setIsPreFilled] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    emailSent: boolean;
    destinationEmail?: string | null;
    redirectUrl?: string | null;
    message?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Préremplissage intelligent et multi-sources
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setErrorMsg(null);
      return;
    }

    let prefilled = false;

    // 1. Source 1 : Mémoire locale de la dernière candidature
    try {
      const savedLast = localStorage.getItem("tm_candidate_last_application");
      if (savedLast) {
        const d = JSON.parse(savedLast);
        if (d.name) setCandidateName(d.name);
        if (d.email) setCandidateEmail(d.email);
        if (d.phone) setCandidatePhone(d.phone);
        if (d.city) setCandidateCity(d.city);
        if (Array.isArray(d.permits) && d.permits.length > 0) setPermits(d.permits);
        if (typeof d.fimo === "boolean") setFimo(d.fimo);
        if (typeof d.fco === "boolean") setFco(d.fco);
        if (typeof d.chrono_card === "boolean") setChronoCard(d.chrono_card);
        if (d.experience) setExperience(d.experience);
        prefilled = true;
      }
    } catch (e) {
      // Ignorer
    }

    // 2. Source 2 : Utilisateur connecté dans localStorage (tm_user)
    try {
      const rawUser = localStorage.getItem("tm_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) setCandidateName(u.name);
        if (u.email) setCandidateEmail(u.email);
        if (u.phone) setCandidatePhone(u.phone);
        if (u.city) setCandidateCity(u.city);
        if (u.profile) {
          if (u.profile.phone) setCandidatePhone(u.profile.phone);
          if (u.profile.city) setCandidateCity(u.profile.city);
          if (Array.isArray(u.profile.permits) && u.profile.permits.length > 0) {
            setPermits(u.profile.permits);
          }
          if (typeof u.profile.fimo === "boolean") setFimo(u.profile.fimo);
          if (typeof u.profile.fco === "boolean") setFco(u.profile.fco);
          if (typeof u.profile.chrono_card === "boolean") setChronoCard(u.profile.chrono_card);
          if (u.profile.experience) setExperience(u.profile.experience);
        }
        prefilled = true;
      }
    } catch (e) {
      // Ignorer
    }

    // 3. Source 3 : Récupération asynchrone depuis Supabase API
    async function loadCandidateProfile() {
      try {
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
            setIsPreFilled(true);
            return;
          }
        }
      } catch (err) {
        // Mode non connecté
      }
      if (prefilled) setIsPreFilled(true);
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
      setErrorMsg("Veuillez renseigner votre nom, téléphone direct et adresse email.");
      return;
    }

    try {
      setSubmitting(true);

      // Sauvegarde locale pour pré-remplir les prochaines candidatures en 1 clic
      try {
        localStorage.setItem(
          "tm_candidate_last_application",
          JSON.stringify({
            name: candidateName.trim(),
            email: candidateEmail.trim(),
            phone: candidatePhone.trim(),
            city: candidateCity.trim(),
            permits,
            fimo,
            fco,
            chrono_card: chronoCard,
            experience,
          })
        );
      } catch (e) {
        // Ignorer
      }

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
    <div className="apply-modal-overlay" onClick={onClose}>
      <div
        className="apply-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          className="apply-modal-close"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {/* Vue de Succès */}
        {result ? (
          <div className="apply-success-box">
            <div className="apply-success-icon-wrap">
              <CheckCircle2 size={34} />
            </div>

            <h3 className="apply-success-title">
              {result.emailSent ? "Candidature transmise avec succès !" : "Dossier pré-rempli !"}
            </h3>

            <p className="apply-success-text">{result.message}</p>

            {result.emailSent && (
              <div className="apply-success-card-info">
                <p style={{ fontWeight: 800, marginBottom: "0.35rem" }}>
                  ✉️ Email officiel TruckMatch envoyé au recruteur
                </p>
                <p>
                  Le service recrutement de <strong>{job.company_name}</strong> a reçu votre fiche conducteur, vos permis et votre numéro direct. Un accusé de réception vous a également été envoyé par email.
                </p>
              </div>
            )}

            {result.redirectUrl && (
              <div style={{ marginBottom: "1.25rem" }}>
                <a
                  href={result.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apply-btn-submit"
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <span>Accéder à la plateforme de {job.company_name}</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}

            <button type="button" onClick={onClose} className="apply-btn-cancel" style={{ width: "100%" }}>
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          /* Formulaire de Candidature */
          <form onSubmit={handleSubmit}>
            {/* Header de l'offre */}
            <div className="apply-modal-header">
              <div className="apply-modal-badge">
                <Sparkles size={13} />
                <span>Postuler avec TruckMatch</span>
              </div>
              <h2 className="apply-modal-title">{job.title}</h2>
              <div className="apply-modal-meta">
                <span className="apply-modal-meta-item" style={{ color: "#0284c7" }}>
                  <Building2 size={14} />
                  {job.company_name}
                </span>
                {(job.location_city || job.location_department) && (
                  <span className="apply-modal-meta-item">
                    <MapPin size={14} />
                    {job.location_city} {job.location_department ? `(${job.location_department})` : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Badge de pré-remplissage automatique */}
            {isPreFilled && (
              <div className="apply-modal-prefill-pill">
                <ShieldCheck size={14} />
                <span>Vos coordonnées ont été pré-remplies automatiquement</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  color: "#b91c1c",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Coordonnées */}
            <div className="apply-form-section-title">Vos Coordonnées Directes</div>

            <div className="apply-form-grid-2">
              <div className="apply-form-group">
                <label className="apply-form-label">Nom & Prénom *</label>
                <div className="apply-input-wrap">
                  <User size={16} className="apply-input-icon" />
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Ex: Alexandre Laurent"
                    className="apply-input"
                  />
                </div>
              </div>

              <div className="apply-form-group">
                <label className="apply-form-label">Téléphone direct *</label>
                <div className="apply-input-wrap">
                  <Phone size={16} className="apply-input-icon" />
                  <input
                    type="tel"
                    required
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="apply-input"
                  />
                </div>
              </div>
            </div>

            <div className="apply-form-grid-2">
              <div className="apply-form-group">
                <label className="apply-form-label">Adresse Email *</label>
                <div className="apply-input-wrap">
                  <Mail size={16} className="apply-input-icon" />
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="alexandre@email.fr"
                    className="apply-input"
                  />
                </div>
              </div>

              <div className="apply-form-group">
                <label className="apply-form-label">Ville ou Département</label>
                <div className="apply-input-wrap">
                  <MapPin size={16} className="apply-input-icon" />
                  <input
                    type="text"
                    value={candidateCity}
                    onChange={(e) => setCandidateCity(e.target.value)}
                    placeholder="Ex: Lyon (69)"
                    className="apply-input"
                  />
                </div>
              </div>
            </div>

            {/* Permis et Documents */}
            <div style={{ marginTop: "0.5rem" }}>
              <div className="apply-form-section-title">Permis & Qualifications</div>

              <div className="apply-form-group">
                <label className="apply-form-label">Sélectionnez vos permis</label>
                <div className="apply-permits-wrap">
                  {["CE", "C", "C1", "BE", "D", "ADR de base", "ADR Citerne"].map((p) => {
                    const active = permits.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePermit(p)}
                        className={`apply-permit-pill ${active ? "active" : ""}`}
                      >
                        {active && "✓ "}Permis {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="apply-checks-row">
                <label className="apply-check-card">
                  <input
                    type="checkbox"
                    checked={fimo || fco}
                    onChange={(e) => {
                      setFimo(e.target.checked);
                      setFco(e.target.checked);
                    }}
                  />
                  <span className="apply-check-text">FIMO / FCO à jour</span>
                </label>

                <label className="apply-check-card">
                  <input
                    type="checkbox"
                    checked={chronoCard}
                    onChange={(e) => setChronoCard(e.target.checked)}
                  />
                  <span className="apply-check-text">Carte chrono valide</span>
                </label>

                <div>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="apply-select"
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
            <div className="apply-form-group" style={{ marginTop: "0.5rem" }}>
              <label className="apply-form-label">Message pour le recruteur (optionnel)</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Disponible immédiatement pour tournées régionales..."
                className="apply-textarea"
              />
            </div>

            {/* Boutons d'action */}
            <div className="apply-actions-row">
              <button type="button" onClick={onClose} className="apply-btn-cancel">
                Annuler
              </button>

              <button type="submit" disabled={submitting} className="apply-btn-submit">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Transmission au recruteur...</span>
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
