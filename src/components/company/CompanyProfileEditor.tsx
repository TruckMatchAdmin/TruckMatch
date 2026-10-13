"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  ShieldCheck,
  Sparkles,
  Save,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Heart,
  Layers,
  HelpCircle,
  Eye,
} from "lucide-react";

const AVAILABLE_BENEFITS = [
  "Camion attitré pour chaque conducteur",
  "Matériel récent (< 3 ans)",
  "Mutuelle d'entreprise renforcée",
  "Primes qualité & éco-conduite",
  "Indemnités & paniers repas majorés",
  "Respect strict de la RSE & temps de repos",
  "Formations FCO & ADR financées",
  "Ambiance familiale & proximité exploitant",
  "Tours réguliers & planning prévisible",
];

const AVAILABLE_EQUIPMENTS = [
  "Semi Tautliner (Rideaux)",
  "Semi Frigo Température Dirigée",
  "Porteur Distribution (19T / 26T)",
  "Benne TP & Travaux Publics",
  "Citerne Matières Dangereuses (ADR)",
  "Citerne Pulvérulente / Vrac",
  "Plateau & Convoi Exceptionnel",
  "Camion Remorque",
  "Fourgon Hayon Express (VUL)",
  "Grue Auxiliaire R490",
];

const AVAILABLE_ZONES = [
  "Régionale (Retour tous les soirs)",
  "Grand Régionale (1 à 2 découchers)",
  "Nationale (Longue distance / Semaine)",
  "Relais & Tractions de nuit",
  "International (Europe)",
];

const FLEET_SIZES = [
  "1 à 5 Véhicules",
  "6 à 15 Véhicules",
  "16 à 50 Véhicules",
  "50 à 100 Véhicules",
  "Plus de 100 Véhicules",
];

export interface CompanyProfileEditorProps {
  initialCompany: any;
  onRefresh?: () => void;
}

