"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Truck, Calendar, UserPlus, Sparkles } from "lucide-react";

export function SearchDriverBar() {
  const [driverType, setDriverType] = useState("all");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("now");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <section className="search-section">
      <div className="container">
        <div className="search-card-modern">
          <div className="search-header-modern">
            <span className="search-badge-pill">
              <Sparkles size={14} /> Moteur de sourcing direct
            </span>
            <h2 className="search-title-modern">Trouvez le chauffeur dont vous avez besoin</h2>
            <p className="search-desc-modern">
              Filtrez instantanément parmi les conducteurs disponibles par région, type de véhicule et compétences.
            </p>
          </div>

          <form onSubmit={handleSearch} className="search-form-modern">
            <div className="search-field-modern">
              <label htmlFor="driver-type-select" className="search-label-modern">
                <Truck size={16} /> Type de chauffeur
              </label>
              <select
                id="driver-type-select"
                value={driverType}
                onChange={(e) => setDriverType(e.target.value)}
                className="search-select-modern"
              >
                <option value="all">Tous profils (SPL, PL, Porteur, VUL)</option>
                <option value="spl">Chauffeur SPL (Super Lourd - EC)</option>
                <option value="pl">Chauffeur PL (Poids Lourd - C)</option>
                <option value="porteur">Chauffeur Porteur (Grue / Benne)</option>
                <option value="vul">Chauffeur VUL / Dernier kilomètre</option>
              </select>
            </div>

            <div className="search-field-modern">
              <label htmlFor="location-input" className="search-label-modern">
                <MapPin size={16} /> Localisation / Dépôt
              </label>
              <input
                id="location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Lille, Lyon, 59, 69, Île-de-France..."
                className="search-input-modern"
              />
            </div>

            <div className="search-field-modern">
              <label htmlFor="avail-select" className="search-label-modern">
                <Calendar size={16} /> Disponibilité
              </label>
              <select
                id="avail-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="search-select-modern"
              >
                <option value="now">Disponible immédiatement</option>
                <option value="soon">Disponible sous 15 jours</option>
                <option value="ponctuel">Missions ponctuelles / Remplacement</option>
              </select>
            </div>

            <div>
              <button type="submit" className="btn btn-primary btn-lg search-btn-modern">
                <Search size={18} />
                <span>Rechercher</span>
              </button>
            </div>
          </form>

          {/* État vide propre et sans fausse donnée */}
          {hasSearched && (
            <div className="search-results-empty-modern">
              <h3 className="empty-title-modern">Aucun profil ne correspond exactement à ces critères pour l'instant</h3>
              <p className="empty-text-modern">
                De nouveaux conducteurs qualifiés rejoignent TruckMatch chaque jour. Vous êtes chauffeur dans cette zone ?
              </p>
              <div className="mt-3">
                <Link href="/chauffeurs" className="btn btn-primary">
                  <UserPlus size={16} />
                  <span>Créer mon profil chauffeur gratuitement</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
