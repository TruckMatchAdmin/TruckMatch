"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Send,
} from "lucide-react";

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

  // Étape 2FA pour l'administrateur
  const [step2FA, setStep2FA] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step2FA && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step2FA, countdown]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep2FA(false);
    setTwoFaCode("");
    setError(null);
    setResendSuccess(null);
    onClose();
  };

  const handlePrimarySubmit = async (e: React.FormEvent) => {
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

      // Si l'authentification nécessite l'étape 2FA (administrateur)
      if (data.requires2FA) {
        setStep2FA(true);
        setCountdown(300);
        setLoading(false);
        return;
      }

      // Connexion directe réussie (conducteur ou entreprise)
      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("tm_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("tm_auth_changed"));
      }

      handleClose();
      router.push(data.redirectUrl || "/espace-candidat");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Code de vérification invalide.");
      }

      if (typeof window !== "undefined") {
        const adminUser = data.user || {
          role: "admin",
          email: "jobs@truckmatch.fr",
          name: "Administrateur TruckMatch",
        };
        localStorage.setItem("tm_user", JSON.stringify(adminUser));
        window.dispatchEvent(new Event("tm_auth_changed"));
      }

      handleClose();
      router.push(data.redirectUrl || "/espace-admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Échec de validation du code 2FA.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/2fa/resend", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible de renvoyer le code.");
      }
      setResendSuccess("Nouveau code expédié sur Telegram !");
      setCountdown(300);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-login-title"
      >
        <button
          type="button"
          onClick={handleClose}
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
            {step2FA ? "Vérification en 2 étapes" : "Connexion à votre espace"}
          </h2>
          <p className="auth-modal-subtitle">
            {step2FA
              ? "Un code unique à 4 chiffres a été généré côté serveur et expédié sur votre Telegram sécurisé (@TruckMatchAdmin_bot)."
              : "Accédez à vos candidatures, vos recrutements et votre tableau de bord en renseignant vos identifiants."}
          </p>
        </div>

        {error && (
          <div className="auth-modal-error">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-2.5 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{resendSuccess}</span>
          </div>
        )}

        {step2FA ? (
          /* ==================================================== */
          /* ÉTAPE 2 : CODE TEMPORAIRE 4 CHIFFRES (12H SÉCURISÉ)  */
          /* ==================================================== */
          <form onSubmit={handle2FASubmit} className="auth-modal-form">
            <div className="form-group-modal">
              <div className="flex items-center justify-between mb-1.5">
                <label className="modal-input-label" htmlFor="2fa-code">
                  Code temporaire (4 chiffres)
                </label>
                <span className="text-[11px] font-mono text-sky-400 font-bold">
                  Expire dans {timeFormatted}
                </span>
              </div>
              <div className="modal-input-wrap">
                <KeyRound size={17} className="modal-input-icon text-sky-400" />
                <input
                  id="2fa-code"
                  type="text"
                  maxLength={4}
                  autoFocus
                  required
                  placeholder="Ex : 4821"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                  className="modal-input tracking-[6px] text-center text-lg font-mono font-bold text-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>Canal officiel :</span>
                <a
                  href="https://t.me/TruckMatchAdmin_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  t.me/TruckMatchAdmin_bot
                </a>
              </p>
            </div>

            <button type="submit" disabled={loading || twoFaCode.length !== 4} className="auth-modal-submit-btn">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Validation du code...</span>
                </>
              ) : (
                <>
                  <span>Déverrouiller l'Espace Admin</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw size={12} className={resendLoading ? "animate-spin" : ""} />
                <span>Renvoyer un code</span>
              </button>
              <button
                type="button"
                onClick={() => setStep2FA(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                Retour aux identifiants
              </button>
            </div>
          </form>
        ) : (
          /* ==================================================== */
          /* ÉTAPE 1 : IDENTIFIANTS PRINCIPAUX                     */
          /* ==================================================== */
          <form onSubmit={handlePrimarySubmit} className="auth-modal-form">
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

            <button type="submit" disabled={loading} className="auth-modal-submit-btn">
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
        )}

        {!step2FA && (
          <div className="auth-modal-footer">
            <p className="auth-modal-footer-text">
              Pas encore de compte sur TruckMatch ?{" "}
              <Link href="/inscription" onClick={handleClose} className="auth-modal-register-link">
                Créer mon profil gratuitement
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
