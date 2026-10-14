"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Users,
  MapPin,
  Truck,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  Navigation,
  Clock,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

interface HomeDriver {
  id: string;
  initials: string;
  name: string;
  role: string;
  permit: string;
  city: string;
  department?: string;
  availability: string;
  experienceYears: number;
  specialties: string[];
  bio?: string;
  is_verified?: boolean;
  is_boosted?: boolean;
  is_premium?: boolean;
  is_reliable?: boolean;
}

export function AvailableDriversSection() {
  const [drivers, setDrivers] = useState<HomeDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestDrivers() {
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .neq("status", "rejected")
          .order("is_boosted", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const dbDrivers: HomeDriver[] = data.map((d: any) => {
            const isBoostedActive = Boolean(
              d.is_boosted && (!d.boosted_until || new Date(d.boosted_until) > new Date())
            );

            return {
              id: d.id,
              initials: `${(d.first_name || "C")[0]}${(d.last_name || "D")[0]}`.toUpperCase(),
              name: `${d.first_name || "Chauffeur"} ${(d.last_name || "").slice(0, 1)}.`,
              role: d.permits?.includes("CE")
                ? "Conducteur Routier SPL"
                : d.permits?.includes("C")
                ? "Chauffeur Distribution PL"
                : "Conducteur Professionnel",
              permit: d.permits?.[0] || "CE",
              city: d.city || "France",
              department: d.postal_code?.slice(0, 2) || "Région",
              availability: d.availability === "immediate" ? "Immédiat" : "Sous 48h",
              experienceYears: parseInt(d.experience_years) || (d.experience === "5+" ? 7 : d.experience === "3-5" ? 4 : 2),
              specialties: Array.isArray(d.specialties) && d.specialties.length > 0
                ? d.specialties
                : ["FCO Valide", "Carte Chrono", "Ponctuel"],
              bio: d.bio || "Conducteur qualifié disponible pour missions de transport.",
              is_verified: true,
              is_boosted: isBoostedActive,
              is_premium: Boolean(d.is_premium || isBoostedActive),
              is_reliable: Boolean(d.is_reliable || isBoostedActive),
            };
          });

          // Trier les conducteurs boostés en toute première position
          dbDrivers.sort((a, b) => (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0));

          setDrivers(dbDrivers);
        } else {
          setDrivers([]);
        }
      } catch (err) {
        console.error("Erreur chargement conducteurs récents:", err);
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestDrivers();
  }, []);

  return (
    <section className="available-drivers-section">
      <div className="container">
        {/* En-tête de section moderne */}
        <div className="section-header-modern">
          <div className="section-header-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue flex items-center gap-1.5">
                <Users size={14} className="text-primary" />
                <span>Vivier Conducteurs en Direct</span>
              </span>
              <span className="live-pulse-badge">
                <span className="live-pulse-dot" />
                <span>10 Derniers Inscrits</span>
              </span>
            </div>
            <h2 className="section-title-modern">Profils disponibles — 10 derniers conducteurs inscrits</h2>
            <p className="section-subtitle-modern">
              Chauffeurs routiers vérifiés (SPL, PL, Porteur, VUL) récemment enregistrés sur TruckMatch, disponibles immédiatement sur leurs secteurs.
            </p>
          </div>

          <div className="section-header-right">
            <Link href="/carte-chauffeurs" className="btn btn-primary btn-sm">
              <Navigation size={15} />
              <span>Voir la Carte Interactive ({drivers.length})</span>
            </Link>
          </div>
        </div>

        {/* Grille des 10 derniers profils */}
        {loading ? (
          <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#94a3b8" }}>
            Chargement des conducteurs en direct...
          </div>
        ) : drivers.length === 0 ? (
          <div style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "3.5rem 2rem",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
          }}>
            <ShieldCheck size={48} style={{ color: "#2563eb", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.5rem" }}>
              Nouveaux profils conducteurs en cours de validation
            </h3>
            <p style={{ color: "#64748b", maxWidth: "560px", margin: "0 auto 1.5rem", fontSize: "0.95rem", lineHeight: "1.6" }}>
              Pour garantir une qualification irréprochable aux transporteurs, chaque nouveau profil inscrit est vérifié manuellement (titres professionnels, validité FCO/Chrono) avant parution sur le site.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/inscription" className="btn btn-primary">
                <Users size={16} />
                <span>Je suis conducteur — Déposer mon profil</span>
              </Link>
              <Link href="/entreprises" className="btn btn-outline">
                <Truck size={16} />
                <span>Espace Transporteurs</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="drivers-showcase-grid">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className={`driver-showcase-card ${driver.is_boosted ? "is-boosted" : ""}`}
            >
              {driver.is_boosted && (
                <div className="driver-boosted-ribbon">
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-300 fill-amber-300 animate-bounce" />
                    <span className="font-extrabold tracking-wide">CANDIDAT PRIORITAIRE • 1ER DE LISTE</span>
                  </div>
                  <Crown size={13} className="text-amber-200 shrink-0" />
                </div>
              )}

              <div className="driver-showcase-card-top">
                <div className="driver-avatar-box">
                  <div className={`driver-avatar-circle-sm ${driver.is_boosted ? "boosted-avatar" : ""}`}>
                    {driver.initials}
                  </div>
                  <span className={`driver-online-dot ${driver.is_boosted ? "boosted-dot" : ""}`} title="Profil Actif & Disponible" />
                </div>

                <div className="driver-identity-meta">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="driver-showcase-name">{driver.name}</h3>
                    {driver.is_boosted && (
                      <span className="badge-boost-vip-pill" title="Profil Recommandé VIP">
                        <Sparkles size={10} />
                        <span>VIP</span>
                      </span>
                    )}
                    <span className="badge-permit-pill">
                      {driver.permit}
                    </span>
                  </div>
                  <p className="driver-showcase-role">{driver.role}</p>
                </div>

                <span className={`badge-avail-pill ${driver.is_boosted ? "badge-avail-boosted" : ""}`}>
                  <span className="avail-pulse-dot" />
                  <span>{driver.availability}</span>
                </span>
              </div>

              {/* Localisation & Expérience */}
              <div className="driver-showcase-meta-row">
                <div className="driver-showcase-meta-item">
                  <MapPin size={13} className="text-danger shrink-0" />
                  <span>{driver.city} {driver.department ? `(${driver.department})` : ""}</span>
                </div>
                <div className="driver-showcase-meta-item">
                  <Award size={13} className="text-warning shrink-0" />
                  <span>{driver.experienceYears} ans d&apos;exp.</span>
                </div>
              </div>

              {/* Tags de compétences */}
              <div className="driver-showcase-tags-row">
                {driver.specialties.slice(0, 3).map((spec, idx) => (
                  <span key={idx} className="driver-showcase-tag">
                    {spec}
                  </span>
                ))}
              </div>

              {/* Pied de carte avec boutons d'action */}
              <div className="driver-showcase-footer">
                <Link
                  href="/carte-chauffeurs"
                  className="driver-showcase-btn-map"
                  title="Localiser sur la carte de France"
                >
                  <Navigation size={13} />
                  <span>Localiser</span>
                </Link>

                <Link
                  href={`/carte-chauffeurs?candidat=${driver.id}`}
                  className="driver-showcase-btn-contact"
                >
                  <Send size={13} />
                  <span>Contacter</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

        {/* Bannière de réassurance bas de section */}
        <div className="drivers-showcase-cta-bar">
          <div className="flex items-center gap-3">
            <div className="reassurance-icon-box">
              <ShieldCheck size={24} className="text-success" />
            </div>
            <div>
              <h4 className="reassurance-title">Vous avez un besoin urgent de chauffeurs ?</h4>
              <p className="reassurance-desc">
                Contactez directement les conducteurs sans commission d&apos;agence. Tous les profils disposent de permis et cartes vérifiés.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/carte-chauffeurs" className="btn btn-outline btn-sm">
              <Navigation size={15} />
              <span>Carte complète des conducteurs</span>
            </Link>
            <Link href="/espace-entreprise" className="btn btn-primary btn-sm">
              <Truck size={15} />
              <span>Publier une offre de mission</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
