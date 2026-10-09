"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Adresse email ou mot de passe incorrect.");
      }

      // Stocker infos utilisateur en local pour synchronisation immédiate
      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("tm_user", JSON.stringify(data.user));
      }

      onClose();

      // Redirection automatique vers l'espace dédié
      router.push(data.redirectUrl || "/espace-candidat");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-login-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="auth-modal-close-btn"
          aria-label="Fermer la fenêtre de connexion"
        >
          <X size={18} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-badge">
            <ShieldCheck size={16} />
            <span>Accès Sécurisé</span>
          </div>
          <h2 id="modal-login-title" className="auth-modal-title">
            Connexion à votre espace
          </h2>
          <p className="auth-modal-subtitle">
            Accédez à vos candidatures, vos recrutements et votre tableau de bord en renseignant vos identifiants.
          </p>
        </div>

        {error && (
          <div className="auth-modal-error">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal-form">
          <div className="form-group-modal">
            <label className="modal-input-label" htmlFor="login-email">
              Adresse email
            </label>
            <div className="modal-input-wrap">
              <Mail size={17} className="modal-input-icon" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
              />
            </div>
          </div>

          <div className="form-group-modal">
            <div className="modal-label-row">
              <label className="modal-input-label" htmlFor="login-password">
                Mot de passe
              </label>
            </div>
            <div className="modal-input-wrap">
              <Lock size={17} className="modal-input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modal-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="modal-password-toggle"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-modal-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter à mon espace</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="auth-modal-footer">
          <p className="auth-modal-footer-text">
            Pas encore de compte sur TruckMatch ?{" "}
            <Link
              href="/inscription"
              onClick={onClose}
              className="auth-modal-register-link"
            >
              Créer mon profil gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
