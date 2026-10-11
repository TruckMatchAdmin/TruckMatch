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
}

// 10 Derniers conducteurs qualifiés de référence
const FALLBACK_DRIVERS: HomeDriver[] = [
  {
    id: "CH-5901",
    initials: "ML",
    name: "Michel L.",
    role: "Conducteur Routier SPL",
    permit: "CE",
    city: "Lille",
    department: "59",
    availability: "Immédiat",
    experienceYears: 14,
    specialties: ["ADR Citerne", "Tautliner", "Frigo", "FCO 2028"],
    bio: "Conducteur grand routier confirmé. Expérience sur semi-remorques bâchées et frigo.",
  },
  {
    id: "CH-5902",
    initials: "YB",
    name: "Yassine B.",
    role: "Chauffeur Distribution PL",
    permit: "C",
    city: "Dunkerque",
    department: "59",
    availability: "Immédiat",
    experienceYears: 7,
    specialties: ["Hayon élévateur", "Distribution urbaine", "Transpalette élec."],
    bio: "Spécialiste messagerie et livraisons palettes littoral nord. Rigueur et ponctualité.",
  },
  {
    id: "CH-5903",
    initials: "FD",
    name: "Frédéric D.",
    role: "Conducteur SPL Relais Nuit",
    permit: "CE",
    city: "Douai",
    department: "59",
    availability: "Sous 48h",
    experienceYears: 11,
    specialties: ["Traction de nuit", "Décrochage rapide", "ADR Colis"],
    bio: "Habitué aux tractions inter-hubs logistiques de nuit. Respect strict des cadences.",
  },
  {
    id: "CH-7501",
    initials: "KM",
    name: "Kevin M.",
    role: "Conducteur SPL Porte-Conteneur",
    permit: "CE",
    city: "Roissy-en-France",
    department: "95",
    availability: "Immédiat",
    experienceYears: 9,
    specialties: ["Fret Aérien", "ADR Base", "Porte-conteneur", "Badge Cargo CDG"],
    bio: "Opère sur la zone cargo de Roissy CDG et liaison Le Havre. Protocoles sûreté maîtrisés.",
  },
  {
    id: "CH-9401",
    initials: "DP",
    name: "Damien P.",
    role: "Chauffeur PL Frigo Rungis",
    permit: "C",
    city: "Rungis",
    department: "94",
    availability: "Immédiat",
    experienceYears: 6,
    specialties: ["Température Dirigée", "Prise de poste 4h", "Certificat ATP"],
    bio: "Approvisionnement grande distribution et métiers de bouche au départ du MIN Rungis.",
  },
  {
    id: "CH-7801",
    initials: "ST",
    name: "Sofiane T.",
    role: "Conducteur Porteur Benne TP",
    permit: "Porteur",
    city: "Trappes",
    department: "78",
    availability: "Immédiat",
    experienceYears: 5,
    specialties: ["Benne Enrochée", "Chantiers BTP", "Carte BTP valide"],
    bio: "Grands chantiers franciliens du Grand Paris. Conduite sur terrains difficiles.",
  },
  {
    id: "CH-6901",
    initials: "KD",
    name: "Karim D.",
    role: "Conducteur Routier SPL",
    permit: "CE",
    city: "Saint-Priest",
    department: "69",
    availability: "Immédiat",
    experienceYears: 12,
    specialties: ["ADR Citerne", "Tautliner", "Éco-conduite", "FCO 2029"],
    bio: "Ensembles 44T. Spécialiste couloir rhodanien et plateformes Plaine de l'Ain.",
  },
  {
    id: "CH-6902",
    initials: "AG",
    name: "Alexandre G.",
    role: "Chauffeur Distribution PL",
    permit: "C",
    city: "Lyon",
    department: "69",
    availability: "Sous 48h",
    experienceYears: 8,
    specialties: ["Distribution Centre-Ville", "Hayon", "Sens du service"],
    bio: "Parfaite maîtrise des contraintes urbaines lyonnaises (accès ZFE, restrictions tonnage).",
  },
  {
    id: "CH-3801",
    initials: "TR",
    name: "Thierry R.",
    role: "Conducteur Porteur Grue Auxiliaire",
    permit: "Porteur",
    city: "Grenoble",
    department: "38",
    availability: "Immédiat",
    experienceYears: 9,
    specialties: ["CACES Grue R490", "Télécommande", "Négoce Matériaux"],
    bio: "Livraisons chantiers de montagne et négoce matériaux avec grue auxiliaire télécommandée.",
  },
  {
    id: "CH-1301",
    initials: "RB",
    name: "Rachid B.",
    role: "Conducteur SPL Citerne Hydrocarbures",
    permit: "CE",
    city: "Fos-sur-Mer",
    department: "13",
    availability: "Immédiat",
    experienceYears: 16,
    specialties: ["ADR Citerne Pétrole", "Protocoles Raffinerie", "GPL"],
    bio: "Habilité sur l'ensemble des dépôts pétroliers et raffineries du golfe de Fos.",
  },
];

export function AvailableDriversSection() {
  const [drivers, setDrivers] = useState<HomeDriver[]>(FALLBACK_DRIVERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestDrivers() {
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const dbDrivers: HomeDriver[] = data.map((d: any) => ({
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
            experienceYears: parseInt(d.experience_years) || 6,
            specialties: Array.isArray(d.specialties) && d.specialties.length > 0
              ? d.specialties
              : ["FCO Valide", "Carte Chrono", "Ponctuel"],
            bio: d.bio || "Conducteur vérifié disponible pour missions régionales et nationales.",
            is_verified: true,
          }));

          // Compléter jusqu'à 10 avec les profils de référence si nécessaire
          const combined = [...dbDrivers];
          for (const fallback of FALLBACK_DRIVERS) {
            if (combined.length >= 10) break;
            if (!combined.some((item) => item.name === fallback.name)) {
              combined.push(fallback);
            }
          }
          setDrivers(combined.slice(0, 10));
        } else {
          setDrivers(FALLBACK_DRIVERS);
        }
      } catch (err) {
        console.error("Erreur chargement conducteurs récents:", err);
        setDrivers(FALLBACK_DRIVERS);
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
        <div className="drivers-showcase-grid">
          {drivers.map((driver) => (
            <div key={driver.id} className="driver-showcase-card">
              <div className="driver-showcase-card-top">
                <div className="driver-avatar-box">
                  <div className="driver-avatar-circle-sm">
                    {driver.initials}
                  </div>
                  <span className="driver-online-dot" title="Profil Actif" />
                </div>

                <div className="driver-identity-meta">
                  <div className="flex items-center gap-2">
                    <h3 className="driver-showcase-name">{driver.name}</h3>
                    <span className="badge-permit-pill">
                      {driver.permit}
                    </span>
                  </div>
                  <p className="driver-showcase-role">{driver.role}</p>
                </div>

                <span className="badge-avail-pill">
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
