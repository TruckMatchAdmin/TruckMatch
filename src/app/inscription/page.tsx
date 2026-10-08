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
  HelpCircle,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/forms/AddressAutocomplete";
import { SiretAutocomplete, CompanyDetails } from "@/components/forms/SiretAutocomplete";

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

  // Sync tab with URL parameter if it changes
  useEffect(() => {
    const t = searchParams.get("type");
    if (t === "entreprise") setActiveTab("company");
    if (t === "candidat" || t === "chauffeur") setActiveTab("driver");
  }, [searchParams]);

  // ==========================================
  // FORMULAIRE CHAUFFEUR
  // ==========================================
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
    password: "",
    cguAccepted: true,
  });

  // ==========================================
  // FORMULAIRE ENTREPRISE
  // ==========================================
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

  // Helper pour formater automatiquement le numéro de téléphone français (10 chiffres)
  const formatPhoneNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    const parts: string[] = [];
    for (let i = 0; i < digits.length; i += 2) {
      parts.push(digits.slice(i, i + 2));
    }
    return parts.join(" ");
  };

  // Toggle multi-select items
  const toggleArrayItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  };

  // Soumission Formulaire Chauffeur
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
      setErrorMsg("Veuillez sélectionner votre adresse dans la liste officielle gouv.fr pour la géolocalisation.");
      return;
    }

    if (driverForm.permits.length === 0) {
      setErrorMsg("Veuillez sélectionner au moins un permis de conduire obtenu.");
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

  // Soumission Formulaire Entreprise
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

  // Écran de succès post-inscription
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
                ? "Votre profil de conducteur a été enregistré et vérifié. Les entreprises de transport peuvent désormais vous contacter directement sans intermédiaire."
                : "Votre compte entreprise a été validé auprès des registres légaux. Vous pouvez dès maintenant explorer les profils de chauffeurs vérifiés partout en France."}
            </p>

            <div className="success-summary-box">
              <div className="summary-line">
                <span className="text-muted">Compte :</span>
                <strong>{successData.type === "driver" ? "Chauffeur Routier" : "Entreprise de Transport"}</strong>
              </div>
              <div className="summary-line">
                <span className="text-muted">Identifiant email :</span>
                <span>{successData.email}</span>
              </div>
              <div className="summary-line">
                <span className="text-muted">Statut :</span>
                <span className="badge-status-active">Profil Actif & Opérationnel</span>
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
                    <span>Voir la carte interactive</span>
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
      {/* Hero Inscription */}
      <section className="registration-hero">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge badge-blue">Inscription Directe & Sécurisée</span>
            <h1 className="registration-hero-title">
              Créez votre profil sur <span className="text-gradient-primary">TruckMatch</span>
            </h1>
            <p className="registration-hero-subtitle">
              Mise en relation directe entre professionnels du transport routier. Données vérifiées par les registres officiels de l'État.
            </p>

            {/* Sélecteur de Rôle interactif */}
            <div className="role-switch-container">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("driver");
                  setErrorMsg(null);
                }}
                className={`role-switch-btn ${activeTab === "driver" ? "role-switch-btn-active" : ""}`}
              >
                <div className="role-btn-icon">
                  <Truck size={22} />
                </div>
                <div className="text-left">
                  <div className="role-btn-title">Je suis Chauffeur</div>
                  <div className="role-btn-subtitle">Candidat — 100% Gratuit</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("company");
                  setErrorMsg(null);
                }}
                className={`role-switch-btn ${activeTab === "company" ? "role-switch-btn-active" : ""}`}
              >
                <div className="role-btn-icon">
                  <Building2 size={22} />
                </div>
                <div className="text-left">
                  <div className="role-btn-title">Je suis une Entreprise</div>
                  <div className="role-btn-subtitle">Transporteur & Logistique</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Conteneur Formulaire */}
      <div className="container py-8">
        <div className="registration-card-wrapper">
          {errorMsg && (
            <div className="form-error-banner">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================
              FORMULAIRE CHAUFFEUR / CANDIDAT
             ======================================================== */}
          {activeTab === "driver" && (
            <form onSubmit={handleSubmitDriver} className="registration-form">
              <div className="form-section-title">
                <User size={18} className="text-primary" />
                <span>1. Informations personnelles</span>
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">
                    <span>Prénom</span>
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Thomas"
                    className="form-input"
                    value={driverForm.firstName}
                    onChange={(e) => setDriverForm({ ...driverForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">
                    <span>Nom</span>
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Dupont"
                    className="form-input"
                    value={driverForm.lastName}
                    onChange={(e) => setDriverForm({ ...driverForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">
                    <span>Adresse email</span>
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-with-icon-wrap">
                    <input
                      type="email"
                      required
                      placeholder="thomas.dupont@email.fr"
                      className="form-input"
                      value={driverForm.email}
                      onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    />
                    <div className="input-right-indicator">
                      <Mail size={16} className="text-muted" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    <span>Téléphone mobile (10 chiffres)</span>
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-with-icon-wrap">
                    <input
                      type="tel"
                      required
                      placeholder="06 12 34 56 78"
                      className="form-input font-mono"
                      value={driverForm.phone}
                      onChange={(e) =>
                        setDriverForm({ ...driverForm, phone: formatPhoneNumber(e.target.value) })
                      }
                    />
                    <div className="input-right-indicator">
                      {driverForm.phone.replace(/\s/g, "").length === 10 ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : (
                        <Phone size={16} className="text-muted" />
                      )}
                    </div>
                  </div>
                  <span className="form-helper-text">Format strict à 10 chiffres pour le contact direct.</span>
                </div>
              </div>

              <div>
                <label className="form-label">
                  <span>Date de naissance</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon-wrap">
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={driverForm.birthDate}
                    onChange={(e) => setDriverForm({ ...driverForm, birthDate: e.target.value })}
                  />
                  <div className="input-right-indicator">
                    <Calendar size={16} className="text-muted" />
                  </div>
                </div>
                <span className="form-helper-text">Vous devez avoir au moins 18 ans révolus.</span>
              </div>

              {/* Adresse avec auto-complétion officielle BAN */}
              <div className="form-section-divider" />
              <div className="form-section-title">
                <Compass size={18} className="text-primary" />
                <span>2. Localisation (Recherche Officielle BAN)</span>
              </div>

              <AddressAutocomplete
                label="Adresse postale (Remplissage automatique)"
                placeholder="Tapez le début de votre adresse (ex: 15 rue de Paris, Lyon)..."
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
                <div className="location-confirmed-pill">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span>
                    Commune identifiée : <strong>{driverForm.city}</strong> ({driverForm.postalCode})
                    {driverForm.department && ` — Dép. ${driverForm.department}`}
                  </span>
                </div>
              )}

              {/* Permis et Habilitations */}
              <div className="form-section-divider" />
              <div className="form-section-title">
                <Award size={18} className="text-primary" />
                <span>3. Permis de conduire & Réglementation Transport</span>
              </div>

              <div>
                <label className="form-label">
                  <span>Permis de conduire obtenus</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="pills-selection-grid">
                  {[
                    { id: "CE", label: "Permis CE (Super Lourd / Semi)", desc: "Ensembles > 3,5t" },
                    { id: "C", label: "Permis C (Poids Lourd / Porteur)", desc: "Véhicules > 3,5t" },
                    { id: "C1", label: "Permis C1 / C1E", desc: "Intermédiaire 3,5t à 7,5t" },
                    { id: "B", label: "Permis B (VUL / Utilitaire)", desc: "Moins de 3,5t" },
                    { id: "D", label: "Permis D (Voyageurs)", desc: "Transport en commun" },
                  ].map((p) => {
                    const selected = driverForm.permits.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setDriverForm({
                            ...driverForm,
                            permits: toggleArrayItem(driverForm.permits, p.id),
                          })
                        }
                        className={`pill-select-card ${selected ? "pill-select-card-active" : ""}`}
                      >
                        <div className="pill-check-indicator">
                          {selected ? <CheckCircle2 size={16} /> : <div className="pill-circle-empty" />}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">{p.label}</div>
                          <div className="text-xs text-muted">{p.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">
                  <span>Obligations réglementaires à jour</span>
                </label>
                <div className="grid-3-cols">
                  <label className="checkbox-custom-card">
                    <input
                      type="checkbox"
                      checked={driverForm.fimo}
                      onChange={(e) => setDriverForm({ ...driverForm, fimo: e.target.checked })}
                    />
                    <div>
                      <div className="font-semibold text-sm">FIMO Marchandises</div>
                      <div className="text-xs text-muted">Formation Initiale</div>
                    </div>
                  </label>

                  <label className="checkbox-custom-card">
                    <input
                      type="checkbox"
                      checked={driverForm.fco}
                      onChange={(e) => setDriverForm({ ...driverForm, fco: e.target.checked })}
                    />
                    <div>
                      <div className="font-semibold text-sm">FCO Marchandises</div>
                      <div className="text-xs text-muted">Continue à jour</div>
                    </div>
                  </label>

                  <label className="checkbox-custom-card">
                    <input
                      type="checkbox"
                      checked={driverForm.chronoCard}
                      onChange={(e) => setDriverForm({ ...driverForm, chronoCard: e.target.checked })}
                    />
                    <div>
                      <div className="font-semibold text-sm">Carte Chronotachygraphe</div>
                      <div className="text-xs text-muted">Conducteur valide</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">
                  <span>Certifications & Spécialités optionnelles</span>
                </label>
                <div className="tags-multi-select-wrap">
                  {[
                    { id: "adr_base", label: "ADR Base (Colis)" },
                    { id: "adr_citerne", label: "ADR Citerne (Pétrole/Chimie)" },
                    { id: "caces_r490", label: "CACES R490 Grue Auxiliaire" },
                    { id: "caces_r489", label: "CACES R489 Chariot (cat 3/5)" },
                    { id: "frigo", label: "Température dirigée / Frigo" },
                    { id: "benne", label: "Benne TP / Travaux Publics" },
                    { id: "hayon", label: "Hayon élévateur" },
                    { id: "tautliner", label: "Bâché / Tautliner" },
                  ].map((s) => {
                    const active =
                      driverForm.adr.includes(s.id) ||
                      driverForm.caces.includes(s.id) ||
                      driverForm.specialties.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (s.id.startsWith("adr")) {
                            setDriverForm({
                              ...driverForm,
                              adr: toggleArrayItem(driverForm.adr, s.id),
                            });
                          } else if (s.id.startsWith("caces")) {
                            setDriverForm({
                              ...driverForm,
                              caces: toggleArrayItem(driverForm.caces, s.id),
                            });
                          } else {
                            setDriverForm({
                              ...driverForm,
                              specialties: toggleArrayItem(driverForm.specialties, s.id),
                            });
                          }
                        }}
                        className={`tag-toggle-pill ${active ? "tag-toggle-pill-active" : ""}`}
                      >
                        {active && <CheckCircle2 size={13} />}
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expérience & Disponibilité */}
              <div className="form-section-divider" />
              <div className="form-section-title">
                <Briefcase size={18} className="text-primary" />
                <span>4. Expérience & Type de mission recherchée</span>
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">
                    <span>Années d'expérience sur la route</span>
                  </label>
                  <select
                    className="form-select"
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

                <div>
                  <label className="form-label">
                    <span>Disponibilité</span>
                  </label>
                  <select
                    className="form-select"
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

              <div>
                <label className="form-label">
                  <span>Rythmes de conduite acceptés</span>
                </label>
                <div className="tags-multi-select-wrap">
                  {[
                    { id: "regional", label: "Régional (Retour chaque soir)" },
                    { id: "national", label: "Grand Routier (National / Découches)" },
                    { id: "nuit", label: "Traction de nuit" },
                    { id: "relais", label: "Relais inter-dépôts" },
                    { id: "messagerie", label: "Messagerie & Distribution locale" },
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
                        className={`tag-toggle-pill ${active ? "tag-toggle-pill-active" : ""}`}
                      >
                        {active && <CheckCircle2 size={13} />}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mot de passe & Validation */}
              <div className="form-section-divider" />
              <div className="form-section-title">
                <Lock size={18} className="text-primary" />
                <span>5. Sécurité de votre compte</span>
              </div>

              <div>
                <label className="form-label">
                  <span>Mot de passe</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon-wrap">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Au moins 6 caractères..."
                    className="form-input"
                    value={driverForm.password}
                    onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                  />
                  <div className="input-right-indicator">
                    <Lock size={16} className="text-muted" />
                  </div>
                </div>
                <span className="form-helper-text">Pour vous connecter et actualiser votre disponibilité.</span>
              </div>

              <label className="cgu-checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={driverForm.cguAccepted}
                  onChange={(e) => setDriverForm({ ...driverForm, cguAccepted: e.target.checked })}
                />
                <span>
                  J'accepte les <Link href="/cgu" target="_blank" className="text-primary underline">CGU</Link> et autorise TruckMatch à présenter mes qualifications auprès des transporteurs partenaires.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full submit-btn-modern"
              >
                {loading ? (
                  <span>Enregistrement sécurisé en cours...</span>
                ) : (
                  <>
                    <span>Valider mon profil Chauffeur</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              FORMULAIRE ENTREPRISE / TRANSPORTEUR
             ======================================================== */}
          {activeTab === "company" && (
            <form onSubmit={handleSubmitCompany} className="registration-form">
              <div className="form-section-title">
                <Building2 size={18} className="text-primary" />
                <span>1. Identification de l'Entreprise (Recherche Officielle)</span>
              </div>

              {/* SIRET avec API officielle gouvernementale */}
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

              <div className="form-section-divider" />
              <div className="form-section-title">
                <User size={18} className="text-primary" />
                <span>2. Contact du Responsable</span>
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">
                    <span>Prénom du responsable</span>
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Julien"
                    className="form-input"
                    value={companyForm.contactFirstName}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactFirstName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">
                    <span>Nom du responsable</span>
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Martin"
                    className="form-input"
                    value={companyForm.contactLastName}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactLastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">
                    <span>Fonction dans l'entreprise</span>
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={companyForm.contactRole}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactRole: e.target.value })}
                  >
                    <option value="Dirigeant / Gérant">Dirigeant / Gérant</option>
                    <option value="Responsable d'exploitation">Responsable d'exploitation</option>
                    <option value="DRH / Responsable Recrutement">DRH / Responsable Recrutement</option>
                    <option value="Affréteur / Dispatcher">Affréteur / Dispatcher</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    <span>Téléphone direct (10 chiffres)</span>
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-with-icon-wrap">
                    <input
                      type="tel"
                      required
                      placeholder="01 23 45 67 89"
                      className="form-input font-mono"
                      value={companyForm.phone}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, phone: formatPhoneNumber(e.target.value) })
                      }
                    />
                    <div className="input-right-indicator">
                      {companyForm.phone.replace(/\s/g, "").length === 10 ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : (
                        <Phone size={16} className="text-muted" />
                      )}
                    </div>
                  </div>
                  <span className="form-helper-text">10 chiffres pour être contacté par nos équipes.</span>
                </div>
              </div>

              <div>
                <label className="form-label">
                  <span>Adresse email professionnelle</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon-wrap">
                  <input
                    type="email"
                    required
                    placeholder="recrutement@nom-transport.fr"
                    className="form-input"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                  <div className="input-right-indicator">
                    <Mail size={16} className="text-muted" />
                  </div>
                </div>
              </div>

              {/* Flotte & Besoins */}
              <div className="form-section-divider" />
              <div className="form-section-title">
                <Truck size={18} className="text-primary" />
                <span>3. Flotte de véhicules & Profils recherchés</span>
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">
                    <span>Taille de la flotte de camions</span>
                  </label>
                  <select
                    className="form-select"
                    value={companyForm.fleetSize}
                    onChange={(e) => setCompanyForm({ ...companyForm, fleetSize: e.target.value })}
                  >
                    <option value="1-5">1 à 5 véhicules</option>
                    <option value="6-20">6 à 20 véhicules</option>
                    <option value="21-50">21 à 50 véhicules</option>
                    <option value="50+">Plus de 50 véhicules</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    <span>Types de conducteurs recherchés</span>
                  </label>
                  <div className="tags-multi-select-wrap">
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
                          className={`tag-toggle-pill ${active ? "tag-toggle-pill-active" : ""}`}
                        >
                          {active && <CheckCircle2 size={13} />}
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mot de passe & CGU */}
              <div className="form-section-divider" />
              <div className="form-section-title">
                <Lock size={18} className="text-primary" />
                <span>4. Sécurité de votre espace recruteur</span>
              </div>

              <div>
                <label className="form-label">
                  <span>Mot de passe</span>
                  <span className="text-danger">*</span>
                </label>
                <div className="input-with-icon-wrap">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Au moins 6 caractères..."
                    className="form-input"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                  />
                  <div className="input-right-indicator">
                    <Lock size={16} className="text-muted" />
                  </div>
                </div>
              </div>

              <label className="cgu-checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={companyForm.cguAccepted}
                  onChange={(e) => setCompanyForm({ ...companyForm, cguAccepted: e.target.checked })}
                />
                <span>
                  J'accepte les <Link href="/cgu" target="_blank" className="text-primary underline">CGU</Link> et certifie représenter légalement l'entreprise désignée.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full submit-btn-modern"
              >
                {loading ? (
                  <span>Vérification et enregistrement en cours...</span>
                ) : (
                  <>
                    <span>Créer l'Espace Entreprise</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
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
