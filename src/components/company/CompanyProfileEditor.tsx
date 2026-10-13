"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
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
  Award,
  Layers,
  Heart,
  FileText,
} from "lucide-react";

const AVAILABLE_EQUIPMENTS = [
  "Semi Tautliner (Rideaux)",
  "Semi Frigo Température Dirigée",
  "Porteur Distribution (19T / 26T)",
  "Benne TP / Travaux Publics",
  "Citerne Matières Dangereuses (ADR)",
  "Citerne Pulvérulente / Alimentaire",
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

const AVAILABLE_BENEFITS = [
  "Camion attitré pour chaque conducteur",
  "Matériel récent (< 3 ans)",
  "Mutuelle d'entreprise renforcée",
  "Primes de qualité & assiduité",
  "Indemnités & paniers repas majorés",
  "Respect strict de la RSE & temps de repos",
  "Formations FCO / ADR financées",
  "Ambiance familiale & écoute de l'exploitant",
  "Tours réguliers & planning stable",
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

  // Form states
  const [logoUrl, setLogoUrl] = useState(initialCompany?.logo_url || "");
  const [coverUrl, setCoverUrl] = useState(initialCompany?.cover_url || "");
  const [companyName, setCompanyName] = useState(initialCompany?.company_name || "");
  const [aboutText, setAboutText] = useState(initialCompany?.about_text || "");
  const [commitmentsText, setCommitmentsText] = useState(initialCompany?.commitments_text || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialCompany?.website_url || "");
  const [foundedYear, setFoundedYear] = useState(initialCompany?.founded_year || "2015");
  const [fleetSize, setFleetSize] = useState(initialCompany?.fleet_size || "10 - 50 Poids Lourds");
  const [phone, setPhone] = useState(initialCompany?.phone || "");
  const [email, setEmail] = useState(initialCompany?.email || "");
  const [address, setAddress] = useState(initialCompany?.address || "");
  const [city, setCity] = useState(initialCompany?.city || "");
  const [postalCode, setPostalCode] = useState(initialCompany?.postal_code || "");
  const [slug, setSlug] = useState(initialCompany?.slug || "");
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>(
    Array.isArray(initialCompany?.equipment_types) ? initialCompany.equipment_types : ["Semi Tautliner (Rideaux)", "Semi Frigo Température Dirigée"]
  );
  const [operatingZones, setOperatingZones] = useState<string[]>(
    Array.isArray(initialCompany?.operating_zones) ? initialCompany.operating_zones : ["Régionale (Retour tous les soirs)", "Grand Régionale (1 à 2 découchers)"]
  );
  const [driverBenefits, setDriverBenefits] = useState<string[]>(
    Array.isArray(initialCompany?.driver_benefits) ? initialCompany.driver_benefits : [
      "Camion attitré pour chaque conducteur",
      "Matériel récent (< 3 ans)",
      "Mutuelle d'entreprise renforcée",
      "Respect strict de la RSE & temps de repos",
    ]
  );

  // Charger profil frais depuis l'API
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/company/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.company) {
          setCompany(data.company);
          setLogoUrl(data.company.logo_url || "");
          setCoverUrl(data.company.cover_url || "");
          setCompanyName(data.company.company_name || "");
          setAboutText(data.company.about_text || "");
          setCommitmentsText(data.company.commitments_text || "");
          setWebsiteUrl(data.company.website_url || "");
          setFoundedYear(data.company.founded_year || "2015");
          setFleetSize(data.company.fleet_size || "10 - 50 Poids Lourds");
          setPhone(data.company.phone || "");
          setEmail(data.company.email || "");
          setAddress(data.company.address || "");
          setCity(data.company.city || "");
          setPostalCode(data.company.postal_code || "");
          setSlug(data.company.slug || "");
          if (Array.isArray(data.company.equipment_types)) setEquipmentTypes(data.company.equipment_types);
          if (Array.isArray(data.company.operating_zones)) setOperatingZones(data.company.operating_zones);
          if (Array.isArray(data.company.driver_benefits)) setDriverBenefits(data.company.driver_benefits);
        }
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Upload Photo (Logo ou Couverture)
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
        throw new Error(data.error || "Échec du téléchargement de l'image.");
      }

      if (type === "logo") {
        setLogoUrl(data.url);
      } else {
        setCoverUrl(data.url);
      }
      setSaveSuccess(`Photo ${type === "logo" ? "de profil (logo)" : "de couverture"} chargée avec succès !`);
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message);
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
          equipment_types: equipmentTypes,
          operating_zones: operatingZones,
          driver_benefits: driverBenefits,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible d'enregistrer le profil.");
      }

      setSaveSuccess(data.message || "Page de présentation mise à jour avec succès !");
      setCompany(data.company);
      if (data.company.slug) setSlug(data.company.slug);
      if (onRefresh) onRefresh();

      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message);
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

  const toggleEquipment = (eq: string) => {
    setEquipmentTypes((prev) => (prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]));
  };

  const toggleZone = (z: string) => {
    setOperatingZones((prev) => (prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]));
  };

  const toggleBenefit = (b: string) => {
    setDriverBenefits((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  return (
    <div className="company-profile-editor-wrap flex flex-col gap-6 w-full">
      {/* 1. CARTE DE PRÉVISUALISATION DIRECTE AVEC COUVERTURE & LOGO */}
      <div className="company-preview-hero-card">
        {/* Photo de couverture */}
        <div
          className="company-preview-cover"
          style={{
            backgroundImage: coverUrl
              ? `url(${coverUrl})`
              : "linear-gradient(135deg, #091a2e 0%, #030a13 50%, #061f36 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="company-cover-gradient-overlay" />

          {/* Bouton pour changer la couverture */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="company-cover-change-btn"
            title="Télécharger une photo de couverture (Recommandé : 1200x400 px)"
          >
            {uploadingCover ? (
              <Loader2 size={14} className="animate-spin text-sky-400" />
            ) : (
              <Camera size={14} />
            )}
            <span>{uploadingCover ? "Téléchargement..." : coverUrl ? "Changer la couverture" : "Ajouter une photo de couverture"}</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadImage(f, "cover");
            }}
          />
        </div>

        {/* Barre d'identité (Logo + Métadonnées) */}
        <div className="company-preview-identity-bar">
          <div className="company-logo-avatar-wrap">
            <div className="company-logo-avatar-box">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="company-logo-img" />
              ) : (
                <Building2 size={36} className="text-slate-500" />
              )}
              {uploadingLogo && (
                <div className="company-logo-loading-overlay">
                  <Loader2 size={24} className="animate-spin text-sky-400" />
                </div>
              )}
            </div>

            {/* Bouton pour changer le logo */}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="company-logo-change-btn"
              title="Télécharger le logo de l'entreprise (PNG ou JPG carré)"
            >
              <Camera size={12} />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadImage(f, "logo");
              }}
            />
          </div>

          <div className="company-preview-meta-info">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="company-preview-title">{companyName || "Votre Entreprise de Transport"}</h1>
              <span className="permit-badge-pro permit-valid flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>SIRET Vérifié</span>
              </span>
            </div>
            <div className="company-preview-subtitle-row">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-sky-400" />
                <span>{city ? `${postalCode} ${city}` : "France"}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-emerald-400" />
                <span>Flotte : {fleetSize}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-amber-400" />
                <span>Depuis {foundedYear}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIEN DE LA PAGE ENTREPRISE PUBLIQUE CRÉÉE */}
      <div className="company-public-link-banner">
        <div className="company-public-link-left">
          <div className="company-public-link-icon">
            <Globe size={22} className="text-sky-400" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Votre Page Entreprise Publique est Prête</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                En ligne
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Partagez ce lien avec vos candidats et intégrez-le sur vos réseaux sociaux pour valoriser votre marque transporteur.
            </p>
            <div className="company-public-url-pill mt-2">
              <span className="truncate">{fullPublicPageUrl}</span>
            </div>
          </div>
        </div>

        <div className="company-public-link-actions">
          <button
            type="button"
            onClick={handleCopyLink}
            className="cockpit-btn cockpit-btn-secondary cockpit-btn-sm"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedLink ? "Copié !" : "Copier le lien"}</span>
          </button>

          <Link
            href={publicPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cockpit-btn cockpit-btn-emerald cockpit-btn-sm"
          >
            <span>Voir ma page publique</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Alertes de succès / erreurs */}
      {saveSuccess && (
        <div className="company-feedback-box success">
          <CheckCircle2 size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}
      {errorMessage && (
        <div className="company-feedback-box error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. FORMULAIRE D'ÉDITION COMPLET */}
      <form onSubmit={handleSaveProfile} className="company-profile-form-grid">
        {/* BLOC 1 : Identité & Médias */}
        <div className="portal-panel-card">
          <div className="portal-panel-card-header">
            <h2 className="portal-panel-card-title text-white">
              <Camera size={18} className="text-sky-400" />
              <span>1. Identité Visuelle &amp; Photos</span>
            </h2>
            <span className="text-xs text-slate-400">Visibilité Réseau</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="company-media-upload-card">
              <div className="flex items-center gap-3">
                <div className="company-upload-thumb">
                  {logoUrl ? <img src={logoUrl} alt="Logo" /> : <Building2 size={24} className="text-slate-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Logo de l&apos;entreprise (Profil)</h4>
                  <p className="text-[11px] text-slate-400">Recommandé : Format carré PNG transparent ou JPG</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="btn-cockpit-action btn-cockpit-action-primary mt-3 w-full justify-center"
              >
                {uploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                <span>{uploadingLogo ? "Chargement..." : logoUrl ? "Remplacer le logo" : "Télécharger le logo"}</span>
              </button>
            </div>

            <div className="company-media-upload-card">
              <div className="flex items-center gap-3">
                <div className="company-upload-thumb cover-thumb">
                  {coverUrl ? <img src={coverUrl} alt="Cover" /> : <ImageIcon size={24} className="text-slate-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Photo de Couverture (Bannière)</h4>
                  <p className="text-[11px] text-slate-400">Recommandé : Format panoramique 1200 x 400 px</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="btn-cockpit-action btn-cockpit-action-secondary mt-3 w-full justify-center"
              >
                {uploadingCover ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                <span>{uploadingCover ? "Chargement..." : coverUrl ? "Remplacer la bannière" : "Ajouter une bannière"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BLOC 2 : Textes de Présentation (À propos de nous & Nos engagements) */}
        <div className="portal-panel-card">
          <div className="portal-panel-card-header">
            <h2 className="portal-panel-card-title text-white">
              <FileText size={18} className="text-emerald-400" />
              <span>2. Textes de Présentation de la Page Entreprise</span>
            </h2>
            <span className="text-xs text-emerald-400 font-bold">Essentiel pour séduire les chauffeurs</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="portal-form-group">
              <label className="portal-form-label flex items-center justify-between">
                <span>Texte « À propos de nous » (Présentation de votre entreprise de transport)</span>
                <span className="text-[11px] text-slate-400">Présentation générale</span>
              </label>
              <textarea
                rows={4}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Ex : Fondée en 2015, notre entreprise est spécialisée dans le transport frigorifique et la traction régionale. Avec une équipe de 35 conducteurs passionnés, nous privilégions la proximité, le respect des tournées et un management humain à l'écoute..."
                className="portal-form-input font-normal leading-relaxed text-sm"
                style={{ height: "auto", minHeight: "105px" }}
              />
              <span className="text-[11px] text-slate-400 mt-1">
                Ce texte sera mis en avant sur votre page publique pour présenter votre histoire, votre équipe et votre savoir-faire.
              </span>
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label flex items-center justify-between">
                <span>Texte « Nos Engagements &amp; Valeurs » (Conditions de travail &amp; Matériel)</span>
                <span className="text-[11px] text-amber-400 font-bold">Très apprécié des candidats</span>
              </label>
              <textarea
                rows={4}
                value={commitmentsText}
                onChange={(e) => setCommitmentsText(e.target.value)}
                placeholder="Ex : Nous nous engageons à fournir à chaque chauffeur un tracteur récent (< 2 ans) équipé de tout le confort de cabine, un respect scrupuleux de la RSE avec retour quotidien au domicile, et des primes de qualité valorisant l'éco-conduite et la sécurité..."
                className="portal-form-input font-normal leading-relaxed text-sm"
                style={{ height: "auto", minHeight: "105px" }}
              />
              <span className="text-[11px] text-slate-400 mt-1">
                Détaillez vos engagements concrets : sécurité, respect du rythme de vie, matériel haut de gamme, primes, convivialité.
              </span>
            </div>
          </div>
        </div>

        {/* BLOC 3 : Avantages Conducteurs & Matériels */}
        <div className="portal-panel-card">
          <div className="portal-panel-card-header">
            <h2 className="portal-panel-card-title text-white">
              <Heart size={18} className="text-pink-400" />
              <span>3. Avantages Conducteurs &amp; Spécialités Roulantes</span>
            </h2>
            <span className="text-xs text-slate-400">Badges interactifs</span>
          </div>

          <div className="flex flex-col gap-5">
            {/* Avantages conducteurs */}
            <div>
              <label className="portal-form-label mb-2 block">
                Sélectionnez les avantages offerts à vos conducteurs (affichés sur votre page) :
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_BENEFITS.map((ben) => {
                  const active = driverBenefits.includes(ben);
                  return (
                    <button
                      key={ben}
                      type="button"
                      onClick={() => toggleBenefit(ben)}
                      className={`requirement-chip-card ${active ? "active" : ""}`}
                    >
                      <Check size={12} className={active ? "text-emerald-400" : "opacity-30"} />
                      <span>{ben}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Types de matériels */}
            <div>
              <label className="portal-form-label mb-2 block">
                Types de matériels roulants de votre flotte :
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_EQUIPMENTS.map((eq) => {
                  const active = equipmentTypes.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`requirement-chip-card ${active ? "active" : ""}`}
                    >
                      <Truck size={12} className={active ? "text-sky-400" : "opacity-30"} />
                      <span>{eq}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zones d'exploitation */}
            <div>
              <label className="portal-form-label mb-2 block">
                Rayon d&apos;action &amp; Zones de vos tournées :
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ZONES.map((zone) => {
                  const active = operatingZones.includes(zone);
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => toggleZone(zone)}
                      className={`requirement-chip-card ${active ? "active" : ""}`}
                    >
                      <MapPin size={12} className={active ? "text-amber-400" : "opacity-30"} />
                      <span>{zone}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BLOC 4 : Coordonnées & Informations Chiffrées */}
        <div className="portal-panel-card">
          <div className="portal-panel-card-header">
            <h2 className="portal-panel-card-title text-white">
              <Building2 size={18} className="text-sky-400" />
              <span>4. Coordonnées &amp; Informations Clés de l&apos;Entreprise</span>
            </h2>
            <span className="text-xs text-slate-400">Informations publiques</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="portal-form-group">
              <label className="portal-form-label">Raison Sociale</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="portal-form-input font-bold"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Taille de la Flotte</label>
              <select
                value={fleetSize}
                onChange={(e) => setFleetSize(e.target.value)}
                className="portal-form-input"
              >
                <option value="1 - 5 Poids Lourds">1 - 5 Poids Lourds</option>
                <option value="5 - 10 Poids Lourds">5 - 10 Poids Lourds</option>
                <option value="10 - 50 Poids Lourds">10 - 50 Poids Lourds</option>
                <option value="50 - 150 Poids Lourds">50 - 150 Poids Lourds</option>
                <option value="+ 150 Poids Lourds">+ 150 Poids Lourds</option>
              </select>
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Année de Création</label>
              <input
                type="text"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="Ex: 2012"
                className="portal-form-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Téléphone Recrutement Direct</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 •• •• •• ••"
                className="portal-form-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Email Contact Exploitation</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="portal-form-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Site Internet / Page Web</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://votre-entreprise.fr"
                className="portal-form-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Adresse Dépôt / Siège</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rue de la Logistique"
                className="portal-form-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Code Postal</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="69002"
                className="portal-form-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="portal-form-label">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lyon"
                className="portal-form-input"
              />
            </div>
          </div>
        </div>

        {/* PIED D'ACTION PRINCIPAL : ENREGISTRER */}
        <div className="company-save-profile-footer">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-amber-400" />
            <div className="text-xs text-slate-300">
              Toutes les modifications sont synchronisées immédiatement sur votre page publique <strong>{publicPageUrl}</strong>.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={publicPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cockpit-btn cockpit-btn-secondary"
            >
              <ExternalLink size={14} />
              <span>Aperçu de la page</span>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="cockpit-btn cockpit-btn-emerald"
              style={{ padding: "0.65rem 1.6rem", fontSize: "0.9rem", fontWeight: "800" }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{loading ? "Enregistrement en cours..." : "Enregistrer et publier ma page entreprise"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
