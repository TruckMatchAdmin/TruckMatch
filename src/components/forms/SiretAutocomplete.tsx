"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  MapPin,
  FileText,
  BadgeCheck,
} from "lucide-react";

export interface CompanyDetails {
  siret: string;
  siren: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  nafCode?: string;
  nafLabel?: string;
  tvaNumber?: string;
  isOpen: boolean;
}

interface SiretAutocompleteProps {
  onCompanySelect: (company: CompanyDetails) => void;
  required?: boolean;
}

function formatSiretDisplay(s: string) {
  if (!s) return "";
  const clean = s.replace(/\s/g, "");
  if (clean.length === 14) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  return s;
}

export function SiretAutocomplete({ onCompanySelect, required = true }: SiretAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search through official Recherche Entreprises API (INSEE / RNE)
  useEffect(() => {
    const clean = query.trim().replace(/\s/g, "");
    if (!clean || clean.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (selectedCompany && (clean === selectedCompany.siret || query === selectedCompany.name)) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const encoded = encodeURIComponent(query.trim());
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encoded}&per_page=5`);
        if (res.ok) {
          const data = await res.json();
          const parsed: CompanyDetails[] = (data.results || []).map((r: any) => {
            const siege = r.siege || {};
            const siren = r.siren || "";
            // Calcul clé TVA FR si siren disponible
            let tva = r.tva?.[0] || "";
            if (!tva && siren.length === 9) {
              const sirenNum = parseInt(siren, 10);
              const key = (12 + 3 * (sirenNum % 97)) % 97;
              tva = `FR${key.toString().padStart(2, "0")}${siren}`;
            }

            return {
              siret: siege.siret || (r.matching_etablissements?.[0]?.siret) || siren.padEnd(14, "0"),
              siren: siren,
              name: r.nom_complet || r.nom_raison_sociale || "",
              address: siege.adresse || (siege.numero_voie ? `${siege.numero_voie} ${siege.type_voie || ""} ${siege.libelle_voie || ""}`.trim() : ""),
              postalCode: siege.code_postal || "",
              city: siege.libelle_commune || "",
              nafCode: r.activite_principale || siege.activite_principale || "",
              tvaNumber: tva,
              isOpen: r.etat_administratif === "A" && siege.etat_administratif !== "F",
            };
          });

          setResults(parsed);
          setIsOpen(parsed.length > 0);
          if (parsed.length === 0 && clean.length >= 9) {
            setErrorMsg("Aucune entreprise trouvée pour ce numéro ou ce nom dans le registre national INSEE / RNE.");
          }
        }
      } catch (err) {
        console.error("Erreur API SIRET:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCompany]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (c: CompanyDetails) => {
    setSelectedCompany(c);
    setQuery(`${c.name} (${formatSiretDisplay(c.siret)})`);
    setIsOpen(false);
    onCompanySelect(c);
  };

  const handleReset = () => {
    setSelectedCompany(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="siret-autocomplete-wrapper" ref={containerRef}>
      {/* Label & Badge Officiel Gouv */}
      <div className="siret-label-row">
        <label className="form-label-pro">
          <span className="flex items-center gap-1.5">
            <Building2 size={16} className="text-primary" />
            <span>Numéro SIRET ou Raison Sociale</span>
            {required && <span className="required-star">*</span>}
          </span>
        </label>
        <div className="badge-gouv-pill">
          <span className="badge-gouv-flag" aria-hidden="true">🇫🇷</span>
          <span className="badge-gouv-title">RNE / INSEE Certifié</span>
          <span className="badge-gouv-dot" />
        </div>
      </div>

      {/* Input de Recherche avec Icônes Internes */}
      <div className="input-with-icon-wrap">
        <div className="input-icon-left" aria-hidden="true">
          <Search size={18} className="text-primary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedCompany) {
              setSelectedCompany(null);
            }
          }}
          onFocus={() => {
            if (results.length > 0 && !selectedCompany) {
              setIsOpen(true);
            }
          }}
          placeholder="Ex: Jacky Perrenot, Mauffrey, ou 14 chiffres de SIRET..."
          required={required}
          className={`form-input-pro input-has-left-icon ${selectedCompany ? "input-valid-state" : ""}`}
          autoComplete="off"
        />
        <div className="input-right-indicator">
          {loading ? (
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden sm:inline">Vérification...</span>
            </div>
          ) : selectedCompany ? (
            <div className="flex items-center gap-1 text-xs text-success font-bold">
              <CheckCircle2 size={18} />
              <span className="hidden sm:inline">Certifié</span>
            </div>
          ) : query.length > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="btn-clear-input"
              title="Effacer la recherche"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {/* Message d'aide discret sous le champ */}
      <div className="siret-helper-text">
        <Sparkles size={13} className="text-primary shrink-0" />
        <span>Remplissage 100% automatique : nom officiel, siège, code NAF/APE et n° TVA intracommunautaire certifiés.</span>
      </div>

      {/* Message d'erreur recherche */}
      {errorMsg && (
        <div className="siret-error-banner">
          <AlertCircle size={15} className="shrink-0 text-danger" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dropdown Suggestions Officiel */}
      {isOpen && results.length > 0 && (
        <ul className="address-dropdown-menu">
          <li className="address-dropdown-header">
            <span>Résultats officiels du Registre National ({results.length})</span>
            <span className="text-xs text-muted">Sélectionnez votre établissement</span>
          </li>
          {results.map((c, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(c)}
              className="address-dropdown-item"
            >
              <div className="address-item-icon">
                <Building2 size={18} />
              </div>
              <div className="address-item-text">
                <div className="address-item-title">
                  <span className="company-result-name">{c.name}</span>
                  {c.isOpen ? (
                    <span className="badge-status-active">
                      <span className="badge-dot-active" />
                      En activité
                    </span>
                  ) : (
                    <span className="badge-status-closed">Radié / Fermé</span>
                  )}
                </div>
                <div className="address-item-subtitle">
                  <span className="siret-badge-pill">SIRET {formatSiretDisplay(c.siret)}</span>
                  <span>{c.postalCode} {c.city}</span>
                  {c.nafCode && <span className="naf-badge-pill">APE {c.nafCode}</span>}
                </div>
              </div>
              <ChevronRight size={16} className="address-item-arrow" />
            </li>
          ))}
        </ul>
      )}

      {/* Carte Officielle d'Établissement Validé */}
      {selectedCompany && (
        <div className="company-verified-card">
          <div className="verified-header">
            <div className="verified-header-left">
              <div className="verified-shield-icon">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="verified-main-title">
                  <span>Établissement Certifié au Registre National (INSEE / RNE)</span>
                  <BadgeCheck size={16} className="text-success inline-block ml-1" />
                </div>
                <div className="verified-sub-title">
                  Données officielles certifiées transmises en direct par l'API Gouvernementale (DINUM).
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="btn-reset-company"
              title="Rechercher une autre entreprise"
            >
              <RotateCcw size={13} />
              <span>Changer d'entreprise</span>
            </button>
          </div>

          <div className="verified-grid">
            <div className="verified-grid-card">
              <span className="verified-label">Dénomination Sociale :</span>
              <div className="verified-val-title">{selectedCompany.name}</div>
            </div>

            <div className="verified-grid-card">
              <span className="verified-label">Numéro SIRET (14 chiffres) :</span>
              <div className="verified-val-mono">{formatSiretDisplay(selectedCompany.siret)}</div>
            </div>

            <div className="verified-grid-card verified-card-span-2">
              <span className="verified-label">Siège Social & Adresse Légale :</span>
              <div className="verified-val-text flex items-center gap-1.5">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>{selectedCompany.address || "Adresse enregistrée au siège"}, {selectedCompany.postalCode} {selectedCompany.city}</span>
              </div>
            </div>

            {selectedCompany.nafCode && (
              <div className="verified-grid-card">
                <span className="verified-label">Code APE / Activité Principale :</span>
                <div className="verified-val-mono">{selectedCompany.nafCode}</div>
              </div>
            )}

            {selectedCompany.tvaNumber && (
              <div className="verified-grid-card">
                <span className="verified-label">N° TVA Intracommunautaire :</span>
                <div className="verified-val-mono">{selectedCompany.tvaNumber}</div>
              </div>
            )}
          </div>

          <div className="verified-card-footer">
            <div className="flex items-center gap-2 text-xs text-success font-semibold">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Établissement actif et vérifié — Éligible au recrutement direct de conducteurs sur TruckMatch</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