export function CompanyProfileEditor({ initialCompany, onRefresh }: CompanyProfileEditorProps) {
  const [company, setCompany] = useState<any>(initialCompany || {});
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Données du profil
  const [logoUrl, setLogoUrl] = useState(initialCompany?.logo_url || "");
  const [coverUrl, setCoverUrl] = useState(initialCompany?.cover_url || "");
  const [companyName, setCompanyName] = useState(initialCompany?.company_name || "");
  const [aboutText, setAboutText] = useState(initialCompany?.about_text || "");
  const [commitmentsText, setCommitmentsText] = useState(initialCompany?.commitments_text || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialCompany?.website_url || "");
  const [foundedYear, setFoundedYear] = useState(initialCompany?.founded_year || "2015");
  const [fleetSize, setFleetSize] = useState(initialCompany?.fleet_size || "16 à 50 Véhicules");
  const [phone, setPhone] = useState(initialCompany?.phone || "");
  const [email, setEmail] = useState(initialCompany?.email || "");
  const [address, setAddress] = useState(initialCompany?.address || "");
  const [city, setCity] = useState(initialCompany?.city || "");
  const [postalCode, setPostalCode] = useState(initialCompany?.postal_code || "");
  const [slug, setSlug] = useState(initialCompany?.slug || "");

  const [driverBenefits, setDriverBenefits] = useState<string[]>(
    Array.isArray(initialCompany?.driver_benefits) && initialCompany.driver_benefits.length > 0
      ? initialCompany.driver_benefits
      : ["Camion attitré pour chaque conducteur", "Matériel récent (< 3 ans)", "Respect strict de la RSE & temps de repos"]
  );

  const [equipmentTypes, setEquipmentTypes] = useState<string[]>(
    Array.isArray(initialCompany?.equipment_types) && initialCompany.equipment_types.length > 0
      ? initialCompany.equipment_types
      : ["Semi Tautliner (Rideaux)", "Semi Frigo Température Dirigée"]
  );

  const [operatingZones, setOperatingZones] = useState<string[]>(
    Array.isArray(initialCompany?.operating_zones) && initialCompany.operating_zones.length > 0
      ? initialCompany.operating_zones
      : ["Régionale (Retour tous les soirs)", "Grand Régionale (1 à 2 découchers)"]
  );

  // Charger profil frais au montage
  useEffect(() => {
    async function loadFreshProfile() {
      try {
        const res = await fetch("/api/company/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.company) {
            const c = json.company;
            setCompany(c);
            if (c.logo_url) setLogoUrl(c.logo_url);
            if (c.cover_url) setCoverUrl(c.cover_url);
            if (c.company_name) setCompanyName(c.company_name);
            if (c.about_text) setAboutText(c.about_text);
            if (c.commitments_text) setCommitmentsText(c.commitments_text);
            if (c.website_url) setWebsiteUrl(c.website_url);
            if (c.founded_year) setFoundedYear(c.founded_year);
            if (c.fleet_size) setFleetSize(c.fleet_size);
            if (c.phone) setPhone(c.phone);
            if (c.email) setEmail(c.email);
            if (c.address) setAddress(c.address);
            if (c.city) setCity(c.city);
            if (c.postal_code) setPostalCode(c.postal_code);
            if (c.slug) setSlug(c.slug);
            if (Array.isArray(c.driver_benefits)) setDriverBenefits(c.driver_benefits);
            if (Array.isArray(c.equipment_types)) setEquipmentTypes(c.equipment_types);
            if (Array.isArray(c.operating_zones)) setOperatingZones(c.operating_zones);
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }
    }
    loadFreshProfile();
  }, []);

  // Upload d'image (Logo ou Couverture)
  const handleUploadImage = async (file: File, type: "logo" | "cover") => {
    if (type === "logo") setUploadingLogo(true);
    else setUploadingCover(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload/company-media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec du téléchargement.");
      }

      if (type === "logo") {
        setLogoUrl(data.url);
      } else {
        setCoverUrl(data.url);
      }

      setSaveSuccess(`Photo ${type === "logo" ? "de profil (logo)" : "de couverture"} mise à jour avec succès.`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de téléchargement");
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  // Enregistrer le profil
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/company/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo_url: logoUrl,
          cover_url: coverUrl,
          about_text: aboutText,
          commitments_text: commitmentsText,
          website_url: websiteUrl,
          founded_year: foundedYear,
          fleet_size: fleetSize,
          phone,
          address,
          postal_code: postalCode,
          city,
          driver_benefits: driverBenefits,
          equipment_types: equipmentTypes,
          operating_zones: operatingZones,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible d'enregistrer le profil.");
      }

      setSaveSuccess("Votre page entreprise est à jour et publiée en ligne !");
      setCompany(data.company);
      if (data.company?.slug) setSlug(data.company.slug);
      if (onRefresh) onRefresh();

      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const currentSlug = slug || (companyName ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "votre-entreprise");
  const publicPageUrl = `/entreprises/${currentSlug}`;
  const fullPublicPageUrl = typeof window !== "undefined" ? `${window.location.origin}${publicPageUrl}` : `https://truckmatch.fr${publicPageUrl}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullPublicPageUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const toggleBenefit = (item: string) => {
    setDriverBenefits((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const toggleEquipment = (item: string) => {
    setEquipmentTypes((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const toggleZone = (item: string) => {
    setOperatingZones((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  return (
    <div className="company-profile-sleek w-full max-w-full flex flex-col gap-6">
      {/* 1. EN-TÊTE ÉPURÉ AVEC COUVERTURE & LOGO INTÉGRÉS */}
      <div className="company-sleek-header">
        {/* Bannière de Couverture */}
        <div
          className="company-sleek-cover"
          style={{
            backgroundImage: coverUrl
              ? `url(${coverUrl})`
              : "linear-gradient(135deg, #091a2e 0%, #0d2a4a 50%, #061729 100%)",
          }}
        >
          <div className="company-sleek-cover-overlay" />

          {/* Bouton pour changer la couverture */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="company-sleek-cover-btn"
          >
            {uploadingCover ? <Loader2 size={13} className="animate-spin text-sky-400" /> : <Camera size={13} />}
            <span>{uploadingCover ? "Téléchargement..." : coverUrl ? "Changer la couverture" : "Ajouter une bannière (1200×400)"}</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file, "cover");
            }}
          />
        </div>

        {/* Barre d'identité (Logo superposé + Nom + Lien public + Bouton Enregistrer) */}
        <div className="company-sleek-identity-bar">
          <div className="company-sleek-avatar-wrap">
            <div className="company-sleek-avatar-box">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={38} className="text-slate-500" />
              )}
              {uploadingLogo && (
                <div className="company-sleek-avatar-loading">
                  <Loader2 size={22} className="animate-spin text-emerald-400" />
                </div>
              )}
            </div>

            {/* Bouton pour changer le logo */}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="company-sleek-avatar-btn"
              title="Changer le logo de l'entreprise"
            >
              <Camera size={13} />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadImage(file, "logo");
              }}
            />
          </div>

          <div className="company-sleek-meta-block">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {companyName || company?.company_name || "Votre Entreprise"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <ShieldCheck size={13} />
                SIRET Vérifié
              </span>
            </div>

            {/* Lien direct vers la page vitrine */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">Lien public :</span>
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="company-sleek-url-pill"
                title="Ouvrir la page publique"
              >
                <Globe size={12} className="text-sky-400" />
                <span>{fullPublicPageUrl}</span>
                <ExternalLink size={11} className="text-slate-400" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="company-sleek-copy-btn"
                title="Copier le lien"
              >
                {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedLink ? "Copié !" : "Copier"}</span>
              </button>
            </div>
          </div>

          {/* Bouton principal Enregistrer en haut */}
          <div className="company-sleek-actions">
            <Link
              href={publicPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="company-sleek-btn-ghost"
            >
              <Eye size={14} />
              <span>Voir la page</span>
            </Link>

            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={loading}
              className="company-sleek-btn-primary"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Toast */}
      {saveSuccess && (
        <div className="company-sleek-alert success">
          <CheckCircle2 size={16} />
          <span>{saveSuccess}</span>
        </div>
      )}
      {errorMessage && (
        <div className="company-sleek-alert error">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. FORMULAIRE ÉPURÉ EN 2 COLONNES HARMONIEUSES */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE (7 / 12) : PRÉSENTATION & ENGAGEMENTS VITRINE */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* SECTION : TEXTES DE PRÉSENTATION */}
          <div className="company-sleek-card">
            <div className="company-sleek-card-header">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Présentation de l&apos;Entreprise
                </h2>
              </div>
              <span className="text-xs text-slate-400">Visible sur votre page publique</span>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div>
                <label className="company-sleek-label">
                  <span>À propos de nous</span>
                  <span className="company-sleek-hint">Présentation de votre activité et histoire</span>
                </label>
                <textarea
                  rows={4}
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder="Présentez votre entreprise de transport en quelques lignes : spécialités, zones, taille de flotte, esprit d'équipe..."
                  className="company-sleek-textarea"
                />
              </div>

              <div>
                <label className="company-sleek-label">
                  <span className="text-emerald-400">Nos engagements conducteurs</span>
                  <span className="company-sleek-hint">RSE, conditions de travail &amp; matériel</span>
                </label>
                <textarea
                  rows={4}
                  value={commitmentsText}
                  onChange={(e) => setCommitmentsText(e.target.value)}
                  placeholder="Décrivez vos engagements pour les chauffeurs : respect scrupuleux des temps de repos, matériel récent, camions attitrés, écoute..."
                  className="company-sleek-textarea"
                />
              </div>
            </div>
          </div>

          {/* SECTION : AVANTAGES & SPÉCIFICITÉS */}
          <div className="company-sleek-card">
            <div className="company-sleek-card-header">
              <div className="flex items-center gap-2">
                <Heart size={17} className="text-pink-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Avantages Conducteurs &amp; Flotte
                </h2>
              </div>
              <span className="text-xs text-slate-400">Cliquez pour activer</span>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Avantages conducteurs */}
              <div>
                <label className="company-sleek-label mb-2">Avantages accordés à vos chauffeurs</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BENEFITS.map((item) => {
                    const active = driverBenefits.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleBenefit(item)}
                        className={`company-sleek-chip ${active ? "active-emerald" : ""}`}
                      >
                        <Check size={12} className={active ? "text-emerald-400" : "opacity-30"} />
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matériels roulants */}
              <div className="pt-4 border-t border-slate-800/80">
                <label className="company-sleek-label mb-2">Matériels exploités dans votre flotte</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EQUIPMENTS.map((item) => {
                    const active = equipmentTypes.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEquipment(item)}
                        className={`company-sleek-chip ${active ? "active-sky" : ""}`}
                      >
                        <Truck size={12} className={active ? "text-sky-400" : "opacity-30"} />
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zones de tournées */}
              <div className="pt-4 border-t border-slate-800/80">
                <label className="company-sleek-label mb-2">Zones de transport</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ZONES.map((item) => {
                    const active = operatingZones.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleZone(item)}
                        className={`company-sleek-chip ${active ? "active-amber" : ""}`}
                      >
                        <MapPin size={12} className={active ? "text-amber-400" : "opacity-30"} />
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLONNE DROITE (5 / 12) : COORDONNÉES, FLOTTE & INFORMATIONS LÉGALES */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="company-sleek-card">
            <div className="company-sleek-card-header">
              <div className="flex items-center gap-2">
                <Building2 size={17} className="text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Informations Générales
                </h2>
              </div>
              <span className="text-xs text-slate-400">Coordonnées</span>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="company-sleek-label">Raison Sociale</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex : Transports Durand SAS"
                  className="company-sleek-input"
                />
              </div>

              <div>
                <label className="company-sleek-label">Numéro SIRET</label>
                <input
                  type="text"
                  value={company?.siret || "892 451 902 00024"}
                  readOnly
                  className="company-sleek-input bg-slate-900/40 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="company-sleek-label">Taille de Flotte</label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    className="company-sleek-input"
                  >
                    {FLEET_SIZES.map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="company-sleek-label">Année Création</label>
                  <input
                    type="text"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="2015"
                    className="company-sleek-input"
                  />
                </div>
              </div>

              <div>
                <label className="company-sleek-label">Téléphone Direction / Exploitation</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="04 78 00 00 00"
                    className="company-sleek-input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="company-sleek-label">Email Recrutement</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recrutement@transport.fr"
                    className="company-sleek-input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="company-sleek-label">Site Web Officiel</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.transport-durand.fr"
                    className="company-sleek-input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="company-sleek-label">Adresse du Dépôt / Siège</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Zone Industrielle Sud, 12 rue du Fret"
                  className="company-sleek-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="company-sleek-label">Code Postal</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="69002"
                    className="company-sleek-input"
                  />
                </div>

                <div>
                  <label className="company-sleek-label">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lyon"
                    className="company-sleek-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARTE LIEN & VISIBILITÉ */}
          <div className="company-sleek-card" style={{ background: "linear-gradient(180deg, #091726 0%, #06111e 100%)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Votre Vitrine en Ligne</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toutes les informations enregistrées sont immédiatement publiées sur votre page officielle TruckMatch. Les chauffeurs peuvent la consulter et y postuler directement.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="company-sleek-btn-ghost flex-1 justify-center"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedLink ? "Lien copié" : "Copier le lien"}</span>
                </button>

                <Link
                  href={publicPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="company-sleek-btn-primary flex-1 justify-center"
                >
                  <ExternalLink size={13} />
                  <span>Ouvrir la page</span>
                </Link>
              </div>
            </div>
          </div>

          {/* BOUTON ENREGISTRER BAS */}
          <button
            type="submit"
            disabled={loading}
            className="company-sleek-btn-primary w-full justify-center py-3 text-sm font-bold shadow-lg shadow-emerald-950/40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{loading ? "Enregistrement en cours..." : "Enregistrer les modifications"}</span>
          </button>

        </div>

      </form>
    </div>
  );
}
