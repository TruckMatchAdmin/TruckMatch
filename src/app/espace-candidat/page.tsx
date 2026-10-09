"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  LogOut,
  ExternalLink,
  Award,
  Truck,
  Sparkles,
} from "lucide-react";

export default function CandidatePortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tm_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "tm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      localStorage.removeItem("tm_user");
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="candidate-portal-page">
      {/* Topbar Espace Candidat épurée */}
      <header className="espace-simple-topbar">
        <div className="espace-simple-topbar-inner">
          <div className="flex items-center gap-3">
            <Link href="/" className="espace-logo-link">
              <span>TruckMatch</span>
            </Link>
            <span className="espace-logo-badge badge-candidat-tag">Espace Conducteur</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-outline btn-sm">
              <span>Voir le site</span>
            </Link>
            <button onClick={handleLogout} className="btn-logout-pro">
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mt-6">
        {/* En-tête Chauffeur */}
        <div className="portal-header-card">
          <div className="portal-header-left">
            <div className="portal-avatar">
              <Truck size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-navy-pill">Espace Conducteur Routier</span>
                <span className="badge-verified-pill">
                  <CheckCircle2 size={13} />
                  <span>Profil Certifié TruckMatch</span>
                </span>
              </div>
              <h1 className="portal-welcome-title">
                Bienvenue, {user?.name || "Conducteur"}
              </h1>
              <p className="portal-welcome-sub">
                Votre profil et vos permis sont enregistrés et consultables par les exploitants et transporteurs vérifiés de votre région.
              </p>
            </div>
          </div>
        </div>

        {/* Grille Principale */}
        <div className="portal-grid">
          {/* Colonne Gauche : Statut & Informations */}
          <div className="portal-col-main">
            <div className="portal-card">
              <div className="portal-card-header">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" />
                  <h2 className="portal-card-title">Statut de Visibilité Professionnelle</h2>
                </div>
                <span className="badge-status-pill status-available">En ligne & Actif</span>
              </div>
              <p className="text-sm text-muted">
                Les transporteurs recrutant sur votre département peuvent consulter vos qualifications et vous contacter directement par téléphone ou email pour des propositions de tournées en CDI, CDD ou relais.
              </p>

              <div className="portal-features-list mt-4">
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Vos coordonnées directes restent protégées et réservées aux professionnels vérifiés</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Aucun intermédiaire : négociez directement votre salaire et vos plannings de route</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>0% de frais ni de commission prélevée sur votre rémunération</span>
                </div>
              </div>
            </div>

            {/* Offres recommandées */}
            <div className="portal-card mt-6">
              <div className="portal-card-header">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-primary" />
                  <h2 className="portal-card-title">Offres d'emploi récentes sur votre secteur</h2>
                </div>
                <Link href="/offres-emploi" className="btn btn-outline btn-sm">
                  Voir tout
                </Link>
              </div>

              <div className="portal-jobs-list">
                <div className="portal-job-item">
                  <div>
                    <div className="font-bold text-navy">Conducteur Routier SPL Régional (CE)</div>
                    <div className="text-xs text-muted flex items-center gap-2 mt-1">
                      <span>Transports Régionaux Express</span>
                      <span>•</span>
                      <span>CDI</span>
                      <span>•</span>
                      <span>2 450 € — 2 900 € net/mois</span>
                    </div>
                  </div>
                  <Link href="/offres-emploi" className="btn btn-primary btn-sm">
                    Postuler
                  </Link>
                </div>

                <div className="portal-job-item">
                  <div>
                    <div className="font-bold text-navy">Chauffeur PL Distribution & Messagerie (C)</div>
                    <div className="text-xs text-muted flex items-center gap-2 mt-1">
                      <span>Logistique & Fret France</span>
                      <span>•</span>
                      <span>CDI</span>
                      <span>•</span>
                      <span>Retour chaque soir</span>
                    </div>
                  </div>
                  <Link href="/offres-emploi" className="btn btn-primary btn-sm">
                    Postuler
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Coordonnées & Actions Rapides */}
          <div className="portal-col-side">
            <div className="portal-card">
              <h3 className="portal-side-title">Coordonnées de Contact</h3>
              <div className="portal-info-row">
                <Mail size={15} className="text-muted" />
                <span className="text-sm font-semibold">{user?.email || "Email enregistré"}</span>
              </div>
              <div className="portal-info-row">
                <Phone size={15} className="text-muted" />
                <span className="text-sm font-semibold">{user?.phone || "06 •• •• •• ••"}</span>
              </div>
            </div>

            <div className="portal-card mt-6">
              <h3 className="portal-side-title">Documents & CV</h3>
              <p className="text-xs text-muted mb-3">
                Votre CV est rattaché à votre compte et transmis aux entreprises lors des prises de contact.
              </p>
              <Link href="/inscription?type=candidat" className="btn btn-outline btn-sm w-full justify-center">
                <FileText size={15} />
                <span>Mettre à jour mon profil / CV</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
