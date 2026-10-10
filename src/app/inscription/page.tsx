"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Compass,
  FileCheck2,
  Briefcase,
  Layers,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import { SiretAutocomplete, CompanyDetails } from "@/components/forms/SiretAutocomplete";
import { ResumeUpload } from "@/components/forms/ResumeUpload";

function InscriptionContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "entreprise" ? "company" : "driver";

  const [activeTab, setActiveTab] = useState<"driver" | "company">(initialType);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    type: "driver" | "company";
    name: string;
    email: string;
  } | null>(null);

  // Synchronisation avec les paramètres URL
  useEffect(() => {
    const t = searchParams.get("type");
    if (t === "entreprise") setActiveTab("company");
    if (t === "candidat" || t === "chauffeur") setActiveTab("driver");
  }, [searchParams]);

  // Formulaire Chauffeur
  const [driverForm, setDriverForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    postalCode: "",
    city: "",
    department: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    permits: ["CE"] as string[],
    fimo: true,
    fco: true,
    chronoCard: true,
    adr: [] as string[],
    caces: [] as string[],
    specialties: [] as string[],
    experience: "3-5",
    missionType: ["regional"] as string[],
    availability: "immediate",
    resumeUrl: "",
    resumeName: "",
    password: "",
    cguAccepted: true,
  });

  // Formulaire Entreprise
  const [companyForm, setCompanyForm] = useState({
    siret: "",
    companyName: "",
    contactFirstName: "",
    contactLastName: "",
    contactRole: "Dirigeant / Gérant",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    nafCode: "",
    tvaNumber: "",
    fleetSize: "6-20",
    targetDrivers: ["SPL", "PL"] as string[],
    password: "",
    cguAccepted: true,
  });

  // Helper formatage strict 10 chiffres (06 12 34 56 78)
  const formatPhoneNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    const parts: string[] = [];
    for (let i = 0; i < digits.length; i += 2) {
      parts.push(digits.slice(i, i + 2));
    }
    return parts.join(" ");
  };

  const toggleArrayItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  };

  // Soumission Chauffeur
  const handleSubmitDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = driverForm.phone.replace(/\s/g, "");
    if (cleanPhone.length !== 10 || !/^0[1-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg("Le numéro de téléphone doit comporter exactement 10 chiffres (ex: 06 12 34 56 78).");
      return;
    }

    if (!driverForm.birthDate) {
      setErrorMsg("Veuillez renseigner votre date de naissance.");
      return;
    }

    const birth = new Date(driverForm.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) {
      setErrorMsg("Vous devez être majeur (18 ans révolus) pour vous inscrire comme chauffeur routier.");
      return;
    }

    if (!driverForm.address || !driverForm.postalCode || !driverForm.city) {
      setErrorMsg("Veuillez sélectionner votre adresse dans la liste officielle pour certifier votre localisation.");
      return;
    }

    if (driverForm.permits.length === 0) {
      setErrorMsg("Veuillez sélectionner au moins un permis de conduire obtenu.");
      return;
    }

    if (!driverForm.resumeUrl) {
      setErrorMsg("Le dépôt de votre CV est obligatoire pour valider votre inscription.");
      const resumeEl = document.getElementById("resume-upload-section");
      if (resumeEl) {
        resumeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!driverForm.password || driverForm.password.length < 6) {
      setErrorMsg("Veuillez choisir un mot de passe d'au moins 6 caractères pour votre espace.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "driver",
          firstName: driverForm.firstName,
          lastName: driverForm.lastName,
          email: driverForm.email,
          phone: cleanPhone,
          birthDate: driverForm.birthDate,
          address: driverForm.address,
          postalCode: driverForm.postalCode,
          city: driverForm.city,
          department: driverForm.department,
          latitude: driverForm.latitude,
          longitude: driverForm.longitude,
          permits: driverForm.permits,
          fimo: driverForm.fimo,
          fco: driverForm.fco,
          chronoCard: driverForm.chronoCard,
          adr: driverForm.adr,
          caces: driverForm.caces,
          specialties: driverForm.specialties,
          experience: driverForm.experience,
          missionType: driverForm.missionType,
          availability: driverForm.availability,
          resumeUrl: driverForm.resumeUrl,
          resumeName: driverForm.resumeName,
          password: driverForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'enregistrement.");
      }

      setSuccessData({
        type: "driver",
        name: `${driverForm.firstName} ${driverForm.lastName}`,
        email: driverForm.email,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Soumission Entreprise
  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanSiret = companyForm.siret.replace(/\s/g, "");
    if (cleanSiret.length !== 14 || !/^\d{14}$/.test(cleanSiret)) {
      setErrorMsg("Le SIRET doit être validé via la recherche officielle du gouvernement (14 chiffres).");
      return;
    }

    const cleanPhone = companyForm.phone.replace(/\s/g, "");
    if (cleanPhone.length !== 10 || !/^0[1-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg("Le numéro de téléphone direct doit comporter exactement 10 chiffres (ex: 01 23 45 67 89).");
      return;
    }

    if (!companyForm.password || companyForm.password.length < 6) {
      setErrorMsg("Veuillez choisir un mot de passe d'au moins 6 caractères pour votre espace recruteur.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company",
          siret: cleanSiret,
          companyName: companyForm.companyName,
          contactFirstName: companyForm.contactFirstName,
          contactLastName: companyForm.contactLastName,
          contactRole: companyForm.contactRole,
          email: companyForm.email,
          phone: cleanPhone,
          address: companyForm.address,
          postalCode: companyForm.postalCode,
          city: companyForm.city,
          nafCode: companyForm.nafCode,
          tvaNumber: companyForm.tvaNumber,
          fleetSize: companyForm.fleetSize,
          targetDrivers: companyForm.targetDrivers,
          password: companyForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'enregistrement de l'entreprise.");
      }

      setSuccessData({
        type: "company",
        name: companyForm.companyName,
        email: companyForm.email,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Écran de succès
  if (successData) {
    return (
      <div className="registration-page">
        <div className="container py-12">
          <div className="registration-success-card">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} className="text-success" />
            </div>
            <span className="badge badge-success">Inscription validée avec succès</span>
            <h1 className="success-title">
              {successData.type === "driver"
                ? `Bienvenue à bord, ${successData.name} !`
                : `Bienvenue sur TruckMatch, ${successData.name} !`}
            </h1>
            <p className="success-desc">
              {successData.type === "driver"
                ? "Votre profil de conducteur est maintenant actif et vérifié. Les entreprises de transport peuvent désormais vous contacter directement sans intermédiaire."
                : "Votre compte entreprise a été validé auprès des registres officiels. Vous pouvez dès à présent consulter les profils de chauffeurs qualifiés partout en France."}
            </p>

            <div className="success-summary-box">
              <div className="summary-line">
                <span className="text-muted">Type de compte :</span>
                <strong>{successData.type === "driver" ? "Chauffeur Routier" : "Entreprise de Transport"}</strong>
              </div>
              <div className="summary-line">
                <span className="text-muted">Identifiant email :</span>
                <span>{successData.email}</span>
              </div>
              <div className="summary-line">
                <span className="text-muted">Statut du compte :</span>
                <span className="badge-status-active">Actif & Vérifié</span>
              </div>
            </div>

            <div className="success-actions-row">
              {successData.type === "driver" ? (
                <>
                  <Link href="/offres-emploi" className="btn btn-primary btn-lg">
                    <Briefcase size={18} />
                    <span>Consulter les offres d'emploi</span>
                  </Link>
                  <Link href="/carte-chauffeurs" className="btn btn-outline btn-lg">
                    <Compass size={18} />
                    <span>Voir la carte des chauffeurs</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/carte-chauffeurs" className="btn btn-primary btn-lg">
                    <Compass size={18} />
                    <span>Découvrir les chauffeurs disponibles</span>
                  </Link>
                  <Link href="/offres-emploi" className="btn btn-outline btn-lg">
                    <Briefcase size={18} />
                    <span>Publier une offre de transport</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      {/* Header Héro épuré et moderne */}
      <section className="registration-hero">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge badge-blue">Plateforme Indépendante de Recrutement Transport</span>
            <h1 className="registration-hero-title">
              Créez votre profil sur <span className="text-gradient-primary">TruckMatch</span>
            </h1>
            <p className="registration-hero-subtitle">
              Sélectionnez votre profil ci-dessous pour démarrer. Inscription rapide, sécurisée et certifiée via les registres officiels de l'État.
            </p>

            {/* Sélecteur de Rôle : Grandes Cartes distinctes */}
            <div className="profile-selector-dual-cards">
              {/* Carte Chauffeur */}
              <div
                onClick={() => {
                  setActiveTab("driver");
                  setErrorMsg(null);
                }}
                className={`profile-card-option ${activeTab === "driver" ? "profile-card-option-active" : ""}`}
              >
                <div className="profile-card-top-row">
                  <div className="profile-card-icon-box profile-icon-driver">
                    <Truck size={26} />
                  </div>
                  <div className="profile-card-radio-circle">
                    {activeTab === "driver" && <div className="radio-inner-dot" />}
                  </div>
                </div>
                <div className="profile-card-content">
                  <div className="profile-card-badge-free">100% Gratuit</div>
                  <h3 className="profile-card-heading">Conducteur Routier</h3>
                  <p className="profile-card-caption">Chauffeur SPL, PL, Porteur ou VUL</p>
                  <ul className="profile-card-benefits">
                    <li>
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>Accès direct aux offres d'emploi</span>
                    </li>
                    <li>
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>Visibilité sur la carte des chauffeurs</span>
                    </li>
                    <li>
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>Contact direct avec les patrons</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Carte Entreprise */}
              <div
                onClick={() => {
                  setActiveTab("company");
                  setErrorMsg(null);
                }}
                className={`profile-card-option ${activeTab === "company" ? "profile-card-option-active" : ""}`}
              >
                <div className="profile-card-top-row">
                  <div className="profile-card-icon-box profile-icon-company">
                    <Building2 size={26} />
                  </div>
                  <div className="profile-card-radio-circle">
                    {activeTab === "company" && <div className="radio-inner-dot" />}
                  </div>
                </div>
                <div className="profile-card-content">
                  <div className="profile-card-badge-pro">Espace Recruteur</div>
                  <h3 className="profile-card-heading">Entreprise de Transport</h3>
                  <p className="profile-card-caption">Transporteur, Logistique & Expéditeur</p>
                  <ul className="profile-card-benefits">
                    <li>
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>Vérification automatique SIRET / INSEE</span>
                    </li>
                    <li>
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>Recherche de chauffeurs qualifiés</span>
                    </li>
                    <li>
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                      <span>0% commission sur vos embauches</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone du Formulaire par blocs structurés */}
      <div className="container py-6">
        <div className="form-blocks-container">
          {errorMsg && (
            <div className="form-error-banner">
              <AlertCircle size={22} className="shrink-0" />
              <div>
                <strong className="block text-sm font-bold">Vérification requise</strong>
                <span className="text-sm">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* ========================================================
              FORMULAIRE 1 : CONDUCTEUR ROUTIER (CHAUFFEUR)
             ======================================================== */}
          {activeTab === "driver" && (
            <form onSubmit={handleSubmitDriver} className="form-sections-stack">
              {/* Étape 1 : Identité & Contact */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">1</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Identité & Contact direct</h2>
                    <p className="step-subtitle">Vos coordonnées pour être joignable par les transporteurs vérifiés.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <div className="grid-2-cols">
                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Prénom</span>
                        <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Thomas"
                        className="form-input-pro"
                        value={driverForm.firstName}
                        onChange={(e) => setDriverForm({ ...driverForm, firstName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Nom de famille</span>
                        <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Dupont"
                        className="form-input-pro"
                        value={driverForm.lastName}
                        onChange={(e) => setDriverForm({ ...driverForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2-cols">
                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Adresse email</span>
                        <span className="required-star">*</span>
                      </label>
                      <div className="input-with-icon-pro">
                        <input
                          type="email"
                          required
                          placeholder="thomas.dupont@email.fr"
                          className="form-input-pro"
                          value={driverForm.email}
                          onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                        />
                        <div className="input-icon-right">
                          <Mail size={16} className="text-muted" />
                        </div>
                      </div>
                      <span className="helper-text-pro">Sert d'identifiant pour vous connecter à votre compte.</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Téléphone mobile (10 chiffres)</span>
                        <span className="required-star">*</span>
                      </label>
                      <div className="input-with-icon-pro">
                        <input
                          type="tel"
                          required
                          placeholder="06 12 34 56 78"
                          className="form-input-pro font-mono"
                          value={driverForm.phone}
                          onChange={(e) =>
                            setDriverForm({ ...driverForm, phone: formatPhoneNumber(e.target.value) })
                          }
                        />
                        <div className="input-icon-right">
                          {driverForm.phone.replace(/\s/g, "").length === 10 ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : (
                            <Phone size={16} className="text-muted" />
                          )}
                        </div>
                      </div>
                      <span className="helper-text-pro">Format strict à 10 chiffres pour le contact téléphonique direct.</span>
                    </div>
                  </div>

                  <div className="form-group max-w-sm">
                    <label className="form-label-pro">
                      <span>Date de naissance</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon-pro">
                      <input
                        type="date"
                        required
                        className="form-input-pro"
                        value={driverForm.birthDate}
                        onChange={(e) => setDriverForm({ ...driverForm, birthDate: e.target.value })}
                      />
                      <div className="input-icon-right">
                        <Calendar size={16} className="text-muted" />
                      </div>
                    </div>
                    <span className="helper-text-pro">Obligatoire pour attester de la majorité légale (18 ans révolus).</span>
                  </div>
                </div>
              </section>

              {/* Étape 2 : Localisation officielle */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">2</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Localisation & Périmètre géographique</h2>
                    <p className="step-subtitle">Recherche certifiée connectée à la Base Adresse Nationale (BAN) de l'État.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <AddressAutocomplete
                    label="Votre adresse de résidence"
                    placeholder="Tapez le début de votre adresse (ex: 24 avenue des Transports, Lyon)..."
                    defaultValue={driverForm.address}
                    onAddressSelect={(res) => {
                      setDriverForm({
                        ...driverForm,
                        address: res.fullAddress,
                        postalCode: res.postalCode,
                        city: res.city,
                        department: res.department || "",
                        latitude: res.lat,
                        longitude: res.lng,
                      });
                    }}
                  />

                  {driverForm.city && (
                    <div className="verified-location-box">
                      <div className="verified-loc-icon">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="verified-loc-text">
                        <strong>Commune validée :</strong> {driverForm.city} ({driverForm.postalCode})
                        {driverForm.department && ` • Département : ${driverForm.department}`}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Étape 3 : Permis & Réglementation Transport */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">3</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Permis & Qualifications Transport</h2>
                    <p className="step-subtitle">Indiquez vos permis et vos habilitations pour être ciblé sur les bonnes missions.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  {/* Grille des permis */}
                  <div className="form-group">
                    <label className="form-label-pro">
                      <span>Permis de conduire obtenus</span>
                      <span className="required-star">* (au moins un permis requis)</span>
                    </label>

                    <div className="permit-cards-grid">
                      {[
                        { id: "CE", title: "Permis CE", label: "Super Lourd (SPL)", desc: "Ensembles articulés & Semi-remorques" },
                        { id: "C", title: "Permis C", label: "Poids Lourd (PL)", desc: "Camions porteurs rigides > 3,5 tonnes" },
                        { id: "C1", title: "Permis C1 / C1E", label: "Lourd Intermédiaire", desc: "Véhicules de 3,5 t à 7,5 tonnes" },
                        { id: "B", title: "Permis B", label: "VUL / Camionnette", desc: "Utilitaires légers de moins de 3,5 tonnes" },
                        { id: "D", title: "Permis D", label: "Transport Voyageurs", desc: "Autocars & transport en commun" },
                      ].map((p) => {
                        const isChecked = driverForm.permits.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() =>
                              setDriverForm({
                                ...driverForm,
                                permits: toggleArrayItem(driverForm.permits, p.id),
                              })
                            }
                            className={`permit-selection-card ${isChecked ? "permit-selection-card-active" : ""}`}
                          >
                            <div className="permit-card-top">
                              <span className="permit-code">{p.title}</span>
                              <div className="permit-checkbox-circle">
                                {isChecked && <CheckCircle2 size={16} />}
                              </div>
                            </div>
                            <div className="permit-name">{p.label}</div>
                            <div className="permit-desc">{p.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Obligations réglementaires */}
                  <div className="form-group mt-6">
                    <label className="form-label-pro">
                      <span>Documents réglementaires obligatoires</span>
                    </label>

                    <div className="regulatory-cards-row">
                      <label className={`regulatory-card ${driverForm.fimo ? "regulatory-card-active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={driverForm.fimo}
                          onChange={(e) => setDriverForm({ ...driverForm, fimo: e.target.checked })}
                        />
                        <div className="regulatory-card-content">
                          <span className="regulatory-title">FIMO Marchandises</span>
                          <span className="regulatory-status">{driverForm.fimo ? "✓ À jour" : "Non obtenue"}</span>
                        </div>
                      </label>

                      <label className={`regulatory-card ${driverForm.fco ? "regulatory-card-active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={driverForm.fco}
                          onChange={(e) => setDriverForm({ ...driverForm, fco: e.target.checked })}
                        />
                        <div className="regulatory-card-content">
                          <span className="regulatory-title">FCO Marchandises</span>
                          <span className="regulatory-status">{driverForm.fco ? "✓ À jour" : "Non obtenue"}</span>
                        </div>
                      </label>

                      <label className={`regulatory-card ${driverForm.chronoCard ? "regulatory-card-active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={driverForm.chronoCard}
                          onChange={(e) => setDriverForm({ ...driverForm, chronoCard: e.target.checked })}
                        />
                        <div className="regulatory-card-content">
                          <span className="regulatory-title">Carte Chronotachygraphe</span>
                          <span className="regulatory-status">{driverForm.chronoCard ? "✓ En cours de validité" : "Non obtenue"}</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Certifications et Spécialités */}
                  <div className="form-group mt-6">
                    <label className="form-label-pro">
                      <span>Spécialités, Certifications ADR & CACES (Optionnel)</span>
                    </label>

                    <div className="subsections-specialties-wrap">
                      <div className="specialty-group">
                        <span className="specialty-group-title">Matières Dangereuses :</span>
                        <div className="pills-flex-wrap">
                          {[
                            { id: "adr_base", label: "ADR Base (Colis)" },
                            { id: "adr_citerne", label: "ADR Citerne (Carburant / Chimie)" },
                          ].map((item) => {
                            const active = driverForm.adr.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  setDriverForm({
                                    ...driverForm,
                                    adr: toggleArrayItem(driverForm.adr, item.id),
                                  })
                                }
                                className={`tag-pill-modern ${active ? "tag-pill-modern-active" : ""}`}
                              >
                                {active && <CheckCircle2 size={13} />}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="specialty-group">
                        <span className="specialty-group-title">CACES & Manutention :</span>
                        <div className="pills-flex-wrap">
                          {[
                            { id: "caces_r490", label: "CACES R490 Grue Auxiliaire" },
                            { id: "caces_r489", label: "CACES R489 Chariot Élévateur" },
                          ].map((item) => {
                            const active = driverForm.caces.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  setDriverForm({
                                    ...driverForm,
                                    caces: toggleArrayItem(driverForm.caces, item.id),
                                  })
                                }
                                className={`tag-pill-modern ${active ? "tag-pill-modern-active" : ""}`}
                              >
                                {active && <CheckCircle2 size={13} />}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="specialty-group">
                        <span className="specialty-group-title">Matériel & Équipements :</span>
                        <div className="pills-flex-wrap">
                          {[
                            { id: "frigo", label: "Frigo / Température Dirigée" },
                            { id: "benne", label: "Benne TP / Travaux Publics" },
                            { id: "hayon", label: "Hayon Élévateur" },
                            { id: "tautliner", label: "Bâché / Tautliner" },
                          ].map((item) => {
                            const active = driverForm.specialties.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  setDriverForm({
                                    ...driverForm,
                                    specialties: toggleArrayItem(driverForm.specialties, item.id),
                                  })
                                }
                                className={`tag-pill-modern ${active ? "tag-pill-modern-active" : ""}`}
                              >
                                {active && <CheckCircle2 size={13} />}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Étape 4 : Expérience & Rythme */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">4</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Expérience & Préférences de conduite</h2>
                    <p className="step-subtitle">Vos souhaits de rythme de travail et vos disponibilités.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <div className="grid-2-cols">
                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Expérience globale sur la route</span>
                      </label>
                      <select
                        className="form-select-pro"
                        value={driverForm.experience}
                        onChange={(e) => setDriverForm({ ...driverForm, experience: e.target.value })}
                      >
                        <option value="debutant">Débutant (moins de 1 an)</option>
                        <option value="1-3">1 à 3 ans d'expérience</option>
                        <option value="3-5">3 à 5 ans d'expérience</option>
                        <option value="5-10">5 à 10 ans d'expérience</option>
                        <option value="10+">Plus de 10 ans d'expérience</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Disponibilité</span>
                      </label>
                      <select
                        className="form-select-pro"
                        value={driverForm.availability}
                        onChange={(e) => setDriverForm({ ...driverForm, availability: e.target.value })}
                      >
                        <option value="immediate">Disponible immédiatement</option>
                        <option value="preavis_1m">Sous préavis de 1 mois</option>
                        <option value="preavis_2m">Sous préavis de 2 mois</option>
                        <option value="a_convenir">À convenir avec le transporteur</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mt-4">
                    <label className="form-label-pro">
                      <span>Rythmes de tournée souhaités</span>
                    </label>
                    <div className="pills-flex-wrap">
                      {[
                        { id: "regional", label: "Régional (Retour chez soi chaque soir)" },
                        { id: "national", label: "Grand Routier (National / Découches)" },
                        { id: "nuit", label: "Traction de nuit" },
                        { id: "relais", label: "Relais inter-dépôts" },
                        { id: "messagerie", label: "Messagerie & Distribution urbaine" },
                      ].map((m) => {
                        const active = driverForm.missionType.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setDriverForm({
                                ...driverForm,
                                missionType: toggleArrayItem(driverForm.missionType, m.id),
                              })
                            }
                            className={`tag-pill-modern ${active ? "tag-pill-modern-active" : ""}`}
                          >
                            {active && <CheckCircle2 size={13} />}
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dépôt de CV (Curriculum Vitae) - Obligatoire */}
                  <div className="resume-upload-section" id="resume-upload-section">
                    <ResumeUpload
                      required
                      hasError={Boolean(errorMsg && !driverForm.resumeUrl && errorMsg.includes("CV"))}
                      onUploadSuccess={(url, name) => {
                        setDriverForm({ ...driverForm, resumeUrl: url, resumeName: name });
                        if (errorMsg && errorMsg.includes("CV")) {
                          setErrorMsg(null);
                        }
                      }}
                      onRemove={() => {
                        setDriverForm({ ...driverForm, resumeUrl: "", resumeName: "" });
                      }}
                      currentFileName={driverForm.resumeName}
                      currentUrl={driverForm.resumeUrl}
                    />
                  </div>
                </div>
              </section>

              {/* Étape 5 : Sécurité & Validation */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">5</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Sécurité de votre espace</h2>
                    <p className="step-subtitle">Créez votre mot de passe pour modifier vos disponibilités et être alerté des offres.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <div className="form-group max-w-md">
                    <label className="form-label-pro">
                      <span>Mot de passe</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon-pro">
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Au moins 6 caractères..."
                        className="form-input-pro"
                        value={driverForm.password}
                        onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                      />
                      <div className="input-icon-right">
                        <Lock size={16} className="text-muted" />
                      </div>
                    </div>
                    <span className="helper-text-pro">Permet de gérer votre profil et masquer votre visibilité quand vous êtes en poste.</span>
                  </div>

                  <div className="trust-reassurance-box">
                    <div className="trust-item">
                      <Shield size={18} className="text-primary" />
                      <span>Données personnelles protégées & conformes RGPD</span>
                    </div>
                    <div className="trust-item">
                      <Zap size={18} className="text-primary" />
                      <span>Zéro intermédiaire : contact direct transporteur</span>
                    </div>
                    <div className="trust-item">
                      <Award size={18} className="text-primary" />
                      <span>Inscription 100% gratuite et sans engagement</span>
                    </div>
                  </div>

                  <label className="cgu-checkbox-pro">
                    <input
                      type="checkbox"
                      required
                      checked={driverForm.cguAccepted}
                      onChange={(e) => setDriverForm({ ...driverForm, cguAccepted: e.target.checked })}
                    />
                    <span>
                      J'accepte les <Link href="/cgu" target="_blank" className="link-underlined">Conditions Générales d'Utilisation</Link> et la <Link href="/politique-confidentialite" target="_blank" className="link-underlined">Politique de Confidentialité</Link> de TruckMatch.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg w-full submit-cta-button"
                  >
                    {loading ? (
                      <span>Enregistrement sécurisé en cours...</span>
                    ) : (
                      <>
                        <span>Valider et créer mon profil Chauffeur</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </section>
            </form>
          )}

          {/* ========================================================
              FORMULAIRE 2 : ENTREPRISE / TRANSPORTEUR
             ======================================================== */}
          {activeTab === "company" && (
            <form onSubmit={handleSubmitCompany} className="form-sections-stack">
              {/* Étape 1 : Société & Vérification Légale INSEE */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">1</div>
                  <div className="step-header-text">
                    <div className="step-header-title-row">
                      <h2 className="step-title">Identification de l'Entreprise (Registre National)</h2>
                      <span className="step-pill-badge">Vérification Officielle RNE</span>
                    </div>
                    <p className="step-subtitle">
                      <span className="live-pulse-dot" />
                      <span>Recherche certifiée connectée en direct aux serveurs du gouvernement français (DINUM / INSEE).</span>
                    </p>
                  </div>
                </header>

                <div className="form-section-body">
                  <SiretAutocomplete
                    onCompanySelect={(c: CompanyDetails) => {
                      setCompanyForm({
                        ...companyForm,
                        siret: c.siret,
                        companyName: c.name,
                        address: c.address,
                        postalCode: c.postalCode,
                        city: c.city,
                        nafCode: c.nafCode || "",
                        tvaNumber: c.tvaNumber || "",
                      });
                    }}
                  />
                </div>
              </section>

              {/* Étape 2 : Responsable du compte */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">2</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Contact du Responsable de Recrutement</h2>
                    <p className="step-subtitle">Coordonnées de l'interlocuteur en charge des embauches de conducteurs.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <div className="grid-2-cols">
                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Prénom du responsable</span>
                        <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Julien"
                        className="form-input-pro"
                        value={companyForm.contactFirstName}
                        onChange={(e) => setCompanyForm({ ...companyForm, contactFirstName: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Nom du responsable</span>
                        <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Martin"
                        className="form-input-pro"
                        value={companyForm.contactLastName}
                        onChange={(e) => setCompanyForm({ ...companyForm, contactLastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2-cols">
                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Fonction dans l'entreprise</span>
                        <span className="required-star">*</span>
                      </label>
                      <select
                        className="form-select-pro"
                        value={companyForm.contactRole}
                        onChange={(e) => setCompanyForm({ ...companyForm, contactRole: e.target.value })}
                      >
                        <option value="Dirigeant / Gérant">Dirigeant / Gérant</option>
                        <option value="Responsable d'exploitation">Responsable d'exploitation</option>
                        <option value="DRH / Responsable Recrutement">DRH / Responsable Recrutement</option>
                        <option value="Affréteur / Dispatcher">Affréteur / Dispatcher</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Téléphone direct (10 chiffres)</span>
                        <span className="required-star">*</span>
                      </label>
                      <div className="input-with-icon-pro">
                        <input
                          type="tel"
                          required
                          placeholder="01 23 45 67 89"
                          className="form-input-pro font-mono"
                          value={companyForm.phone}
                          onChange={(e) =>
                            setCompanyForm({ ...companyForm, phone: formatPhoneNumber(e.target.value) })
                          }
                        />
                        <div className="input-icon-right">
                          {companyForm.phone.replace(/\s/g, "").length === 10 ? (
                            <CheckCircle2 size={18} className="text-success" />
                          ) : (
                            <Phone size={16} className="text-muted" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label-pro">
                      <span>Adresse email professionnelle</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon-pro">
                      <input
                        type="email"
                        required
                        placeholder="recrutement@nom-entreprise.fr"
                        className="form-input-pro"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      />
                      <div className="input-icon-right">
                        <Mail size={16} className="text-muted" />
                      </div>
                    </div>
                    <span className="helper-text-pro">Sert d'identifiant administrateur pour votre espace entreprise.</span>
                  </div>
                </div>
              </section>

              {/* Étape 3 : Flotte & Profils */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">3</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Flotte de camions & Profils recherchés</h2>
                    <p className="step-subtitle">Permet d'ajuster les profils de chauffeurs recommandés par l'algorithme.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <div className="grid-2-cols">
                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Taille du parc de véhicules</span>
                      </label>
                      <select
                        className="form-select-pro"
                        value={companyForm.fleetSize}
                        onChange={(e) => setCompanyForm({ ...companyForm, fleetSize: e.target.value })}
                      >
                        <option value="1-5">1 à 5 véhicules</option>
                        <option value="6-20">6 à 20 véhicules</option>
                        <option value="21-50">21 à 50 véhicules</option>
                        <option value="50+">Plus de 50 véhicules</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label-pro">
                        <span>Types de chauffeurs recherchés en priorité</span>
                      </label>
                      <div className="pills-flex-wrap">
                        {["SPL", "PL", "Porteur TP", "VUL"].map((t) => {
                          const active = companyForm.targetDrivers.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setCompanyForm({
                                  ...companyForm,
                                  targetDrivers: toggleArrayItem(companyForm.targetDrivers, t),
                                })
                              }
                              className={`tag-pill-modern ${active ? "tag-pill-modern-active" : ""}`}
                            >
                              {active && <CheckCircle2 size={13} />}
                              <span>{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Étape 4 : Sécurité & Validation */}
              <section className="form-section-card">
                <header className="form-section-header">
                  <div className="step-number-badge">4</div>
                  <div className="step-header-text">
                    <h2 className="step-title">Sécurité de votre Espace Recruteur</h2>
                    <p className="step-subtitle">Mot de passe pour gérer vos annonces et contacter les conducteurs.</p>
                  </div>
                </header>

                <div className="form-section-body">
                  <div className="form-group max-w-md">
                    <label className="form-label-pro">
                      <span>Mot de passe</span>
                      <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon-pro">
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Au moins 6 caractères..."
                        className="form-input-pro"
                        value={companyForm.password}
                        onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                      />
                      <div className="input-icon-right">
                        <Lock size={16} className="text-muted" />
                      </div>
                    </div>
                  </div>

                  <label className="cgu-checkbox-pro">
                    <input
                      type="checkbox"
                      required
                      checked={companyForm.cguAccepted}
                      onChange={(e) => setCompanyForm({ ...companyForm, cguAccepted: e.target.checked })}
                    />
                    <span>
                      J'accepte les <Link href="/cgu" target="_blank" className="link-underlined">CGU</Link> et certifie représenter légalement l'entreprise désignée.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg w-full submit-cta-button"
                  >
                    {loading ? (
                      <span>Vérification et enregistrement en cours...</span>
                    ) : (
                      <>
                        <span>Valider et créer l'Espace Entreprise</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </section>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-muted">Chargement du formulaire...</div>}>
      <InscriptionContent />
    </Suspense>
  );
}
