"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

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
    <div className="address-autocomplete-wrapper" ref={containerRef} style={{ position: "relative" }}>
      <label className="form-label">
        <span className="flex items-center gap-1.5">
          <MapPin size={15} className="text-primary" />
          <span>{label}</span>
          {required && <span className="text-danger">*</span>}
        </span>
        <span className="badge-gouv-pill">Officiel Data.gouv.fr</span>
      </label>

      <div className="input-with-icon-wrap">
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
          className={`form-input ${selectedAddress ? "input-valid-state" : ""}`}
          autoComplete="off"
        />
        <div className="input-right-indicator">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-primary" />
          ) : selectedAddress ? (
            <CheckCircle2 size={17} className="text-success" />
          ) : (
            <Search size={16} className="text-muted" />
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <ul className="address-dropdown-menu">
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="address-dropdown-item"
            >
              <div className="address-item-icon">
                <MapPin size={16} />
              </div>
              <div className="address-item-text">
                <div className="address-item-title">{item.label}</div>
                <div className="address-item-subtitle">{item.context}</div>
              </div>
              <ChevronRight size={14} className="address-item-arrow" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
