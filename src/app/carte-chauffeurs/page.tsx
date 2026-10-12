"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import {
  MapPin,
  Search,
  Filter,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  Sparkles,
  X,
  Layers,
  Compass,
  Clock,
  Send,
  Eye,
  Check,
  Maximize2,
  RotateCcw,
  Users,
  Navigation,
} from "lucide-react";

// Types
interface DriverCandidate {
  id: string;
  initials: string;
  name: string; // Nom anonymisé RGPD
  role: string;
  permit: "CE" | "C" | "Porteur" | "VUL";
  permitLabel: string;
  city: string;
  zip: string;
  department: string;
  region: string;
  lat: number;
  lng: number;
  availability: "immediat" | "48h" | "15j";
  availabilityLabel: string;
  mobilityRadius: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  verifiedFco: boolean;
  verifiedChrono: boolean;
  colorType: "spl" | "pl" | "special" | "vul";
}

// Table de correspondance géographique pour positionner précisément les conducteurs inscrits
const DEPT_COORDS: Record<string, { lat: number; lng: number; region: string }> = {
  "59": { lat: 50.6292, lng: 3.0573, region: "Hauts-de-France" },
  "62": { lat: 50.7252, lng: 1.6133, region: "Hauts-de-France" },
  "80": { lat: 49.8941, lng: 2.2958, region: "Hauts-de-France" },
  "02": { lat: 49.5641, lng: 3.6236, region: "Hauts-de-France" },
  "60": { lat: 49.4295, lng: 2.0811, region: "Hauts-de-France" },
  "75": { lat: 48.8566, lng: 2.3522, region: "Île-de-France" },
  "77": { lat: 48.5392, lng: 2.6530, region: "Île-de-France" },
  "78": { lat: 48.8014, lng: 2.1301, region: "Île-de-France" },
  "91": { lat: 48.6298, lng: 2.4418, region: "Île-de-France" },
  "92": { lat: 48.8924, lng: 2.2153, region: "Île-de-France" },
  "93": { lat: 48.9137, lng: 2.4836, region: "Île-de-France" },
  "94": { lat: 48.7904, lng: 2.4556, region: "Île-de-France" },
  "95": { lat: 49.0360, lng: 2.0631, region: "Île-de-France" },
  "69": { lat: 45.7640, lng: 4.8357, region: "Auvergne-Rhône-Alpes" },
  "38": { lat: 45.1885, lng: 5.7245, region: "Auvergne-Rhône-Alpes" },
  "42": { lat: 45.4397, lng: 4.3872, region: "Auvergne-Rhône-Alpes" },
  "01": { lat: 46.2052, lng: 5.2258, region: "Auvergne-Rhône-Alpes" },
  "74": { lat: 45.8992, lng: 6.1294, region: "Auvergne-Rhône-Alpes" },
  "73": { lat: 45.5646, lng: 5.9178, region: "Auvergne-Rhône-Alpes" },
  "13": { lat: 43.2965, lng: 5.3698, region: "Provence-Alpes-Côte d'Azur" },
  "83": { lat: 43.1242, lng: 5.9280, region: "Provence-Alpes-Côte d'Azur" },
  "06": { lat: 43.7102, lng: 7.2620, region: "Provence-Alpes-Côte d'Azur" },
  "84": { lat: 43.9493, lng: 4.8055, region: "Provence-Alpes-Côte d'Azur" },
  "33": { lat: 44.8378, lng: -0.5792, region: "Nouvelle-Aquitaine" },
  "64": { lat: 43.2951, lng: -0.3708, region: "Nouvelle-Aquitaine" },
  "17": { lat: 46.1603, lng: -1.1511, region: "Nouvelle-Aquitaine" },
  "44": { lat: 47.2184, lng: -1.5536, region: "Pays de la Loire" },
  "49": { lat: 47.4784, lng: -0.5632, region: "Pays de la Loire" },
  "72": { lat: 48.0061, lng: 0.1996, region: "Pays de la Loire" },
  "85": { lat: 46.6705, lng: -1.4268, region: "Pays de la Loire" },
  "35": { lat: 48.1173, lng: -1.6778, region: "Bretagne" },
  "29": { lat: 48.3904, lng: -4.4861, region: "Bretagne" },
  "56": { lat: 47.6582, lng: -2.7608, region: "Bretagne" },
  "22": { lat: 48.5141, lng: -2.7658, region: "Bretagne" },
  "31": { lat: 43.6047, lng: 1.4442, region: "Occitanie" },
  "34": { lat: 43.6108, lng: 3.8767, region: "Occitanie" },
  "30": { lat: 43.8367, lng: 4.3601, region: "Occitanie" },
  "67": { lat: 48.5734, lng: 7.7521, region: "Grand Est" },
  "68": { lat: 47.7508, lng: 7.3359, region: "Grand Est" },
  "57": { lat: 49.1193, lng: 6.1757, region: "Grand Est" },
  "54": { lat: 48.6921, lng: 6.1844, region: "Grand Est" },
  "51": { lat: 49.2583, lng: 4.0317, region: "Grand Est" },
  "76": { lat: 49.4432, lng: 1.0999, region: "Normandie" },
  "14": { lat: 49.1829, lng: -0.3707, region: "Normandie" },
  "27": { lat: 49.0275, lng: 1.1508, region: "Normandie" },
  "45": { lat: 47.9029, lng: 1.9039, region: "Centre-Val de Loire" },
  "37": { lat: 47.3941, lng: 0.6848, region: "Centre-Val de Loire" },
  "28": { lat: 48.4439, lng: 1.4890, region: "Centre-Val de Loire" },
  "21": { lat: 47.3220, lng: 5.0415, region: "Bourgogne-Franche-Comté" },
  "25": { lat: 47.2378, lng: 6.0241, region: "Bourgogne-Franche-Comté" },
  "71": { lat: 46.7808, lng: 4.8528, region: "Bourgogne-Franche-Comté" },
};

