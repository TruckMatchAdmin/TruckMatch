"use client";

import React, { useState, useEffect, useRef } from "react";
import { Building2, Search, Loader2, CheckCircle2, AlertCircle, ChevronRight, ShieldCheck } from "lucide-react";

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
            setErrorMsg("Aucune entreprise trouvée pour ce numéro ou ce nom dans le registre national.");
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
    setQuery(`${c.name} (SIRET: ${c.siret})`);
    setIsOpen(false);
    onCompanySelect(c);
  };

  return (
    <div className="siret-autocomplete-wrapper" ref={containerRef} style={{ position: "relative" }}>
      <label className="form-label">
        <span className="flex items-center gap-1.5">
          <Building2 size={15} className="text-primary" />
          <span>Numéro SIRET ou Raison Sociale</span>
          {required && <span className="text-danger">*</span>}
        </span>
        <span className="badge-gouv-pill">Vérification Gouvernementale RNE / INSEE</span>
      </label>

      <div className="input-with-icon-wrap">
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
          placeholder="Saisissez vos 14 chiffres de SIRET ou le nom de l'entreprise..."
          required={required}
          className={`form-input ${selectedCompany ? "input-valid-state" : ""}`}
          autoComplete="off"
        />
        <div className="input-right-indicator">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-primary" />
          ) : selectedCompany ? (
            <CheckCircle2 size={17} className="text-success" />
          ) : (
            <Search size={16} className="text-muted" />
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs text-danger mt-1 flex items-center gap-1">
          <AlertCircle size={13} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <ul className="address-dropdown-menu">
          {results.map((c, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(c)}
              className="address-dropdown-item"
            >
              <div className="address-item-icon">
                <Building2 size={16} />
              </div>
              <div className="address-item-text">
                <div className="address-item-title flex items-center gap-2">
                  <span>{c.name}</span>
                  {c.isOpen ? (
                    <span className="badge-status-active">Actif</span>
                  ) : (
                    <span className="badge-status-closed">Fermé</span>
                  )}
                </div>
                <div className="address-item-subtitle">
                  SIRET : <strong>{c.siret}</strong> — {c.postalCode} {c.city}
                  {c.nafCode && ` (APE: ${c.nafCode})`}
                </div>
              </div>
              <ChevronRight size={14} className="address-item-arrow" />
            </li>
          ))}
        </ul>
      )}

      {/* Feedback Carte Entreprise Validée */}
      {selectedCompany && (
        <div className="company-verified-card">
          <div className="verified-header">
            <div className="flex items-center gap-1.5 text-success font-semibold text-sm">
              <ShieldCheck size={16} />
              <span>Entreprise vérifiée auprès du Registre National des Entreprises (INSEE)</span>
            </div>
          </div>
          <div className="verified-grid">
            <div>
              <span className="text-muted text-xs">Raison sociale :</span>
              <div className="font-semibold text-sm">{selectedCompany.name}</div>
            </div>
            <div>
              <span className="text-muted text-xs">SIRET :</span>
              <div className="font-mono text-sm">{selectedCompany.siret}</div>
            </div>
            <div>
              <span className="text-muted text-xs">Siège / Établissement :</span>
              <div className="text-sm">{selectedCompany.address || "Adresse enregistrée"}, {selectedCompany.postalCode} {selectedCompany.city}</div>
            </div>
            {selectedCompany.nafCode && (
              <div>
                <span className="text-muted text-xs">Code APE / NAF :</span>
                <div className="text-sm font-mono">{selectedCompany.nafCode}</div>
              </div>
            )}
            {selectedCompany.tvaNumber && (
              <div>
                <span className="text-muted text-xs">TVA Intracommunautaire :</span>
                <div className="text-sm font-mono">{selectedCompany.tvaNumber}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
