"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileText,
  LogOut,
  ArrowRight,
  Briefcase,
  Phone,
  Mail,
  Truck,
} from "lucide-react";

export default function CompanyPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
    <div className="company-portal-page">
      <div className="container">
        {/* En-tête Entreprise */}
        <div className="portal-header-card">
          <div className="portal-header-left">
            <div className="portal-avatar portal-avatar-company">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-navy-pill">Espace Entreprise Recruteur</span>
                <span className="badge-verified-pill">
                  <CheckCircle2 size={13} />
                  <span>Entreprise Vérifiée SIRET</span>
                </span>
              </div>
              <h1 className="portal-welcome-title">
                Bienvenue, {user?.name || "Entreprise"}
              </h1>
              <p className="portal-welcome-sub">
                Gérez vos recrutements de conducteurs routiers et accédez au vivier de chauffeurs qualifiés en direct.
              </p>
            </div>
          </div>

          <div className="portal-header-actions">
            <button onClick={handleLogout} className="btn-logout-pro">
              <LogOut size={15} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="company-actions-grid mt-6">
          <Link href="/carte-chauffeurs" className="company-action-card">
            <div className="company-action-icon bg-blue-50 text-primary">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="company-action-title">Carte interactive des chauffeurs</h2>
              <p className="company-action-sub">
                Localisez immédiatement les conducteurs disponibles autour de vos dépôts et entrepôts.
              </p>
            </div>
            <ArrowRight size={18} className="company-action-arrow" />
          </Link>

          <Link href="/offres-emploi" className="company-action-card">
            <div className="company-action-icon bg-green-50 text-success">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="company-action-title">Consulter les offres d'emploi</h2>
              <p className="company-action-sub">
                Parcourez les offres du marché et vérifiez le positionnement de vos tournées.
              </p>
            </div>
            <ArrowRight size={18} className="company-action-arrow" />
          </Link>
        </div>

        {/* Détails du Compte & Avantages */}
        <div className="portal-grid mt-6">
          <div className="portal-col-main">
            <div className="portal-card">
              <div className="portal-card-header">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" />
                  <h3 className="portal-card-title">Avantages Recruteur TruckMatch</h3>
                </div>
              </div>
              <p className="text-sm text-muted">
                TruckMatch met fin aux commissions d'intérim excessives en connectant directement les patrons et exploitants aux chauffeurs.
              </p>

              <div className="portal-features-list mt-4">
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Titres vérifiés : Permis C/CE, FIMO/FCO et carte chronotachygraphe</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Accès direct aux coordonnées et CV des candidats sans intermédiaire</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>0% commission sur vos embauches en CDI, CDD ou tractions régulières</span>
                </div>
              </div>
            </div>
          </div>

          <div className="portal-col-side">
            <div className="portal-card">
              <h3 className="portal-side-title">Informations Compte</h3>
              <div className="portal-info-row">
                <Mail size={15} className="text-muted" />
                <span className="text-sm font-semibold">{user?.email || "Email enregistré"}</span>
              </div>
              <div className="portal-info-row">
                <Building2 size={15} className="text-muted" />
                <span className="text-sm font-semibold">{user?.name || "Entreprise"}</span>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Link href="/carte-chauffeurs" className="btn btn-primary btn-sm w-full justify-center">
                  <Search size={15} />
                  <span>Trouver un chauffeur</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
