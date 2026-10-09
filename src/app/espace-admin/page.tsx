"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  FileText,
  Clock,
  Download,
  ExternalLink,
  Search,
  ShieldAlert,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"drivers" | "companies">("drivers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalCompanies: 0,
    withResume: 0,
    availableNow: 0,
  });
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setError("Session expirée ou droits insuffisants. Veuillez vous reconnecter.");
          return;
        }
        throw new Error("Erreur de chargement des données.");
      }
      const data = await res.json();
      setDrivers(data.drivers || []);
      setCompanies(data.companies || []);
      setStats(data.stats || { totalDrivers: 0, totalCompanies: 0, withResume: 0, availableNow: 0 });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    document.cookie = "tm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined") {
      localStorage.removeItem("tm_user");
    }
    router.push("/");
    router.refresh();
  };

  const filteredDrivers = drivers.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.first_name?.toLowerCase().includes(q) ||
      d.last_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.phone?.includes(q)
    );
  });

  const filteredCompanies = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.company_name?.toLowerCase().includes(q) ||
      c.siret?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.contact_last_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-space-page">
      <div className="container">
        {/* En-tête Espace Gestion */}
        <div className="admin-header-row">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-navy-pill">Supervision Plateforme</span>
              <span className="badge-live-dot flex items-center gap-1.5">
                <span className="live-dot" />
                <span>Synchronisé en direct</span>
              </span>
            </div>
            <h1 className="admin-title">Tableau de bord de gestion</h1>
            <p className="admin-subtitle">
              Gestion centralisée des candidatures chauffeurs et des entreprises de transport inscrites.
            </p>
          </div>

          <div className="admin-header-actions">
            <button onClick={loadData} className="btn btn-outline btn-sm" title="Rafraîchir les données">
              <RefreshCw size={15} />
              <span>Actualiser</span>
            </button>
            <button onClick={handleLogout} className="btn-logout-pro" title="Se déconnecter">
              <LogOut size={15} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="admin-error-box">
            <ShieldAlert size={20} />
            <p>{error}</p>
            <Link href="/" className="btn btn-primary btn-sm mt-3">
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap kpi-blue">
                  <Users size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-val">{stats.totalDrivers}</span>
                  <span className="kpi-lbl">Chauffeurs inscrits</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap kpi-navy">
                  <Building2 size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-val">{stats.totalCompanies}</span>
                  <span className="kpi-lbl">Entreprises de transport</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap kpi-green">
                  <FileText size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-val">{stats.withResume}</span>
                  <span className="kpi-lbl">CV déposés & prêts</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-icon-wrap kpi-amber">
                  <Clock size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-val">{stats.availableNow}</span>
                  <span className="kpi-lbl">Disponibles immédiatement</span>
                </div>
              </div>
            </div>

            {/* Barre de navigation interne & Recherche */}
            <div className="admin-tabs-bar">
              <div className="admin-tabs-group">
                <button
                  type="button"
                  onClick={() => setActiveTab("drivers")}
                  className={`admin-tab-btn ${activeTab === "drivers" ? "admin-tab-active" : ""}`}
                >
                  <Users size={16} />
                  <span>Candidats Chauffeurs ({drivers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("companies")}
                  className={`admin-tab-btn ${activeTab === "companies" ? "admin-tab-active" : ""}`}
                >
                  <Building2 size={16} />
                  <span>Entreprises Transport ({companies.length})</span>
                </button>
              </div>

              <div className="admin-search-wrap">
                <Search size={16} className="text-muted" />
                <input
                  type="text"
                  placeholder={activeTab === "drivers" ? "Rechercher par nom, ville, email..." : "Rechercher par raison sociale, SIRET..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>

            {/* Contenu de la table */}
            <div className="admin-table-container">
              {activeTab === "drivers" ? (
                /* Table Conducteurs */
                filteredDrivers.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>Aucun conducteur ne correspond à la recherche.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Candidat</th>
                          <th>Coordonnées</th>
                          <th>Localisation</th>
                          <th>Permis & Habilitations</th>
                          <th>CV Déposé</th>
                          <th>Disponibilité</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDrivers.map((d) => (
                          <tr key={d.id}>
                            <td>
                              <div className="font-bold text-navy">
                                {d.first_name} {d.last_name}
                              </div>
                              <div className="text-xs text-muted">
                                {d.birth_date ? `Né(e) le ${new Date(d.birth_date).toLocaleDateString("fr-FR")}` : ""}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone size={12} className="text-primary" />
                                <span>{d.phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                                <Mail size={12} />
                                <span>{d.email}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin size={12} className="text-muted" />
                                <span>{d.postal_code} {d.city}</span>
                              </div>
                              <div className="text-xs text-muted">{d.address}</div>
                            </td>
                            <td>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(d.permits) &&
                                  d.permits.map((p: string) => (
                                    <span key={p} className="badge-permit-mini">
                                      {p}
                                    </span>
                                  ))}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {d.fimo && <span className="badge-certif-mini">FIMO</span>}
                                {d.fco && <span className="badge-certif-mini">FCO</span>}
                                {d.chrono_card && <span className="badge-certif-mini">Chrono</span>}
                              </div>
                            </td>
                            <td>
                              {d.resume_url ? (
                                <a
                                  href={d.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="admin-cv-link"
                                >
                                  <FileText size={14} />
                                  <span>Voir CV</span>
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="text-xs text-muted">Aucun CV</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge-status-pill ${
                                  d.availability === "immediate"
                                    ? "status-available"
                                    : "status-other"
                                }`}
                              >
                                {d.availability === "immediate" ? "Immédiat" : d.availability || "Standard"}
                              </span>
                            </td>
                            <td className="text-xs text-muted">
                              {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Table Entreprises */
                filteredCompanies.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>Aucune entreprise ne correspond à la recherche.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Entreprise</th>
                          <th>SIRET & NAF</th>
                          <th>Responsable</th>
                          <th>Coordonnées</th>
                          <th>Siège / Établissement</th>
                          <th>Flotte</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompanies.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div className="font-bold text-navy">{c.company_name}</div>
                              <div className="text-xs text-muted">{c.tva_number || ""}</div>
                            </td>
                            <td>
                              <div className="font-mono text-xs font-bold text-navy">{c.siret}</div>
                              <div className="text-xs text-muted">{c.naf_code || ""}</div>
                            </td>
                            <td>
                              <div className="font-bold text-xs">
                                {c.contact_first_name} {c.contact_last_name}
                              </div>
                              <div className="text-xs text-muted">{c.contact_role}</div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone size={12} className="text-primary" />
                                <span>{c.phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                                <Mail size={12} />
                                <span>{c.email}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin size={12} className="text-muted" />
                                <span>{c.postal_code} {c.city}</span>
                              </div>
                              <div className="text-xs text-muted">{c.address}</div>
                            </td>
                            <td>
                              <span className="badge-fleet-mini">{c.fleet_size || "1-5"} camions</span>
                            </td>
                            <td className="text-xs text-muted">
                              {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
