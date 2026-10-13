"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/constants/navigation";
import {
  Menu,
  X,
  ArrowRight,
  UserPlus,
  LogIn,
  LayoutDashboard,
  LogOut,
  Building2,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { FacebookIcon, TelegramIcon } from "@/components/ui/SocialIcons";

interface AuthUser {
  id?: string;
  email?: string;
  role?: "admin" | "company" | "driver";
  name?: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Détection instantanée de la session connectée (localStorage + API HttpOnly)
  useEffect(() => {
    const checkLocal = () => {
      try {
        const raw = localStorage.getItem("tm_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.role) {
            setUser(parsed);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    checkLocal();

    // Confirmation officielle de la session par le cookie HttpOnly
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem("tm_user", JSON.stringify(data.user));
          } catch {}
        } else if (data?.authenticated === false) {
          setUser(null);
          try {
            localStorage.removeItem("tm_user");
          } catch {}
        }
      })
      .catch(() => {});

    // Écouter les connexions / déconnexions en temps réel
    const onAuthChanged = () => {
      checkLocal();
    };
    window.addEventListener("tm_auth_changed", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);

    return () => {
      window.removeEventListener("tm_auth_changed", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  // Déconnexion utilisateur
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      localStorage.removeItem("tm_user");
    } catch {}
    setUser(null);
    window.dispatchEvent(new Event("tm_auth_changed"));
    window.location.href = "/";
  };

  // Menu mobile : fermeture par Échap et blocage du scroll de la page
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Destination du dashboard selon le rôle connecté
  const dashboardUrl =
    user?.role === "company"
      ? "/espace-entreprise"
      : user?.role === "admin"
      ? "/espace-admin"
      : "/espace-candidat";

  const DashboardIcon =
    user?.role === "company"
      ? Building2
      : user?.role === "admin"
      ? ShieldCheck
      : Truck;

  return (
    <>
      <header className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="container header-container">
          {/* Logo */}
          <Link href="/" className="logo-link" aria-label="TruckMatch Accueil">
            <Image
              src="/images/logo.png"
              alt="TruckMatch"
              width={280}
              height={70}
              priority
              className="logo-img"
            />
          </Link>

          {/* Navigation Desktop Pro - Zero Layout Shift */}
          <nav className="desktop-nav" aria-label="Navigation principale">
            <ul className="nav-list">
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions Desktop Pro */}
          <div className="header-actions">
            {/* Lien Facebook Officiel */}
            <a
              href="https://www.facebook.com/profile.php?id=61593705328209"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-600/10 transition-colors hidden sm:inline-flex items-center justify-center"
              title="Page Facebook Officielle TruckMatch"
              aria-label="Facebook TruckMatch"
            >
              <FacebookIcon size={18} />
            </a>

            {user ? (
              /* ======================================================= */
              /* ÉTAT CONNECTÉ : Bouton direct vers le dashboard          */
              /* ======================================================= */
              <>
                <Link
                  href={dashboardUrl}
                  className="header-btn-driver-pro"
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  aria-label="Accéder à mon dashboard"
                >
                  <DashboardIcon size={16} />
                  <span>Accéder à mon dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="header-btn-login-pro"
                  title="Se déconnecter de votre compte"
                  style={{
                    padding: "0.55rem 0.85rem",
                    color: "#64748b",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                  aria-label="Déconnexion"
                >
                  <LogOut size={15} />
                  <span className="hidden xl:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              /* ======================================================= */
              /* ÉTAT NON-CONNECTÉ : Connexion & Création de profil       */
              /* ======================================================= */
              <>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="header-btn-login-pro"
                  aria-label="Ouvrir la connexion"
                >
                  <LogIn size={15} />
                  <span>Connexion</span>
                </button>
                <Link href="/inscription?type=candidat" className="header-btn-driver-pro">
                  <UserPlus size={15} />
                  <span>Créer mon profil</span>
                </Link>
              </>
            )}
          </div>

          {/* Bouton Mobile Menu */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile Déroulant Pro */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" id="mobile-navigation">
            <nav className="mobile-nav" aria-label="Navigation mobile">
              <ul className="mobile-nav-list">
                {MAIN_NAV.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{item.label}</span>
                        <ArrowRight size={16} />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mobile-menu-cta">
                {user ? (
                  <>
                    <Link
                      href={dashboardUrl}
                      className="header-btn-driver-pro w-full justify-center"
                      style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <DashboardIcon size={16} />
                      <span>Accéder à mon dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="header-btn-login-pro w-full justify-center"
                    >
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginModalOpen(true);
                      }}
                      className="header-btn-login-pro w-full justify-center"
                    >
                      <LogIn size={16} />
                      <span>Connexion</span>
                    </button>
                    <Link
                      href="/inscription?type=candidat"
                      className="header-btn-driver-pro w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserPlus size={16} />
                      <span>Créer mon profil Chauffeur (Gratuit)</span>
                    </Link>
                  </>
                )}

                {/* Réseaux sociaux mobile */}
                <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-800">
                  <a
                    href="https://www.facebook.com/profile.php?id=61593705328209"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-600/30 text-blue-400 text-xs font-semibold"
                  >
                    <FacebookIcon size={16} />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://t.me/TruckMatchOfficiel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-semibold"
                  >
                    <TelegramIcon size={16} />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Fenêtre modale de Connexion Universelle */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
