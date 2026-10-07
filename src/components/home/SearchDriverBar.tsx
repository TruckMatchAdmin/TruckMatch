"use client";

import React, { useState } from "react";
import { Search, MapPin, Truck, Calendar, UserPlus } from "lucide-react";

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
        <div className="search-card">
          <div className="search-header">
            <h2 className="search-title">Trouvez le chauffeur dont vous avez besoin</h2>
            <p className="search-desc">
              Accédez directement aux profils de conducteurs qualifiés et disponibles sur votre secteur.
            </p>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <div className="search-field">
              <label htmlFor="driver-type-select" className="search-label">
                <Truck size={16} /> Type de chauffeur
              </label>
              <select
                id="driver-type-select"
                value={driverType}
                onChange={(e) => setDriverType(e.target.value)}
                className="search-select"
              >
                <option value="all">Tous les types de chauffeurs</option>
                <option value="spl">Chauffeur SPL (Super Lourd)</option>
                <option value="pl">Chauffeur PL (Poids Lourd)</option>
                <option value="porteur">Chauffeur Porteur</option>
                <option value="vul">Chauffeur VUL / Camionnette</option>
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="location-input" className="search-label">
                <MapPin size={16} /> Localisation
              </label>
              <input
                id="location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ville, département ou région..."
                className="search-input"
              />
            </div>

            <div className="search-field">
              <label htmlFor="avail-select" className="search-label">
                <Calendar size={16} /> Disponibilité
              </label>
              <select
                id="avail-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="search-select"
              >
                <option value="now">Disponible immédiatement</option>
                <option value="soon">Disponible prochainement</option>
              </select>
            </div>

            <div className="search-submit-col">
              <button type="submit" className="btn btn-primary btn-lg w-full search-btn">
                <Search size={18} />
                <span>Rechercher un chauffeur</span>
              </button>
            </div>
          </form>

          {/* État vide propre lors d'une recherche sans données inventées */}
          {hasSearched && (
            <div className="search-results-empty">
              <div className="empty-bubble">
                <p className="empty-title">Aucun chauffeur trouvé pour ces critères pour le moment</p>
                <p className="empty-text">
                  Les profils de conducteurs sont vérifiés avant publication. Vous êtes chauffeur dans cette zone ?
                </p>
                <a href="/chauffeurs" className="btn btn-primary btn-sm mt-3">
                  <UserPlus size={16} />
                  <span>Créer mon profil gratuitement</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