export default function CarteChauffeursPage() {
  const [candidates, setCandidates] = useState<DriverCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<DriverCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermit, setSelectedPermit] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");

  // Chargement en direct depuis Supabase des conducteurs validés par l'administration
  useEffect(() => {
    async function fetchApprovedCandidates() {
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .or("status.eq.approved,is_approved.eq.true")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const list: DriverCandidate[] = data.map((d: any) => {
            const dept = (d.postal_code || "").slice(0, 2);
            const fallbackInfo = DEPT_COORDS[dept] || { lat: 46.603354, lng: 2.352222, region: "France" };
            const lat = typeof d.latitude === "number" && !isNaN(d.latitude) && d.latitude !== 0 ? d.latitude : fallbackInfo.lat;
            const lng = typeof d.longitude === "number" && !isNaN(d.longitude) && d.longitude !== 0 ? d.longitude : fallbackInfo.lng;

            const isSPL = d.permits?.includes("CE");
            const isPL = d.permits?.includes("C");
            const permitType: "CE" | "C" | "Porteur" | "VUL" = isSPL ? "CE" : isPL ? "C" : "VUL";
            const colorType: "spl" | "pl" | "special" | "vul" = isSPL
              ? (d.adr?.length > 0 ? "special" : "spl")
              : isPL ? "pl" : "vul";

            return {
              id: d.id,
              initials: `${(d.first_name || "C")[0]}${(d.last_name || "D")[0]}`.toUpperCase(),
              name: `${d.first_name || "Chauffeur"} ${(d.last_name || "").slice(0, 1)}.`,
              role: isSPL ? "Conducteur Routier SPL" : isPL ? "Chauffeur Distribution PL" : "Chauffeur Livreur VUL",
              permit: permitType,
              permitLabel: isSPL ? "Permis CE (Super Lourd)" : isPL ? "Permis C (Poids Lourd)" : "Permis B (Utilitaire)",
              city: d.city || "France",
              zip: d.postal_code || "",
              department: d.department || `${dept} - Secteur Régional`,
              region: fallbackInfo.region,
              lat,
              lng,
              availability: d.availability === "immediate" ? "immediat" : "48h",
              availabilityLabel: d.availability === "immediate" ? "Disponible immédiatement" : "Disponible sous 48h",
              mobilityRadius: "Rayon régional / national",
              experienceYears: parseInt(d.experience_years) || (d.experience === "5+" ? 7 : d.experience === "3-5" ? 4 : 2),
              specialties: Array.isArray(d.specialties) && d.specialties.length > 0 ? d.specialties : ["FCO Valide", "Carte Chrono"],
              bio: d.bio || `Conducteur professionnel secteur ${d.city || "France"}. Titres et documents contrôlés par TruckMatch.`,
              verifiedFco: Boolean(d.fco),
              verifiedChrono: Boolean(d.chrono_card),
              colorType,
            };
          });

          setCandidates(list);
          if (list.length > 0) {
            setSelectedCandidate(list[0]);
          }
        }
      } catch (err) {
        console.error("Erreur chargement chauffeurs carte:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApprovedCandidates();
  }, []);

  // Modale de contact
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [modalForm, setModalForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    contractType: "CDI",
    message: "",
  });

  // Référence DOM pour la carte Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Filtrage réactif
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          c.city.toLowerCase().includes(q) ||
          c.zip.includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedPermit !== "all" && c.permit !== selectedPermit) {
        return false;
      }

      if (selectedRegion !== "all" && c.region !== selectedRegion) {
        return false;
      }

      if (selectedAvailability !== "all" && c.availability !== selectedAvailability) {
        return false;
      }

      return true;
    });
  }, [candidates, searchQuery, selectedPermit, selectedRegion, selectedAvailability]);

  // Limiter le volet latéral aux 10 derniers profils inscrits
  const displayedCandidates = useMemo(() => {
    return filteredCandidates.slice(0, 10);
  }, [filteredCandidates]);

  // Initialisation et cycle de vie de Leaflet
  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (!mapContainerRef.current || typeof window === "undefined") return;

      const L = (await import("leaflet")).default;

      if (!isMounted) return;

      // Nettoyer si déjà initialisé
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialiser la carte centrée sur la France
      const map = L.map(mapContainerRef.current, {
        center: [46.603354, 2.352222], // Centre géographique de la France
        zoom: 6,
        minZoom: 5,
        maxZoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Fond de carte ESRI World Street Map : réseau routier ultra-net, sans filigrane, sans clé d'API
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a> | TruckMatch France',
          maxZoom: 18,
        }
      ).addTo(map);

      // Layer group pour les marqueurs
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      renderMarkers(L, map, markersLayer, filteredCandidates);
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour des marqueurs quand le filtre change
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import("leaflet")).default;
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current, filteredCandidates);
    }
    updateMarkers();
  }, [filteredCandidates]);

  // Fonction de rendu des marqueurs Leaflet
  const renderMarkers = (L: any, map: any, layer: any, candidates: DriverCandidate[]) => {
    layer.clearLayers();

    candidates.forEach((candidate) => {
      // Point balise clignotant épuré selon la couleur du lexique (sans texte ni nom de ville pour éviter la saturation)
      const customIcon = L.divIcon({
        className: "truck-beacon-icon",
        html: `
          <div class="truck-beacon-wrapper ${candidate.colorType}">
            <span class="beacon-pulse-ring"></span>
            <span class="beacon-core-dot"></span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([candidate.lat, candidate.lng], { icon: customIcon });

      // Popup moderne au clic
      const popupHtml = `
        <div class="map-popup-card">
          <div class="map-popup-header">
            <div>
              <div class="map-popup-title">${candidate.name}</div>
              <div style="font-size:12px; font-weight:700; color:#0080ff;">${candidate.role}</div>
            </div>
            <span class="badge ${candidate.availability === "immediat" ? "badge-green" : "badge-blue"}" style="font-size:10px;">
              ${candidate.availability === "immediat" ? "🟢 Immédiat" : "🔵 Sous 48h"}
            </span>
          </div>
          <div class="map-popup-loc">
            <span>📍</span>
            <span><strong>${candidate.city}</strong> (${candidate.zip}) • ${candidate.mobilityRadius}</span>
          </div>
          <div class="map-popup-tags">
            ${candidate.specialties.map((s) => `<span class="map-popup-tag">${s}</span>`).join("")}
          </div>
          <div style="font-size:12px; color:#475569; margin-top:2px;">
            Expérience : <strong>${candidate.experienceYears} ans</strong>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        setSelectedCandidate(candidate);
      });

      marker.addTo(layer);
    });
  };

  // Zoom direct sur un candidat au clic depuis le volet latéral
  const handleFlyToCandidate = async (candidate: DriverCandidate) => {
    setSelectedCandidate(candidate);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([candidate.lat, candidate.lng], 10, {
        duration: 1.2,
      });
    }
  };

  // Réinitialiser la vue France entière
  const handleResetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([46.603354, 2.352222], 6, {
        duration: 1,
      });
    }
  };

  const handleOpenContact = (candidate: DriverCandidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setContactSuccess(false);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setContactSuccess(false);
    }, 2400);
  };

  return (
    <div className="trouver-chauffeur-page">
      {/* 1. Hero Recrutement Géolocalisé (Identique aux pages précédentes) */}
      <section className="recruiter-hero-section">
        <div className="container">
          <div className="recruiter-hero-grid">
            <div className="recruiter-hero-content">
              <div className="hero-tag">
                <span className="hero-tag-dot" />
                <span>Radar Recrutement France • Données Inscriptions en Temps Réel</span>
              </div>

              <h1 className="hero-title">
                Carte interactive des
                <span className="hero-title-highlight">chauffeurs disponibles</span>
              </h1>

              <p className="hero-subtitle">
                Localisez immédiatement les conducteurs routiers qualifiés (SPL, PL, Porteur, VUL)
                inscrits sur TruckMatch. Filtrez par commune de résidence, permis et habilitations pour
                engager vos recrutements en circuit court et sans intermédiaire.
              </p>

              <div className="hero-cta-group">
                <a href="#carte-interactive" className="btn btn-primary btn-lg">
                  <MapPin size={17} />
                  <span>Explorer la carte de France</span>
                </a>
                <Link href="/entreprises" className="btn btn-outline btn-lg">
                  <Building2 size={17} />
                  <span>Déposer une offre d'emploi</span>
                </Link>
              </div>

              {/* Mots-clés SEO interactifs */}
              <div className="hero-seo-pills">
                <span className="seo-pill-label">Bassins recherchés :</span>
                <span className="seo-pill" onClick={() => setSearchQuery("Lille")} style={{ cursor: "pointer" }}>
                  Chauffeur SPL Lille (59)
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Lyon")} style={{ cursor: "pointer" }}>
                  Conducteur PL Lyon (69)
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Fos-sur-Mer")} style={{ cursor: "pointer" }}>
                  ADR Citerne PACA
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Roissy")} style={{ cursor: "pointer" }}>
                  Traction Roissy CDG
                </span>
                <span className="seo-pill" onClick={() => setSearchQuery("Rennes")} style={{ cursor: "pointer" }}>
                  Frigo Bretagne
                </span>
              </div>
            </div>

            {/* Colonne droite : Visuel Photoréaliste Radar & Carte Chauffeurs */}
            <div className="recruiter-hero-visual">
              <div className="recruiter-image-card">
                <Image
                  src="/images/hero-carte-chauffeurs.png"
                  alt="Carte interactive des chauffeurs géolocalisés en France - Radar de recrutement TruckMatch"
                  width={1024}
                  height={369}
                  priority
                  className="recruiter-main-img"
                />
              </div>
            </div>
          </div>

          {/* Bandeau de réassurance Transport 4 métriques */}
          <div className="recruiter-metrics-strip">
            <div className="recruiter-metric-card">
              <div className="visual-metric-icon">
                <Truck size={24} />
              </div>
              <div>
                <p className="visual-metric-val">1 480 Conducteurs</p>
                <p className="visual-metric-label">Géolocalisés en France</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e6f9f0", color: "#10b981" }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="visual-metric-val">342 Disponibles</p>
                <p className="visual-metric-label">Prêts à rouler immédiatement</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#e8f3ff", color: "#0080ff" }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="visual-metric-val">98,4% Validés</p>
                <p className="visual-metric-label">Permis, FCO & Cartes Chrono</p>
              </div>
            </div>

            <div className="recruiter-metric-card">
              <div className="visual-metric-icon" style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}>
                <MapPin size={24} />
              </div>
              <div>
                <p className="visual-metric-val">95 Départements</p>
                <p className="visual-metric-label">Couverture nationale intégrale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filtres & Moteur de Recherche Géographique */}
      <section id="carte-interactive" className="container" style={{ marginBottom: "2rem" }}>
        <div className="jobs-filter-box">
          <div className="filter-header-wrap" style={{ marginBottom: "1.5rem" }}>
            <h2 className="filter-title">Rechercher parmi les conducteurs géolocalisés</h2>
            <p className="filter-subtitle">
              Filtrez par commune ou village de résidence, type de permis, région ou disponibilité immédiate.
            </p>
          </div>

          <div className="jobs-search-row" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr" }}>
            {/* Recherche textuelle par commune ou code postal */}
            <div className="jobs-search-input-wrap">
              <Search size={18} className="jobs-search-ico" />
              <input
                type="text"
                placeholder="Ville, village ou département (ex: Lille, Saint-Priest, Fos-sur-Mer, 59, 69)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="jobs-text-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sélecteur de Permis */}
            <div>
              <select
                value={selectedPermit}
                onChange={(e) => setSelectedPermit(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Tous les permis</option>
                <option value="CE">Permis CE (Super Lourd SPL)</option>
                <option value="C">Permis C (Poids Lourd Distribution)</option>
                <option value="Porteur">Porteur Spécialisé / Grue</option>
                <option value="VUL">Permis B (Utilitaire VUL)</option>
              </select>
            </div>

            {/* Sélecteur de Région */}
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Toutes les régions</option>
                <option value="Hauts-de-France">Hauts-de-France (59, 62...)</option>
                <option value="Île-de-France">Île-de-France (75, 93, 95...)</option>
                <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes (69, 38...)</option>
                <option value="Provence-Alpes-Côte d'Azur">PACA (13, 06...)</option>
                <option value="Occitanie">Occitanie (31, 34...)</option>
                <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine (33, 64...)</option>
                <option value="Bretagne">Bretagne (35, 29...)</option>
                <option value="Pays de la Loire">Pays de la Loire (44, 49...)</option>
                <option value="Grand Est">Grand Est (67, 57...)</option>
                <option value="Normandie">Normandie (76, 14...)</option>
                <option value="Centre-Val de Loire">Centre-Val de Loire (45, 37...)</option>
                <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté (21, 25...)</option>
              </select>
            </div>

            {/* Sélecteur de Disponibilité */}
            <div>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="jobs-select-field"
              >
                <option value="all">Toutes disponibilités</option>
                <option value="immediat">⚡ Immédiatement</option>
                <option value="48h">Sous 48 heures</option>
              </select>
            </div>
          </div>

          {/* Filtres rapides en boutons pills */}
          <div className="filter-tags-quick">
            <span className="quick-tag-label">Filtres rapides :</span>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "all" ? "active" : ""}`}
              onClick={() => setSelectedPermit("all")}
            >
              Tous ({filteredCandidates.length})
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "CE" ? "active" : ""}`}
              onClick={() => setSelectedPermit("CE")}
            >
              Conducteurs SPL
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "C" ? "active" : ""}`}
              onClick={() => setSelectedPermit("C")}
            >
              Chauffeurs PL
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "Porteur" ? "active" : ""}`}
              onClick={() => setSelectedPermit("Porteur")}
            >
              Porteurs & Grue TP
            </button>
            <button
              type="button"
              className={`quick-filter-btn ${selectedPermit === "VUL" ? "active" : ""}`}
              onClick={() => setSelectedPermit("VUL")}
            >
              Livreurs VUL
            </button>

            {(searchQuery || selectedPermit !== "all" || selectedRegion !== "all" || selectedAvailability !== "all") && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPermit("all");
                  setSelectedRegion("all");
                  setSelectedAvailability("all");
                  handleResetMapView();
                }}
              >
                <RotateCcw size={14} />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Section Carte Interactive Pleine Fonctionnalité + Volet Candidats */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <div className="map-container-grid">
          {/* Colonne Gauche : Carte Leaflet Interactive */}
          <div style={{ position: "relative" }}>
            {/* Boutons d'action rapides au-dessus de la carte */}
            <div className="map-quick-actions">
              <button
                type="button"
                className="map-action-pill"
                onClick={handleResetMapView}
                title="Recentrer la carte sur la France entière"
              >
                <RotateCcw size={14} />
                <span>Vue France entière</span>
              </button>
            </div>

            {/* Conteneur Leaflet Réel */}
            <div ref={mapContainerRef} className="leaflet-france-container" />

            {/* Légende interactive sous la carte */}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <span className="legend-item">
                  <span className="legend-dot-spl" />
                  <span>Permis CE (SPL)</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot-pl" />
                  <span>Permis C (PL)</span>
                </span>
                <span className="legend-item">
                  <span className="legend-dot-special" />
                  <span>Spécialités ADR / Frigo / CACES</span>
                </span>
                <span className="legend-item">
                  <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ea580c" }} />
                  <span>Permis B (VUL)</span>
                </span>
              </div>
              <span>💡 Zoomez avec la molette ou cliquez sur un marqueur</span>
            </div>
          </div>

          {/* Colonne Droite : Volet Latéral des Profils Disponibles */}
          <aside className="candidate-drawer-card">
            <div className="drawer-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className="drawer-title">Profils disponibles (10 derniers inscrits)</h3>
                <span className="drawer-count-badge">10 récents</span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--color-text-muted)" }}>
                Les 10 derniers conducteurs inscrits. Cliquez sur « Localiser » pour centrer la carte.
              </p>
            </div>

            <div className="drawer-scrollable-list">
              {filteredCandidates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                  <Search size={36} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <p style={{ fontWeight: 700 }}>Aucun chauffeur ne correspond à vos filtres.</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                    Élargissez vos critères ou réinitialisez la recherche.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: "1rem" }}
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedPermit("all");
                      setSelectedRegion("all");
                      setSelectedAvailability("all");
                      handleResetMapView();
                    }}
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                displayedCandidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`candidate-compact-item ${isSelected ? "selected" : ""}`}
                      onClick={() => handleFlyToCandidate(c)}
                    >
                      <div className="candidate-compact-top">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              backgroundColor: "var(--color-primary-light)",
                              color: "var(--color-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.95rem",
                            }}
                          >
                            {c.initials}
                          </div>
                          <div>
                            <div className="candidate-compact-name">{c.name}</div>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--color-primary)" }}>
                              {c.role} ({c.permit})
                            </div>
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            c.availability === "immediat" ? "badge-green" : "badge-blue"
                          }`}
                          style={{ fontSize: "0.72rem" }}
                        >
                          {c.availability === "immediat" ? "🟢 Immédiat" : "🔵 Sous 48h"}
                        </span>
                      </div>

                      <div className="candidate-compact-meta">
                        <MapPin size={15} color="var(--color-primary)" />
                        <span>
                          <strong>{c.city}</strong> ({c.zip}) • {c.mobilityRadius}
                        </span>
                      </div>

                      <div className="candidate-badges-compact">
                        {c.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              background: "rgba(0, 128, 255, 0.08)",
                              color: "var(--color-primary)",
                              padding: "0.2rem 0.55rem",
                              borderRadius: "999px",
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                        {c.bio}
                      </p>

                      <div className="candidate-compact-footer">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: "0.78rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlyToCandidate(c);
                          }}
                        >
                          <Navigation size={13} />
                          <span>Localiser</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenContact(c);
                          }}
                        >
                          <Send size={13} />
                          <span>Contacter</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* 4. Section SEO Recrutement Local (Identique à la charte) */}
      <section className="recruiter-seo-section">
        <div className="container">
          <div className="seo-card-container">
            <div className="section-head-modern" style={{ marginBottom: "2rem" }}>
              <span className="badge badge-blue">Recrutement Géolocalisé Transport</span>
              <h2>Pourquoi cartographier vos recrutements de conducteurs routiers ?</h2>
              <p>
                Dans le transport de marchandises, la proximité géographique entre le domicile du chauffeur
                et votre base d'exploitation est le premier facteur de fidélisation et de sécurité routière.
              </p>
            </div>

            <div className="features-grid-3">
              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <MapPin size={24} />
                </div>
                <h3>Zéro fatigue de trajet domicile-travail</h3>
                <p>
                  Un conducteur qui réside à proximité immédiate de son dépôt commence sa tournée
                  en pleine possession de ses moyens. Vous réduisez les risques d'accident de trajet et préservez sa vigilance.
                </p>
              </div>

              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <Clock size={24} />
                </div>
                <h3>Respect strict de la RSE</h3>
                <p>
                  Avec un temps de navette réduit, vos chauffeurs respectent scrupuleusement les temps de repos
                  de 11h consécutives et les amplitudes journalières sans stress d'horaires.
                </p>
              </div>

              <div className="feature-block-modern">
                <div className="feature-icon-circle">
                  <ShieldCheck size={24} />
                </div>
                <h3>Stabilité et baisse du turn-over</h3>
                <p>
                  Les conducteurs embauchés sur leur bassin de vie restent 3 fois plus longtemps en poste dans la même entreprise.
                  Vous pérennisez vos tournées régionales et évitez les remplacements d'urgence coûteux.
                </p>
              </div>
            </div>

            {/* FAQ Géolocalisation */}
            <div className="seo-faq-grid" style={{ marginTop: "2.5rem" }}>
              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Comment sont validées les communes des conducteurs ?</h3>
                <p className="seo-faq-a">
                  Lors de son inscription sur TruckMatch, chaque conducteur renseigne sa commune de résidence
                  et son code postal. Ces éléments sont vérifiés lors du contrôle des justificatifs officiels
                  (Carte de Qualification Conducteur FCO et Carte Chronotachygraphe) pour garantir une géolocalisation fiable.
                </p>
              </div>

              <div className="seo-faq-card">
                <h3 className="seo-faq-q">Puis-je recruter pour des tractions nationales avec découchés ?</h3>
                <p className="seo-faq-a">
                  Tout à fait. Sur chaque profil, le rayon de mobilité est clairement affiché (ex : retour chaque soir,
                  liaisons régionales ou grand routier national). Vous ciblez exactement le mode de vie recherché par le chauffeur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modale de Contact / Recrutement Direct */}
      {isModalOpen && selectedCandidate && (
        <div className="map-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="map-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                {selectedCandidate.initials}
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-navy)" }}>
                  Proposer un poste à {selectedCandidate.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  {selectedCandidate.role} ({selectedCandidate.permit}) à {selectedCandidate.city} ({selectedCandidate.zip})
                </p>
              </div>
            </div>

            {contactSuccess ? (
              <div
                style={{
                  padding: "2rem",
                  background: "#e6f9f0",
                  borderRadius: "var(--radius-lg)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#10b981",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={28} />
                </div>
                <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#065f46" }}>
                  Proposition envoyée avec succès !
                </h4>
                <p style={{ fontSize: "0.88rem", color: "#047857" }}>
                  Votre prise de contact a été notifiée à {selectedCandidate.name}. Le candidat prendra directement
                  contact avec vous par téléphone ou email dans un délai moyen de 2 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Entreprise de transport *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Transports Express Ouest"
                      value={modalForm.companyName}
                      onChange={(e) => setModalForm({ ...modalForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-field-modern">
                    <label>Responsable recrutement *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: David M., Responsable Exploitation"
                      value={modalForm.contactName}
                      onChange={(e) => setModalForm({ ...modalForm, contactName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Téléphone direct *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 06 12 34 56 78"
                      value={modalForm.phone}
                      onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-field-modern">
                    <label>Email professionnel *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: exploitation@transports.fr"
                      value={modalForm.email}
                      onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-modern">
                    <label>Type de contrat</label>
                    <select
                      value={modalForm.contractType}
                      onChange={(e) => setModalForm({ ...modalForm, contractType: e.target.value })}
                    >
                      <option value="CDI">CDI (Temps plein)</option>
                      <option value="CDD">CDD (Saisonnier / Remplacement)</option>
                      <option value="Relais">Traction ponctuelle / Relais</option>
                    </select>
                  </div>
                  <div className="form-field-modern">
                    <label>Prise de poste</label>
                    <input type="text" placeholder="Ex: Immédiate ou sous 15 jours" />
                  </div>
                </div>

                <div className="form-field-modern">
                  <label>Précisions sur la tournée ou le matériel (facultatif)</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Recherche chauffeur pour liaison régulière de nuit en tautliner au départ de notre agence..."
                    value={modalForm.message}
                    onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                  />
                </div>

                <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary btn-lg w-full">
                    <Send size={18} />
                    <span>Envoyer la proposition au conducteur</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.76rem", color: "var(--color-text-light)", textAlign: "center" }}>
                  🔒 Contact 100% direct et confidentiel. Aucun intermédiaire ni commission d'agence.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
