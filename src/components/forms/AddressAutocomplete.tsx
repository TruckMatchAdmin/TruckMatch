"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface AddressResult {
  label: string;
  name: string;
  postcode: string;
  city: string;
  context: string;
  depcode?: string;
  coordinates?: [number, number]; // [lng, lat]
}

interface AddressAutocompleteProps {
  label?: string;
  required?: boolean;
  onAddressSelect: (addr: {
    fullAddress: string;
    street: string;
    postalCode: string;
    city: string;
    department?: string;
    lat?: number;
    lng?: number;
  }) => void;
  defaultValue?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  label = "Adresse complète (Remplissage automatique)",
  required = true,
  onAddressSelect,
  defaultValue = "",
  placeholder = "Commencez à taper votre adresse (ex: 12 avenue des Transports, Lyon)...",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(defaultValue || null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search via l'API officielle de l'État Français (BAN)
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (query === selectedAddress) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(query.trim());
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encoded}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const items: AddressResult[] = (data.features || []).map((f: any) => ({
            label: f.properties.label,
            name: f.properties.name,
            postcode: f.properties.postcode,
            city: f.properties.city,
            context: f.properties.context,
            depcode: f.properties.depcode,
            coordinates: f.geometry?.coordinates,
          }));
          setResults(items);
          setIsOpen(items.length > 0);
        }
      } catch (err) {
        console.error("Erreur API adresse:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, selectedAddress]);

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

  const handleSelect = (item: AddressResult) => {
    setSelectedAddress(item.label);
    setQuery(item.label);
    setIsOpen(false);
    onAddressSelect({
      fullAddress: item.label,
      street: item.name || item.label,
      postalCode: item.postcode,
      city: item.city,
      department: item.depcode,
      lat: item.coordinates ? item.coordinates[1] : undefined,
      lng: item.coordinates ? item.coordinates[0] : undefined,
    });
  };

  return (
    <div className="address-autocomplete-wrapper" ref={containerRef}>
      <div className="siret-label-row">
        <label className="form-label-pro">
          <span className="flex items-center gap-1.5">
            <MapPin size={16} className="text-primary" />
            <span>{label}</span>
            {required && <span className="required-star">*</span>}
          </span>
        </label>
        <div className="badge-gouv-pill">
          <span className="badge-gouv-flag" aria-hidden="true">🇫🇷</span>
          <span className="badge-gouv-title">Base Adresse Nationale (BAN)</span>
          <span className="badge-gouv-dot" />
        </div>
      </div>

      <div className="input-with-icon-wrap">
        <div className="input-icon-left" aria-hidden="true">
          <MapPin size={18} className="text-primary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedAddress && e.target.value !== selectedAddress) {
              setSelectedAddress(null);
            }
          }}
          onFocus={() => {
            if (results.length > 0 && query !== selectedAddress) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={`form-input-pro input-has-left-icon ${selectedAddress ? "input-valid-state" : ""}`}
          autoComplete="off"
        />
        <div className="input-right-indicator">
          {loading ? (
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden sm:inline">Localisation...</span>
            </div>
          ) : selectedAddress ? (
            <div className="flex items-center gap-1 text-xs text-success font-bold">
              <CheckCircle2 size={18} />
              <span className="hidden sm:inline">Vérifiée</span>
            </div>
          ) : (
            <Search size={16} className="text-muted" />
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <ul className="address-dropdown-menu">
          <li className="address-dropdown-header">
            <span>Adresses officielles certifiées ({results.length})</span>
            <span className="text-xs text-muted">Sélectionnez votre localisation exacte</span>
          </li>
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="address-dropdown-item"
            >
              <div className="address-item-icon">
                <MapPin size={18} />
              </div>
              <div className="address-item-text">
                <div className="address-item-title">{item.label}</div>
                <div className="address-item-subtitle">{item.context}</div>
              </div>
              <ChevronRight size={16} className="address-item-arrow" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
