import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories";
import { ArrowRight, Check } from "lucide-react";

export function CategoryCards() {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-head">
          <span className="badge badge-blue">Spécialisations transport</span>
          <h2 className="section-title">Explorez par profil de conducteur</h2>
          <p className="section-subtitle">
            Chaque mission requiert des permis et des compétences spécifiques. Filtrez rapidement selon vos besoins.
          </p>
        </div>

        <div className="categories-grid">
          {Object.values(CATEGORIES).map((cat) => (
            <div key={cat.id} className="cat-card">
              <div className="cat-header">
                <span className="cat-icon">{cat.icon}</span>
                <span className="badge badge-navy">{cat.permits[0]}</span>
              </div>

              <h3 className="cat-title">{cat.title}</h3>
              <p className="cat-desc">{cat.description}</p>

              <div className="cat-permits">
                {cat.permits.map((permit, idx) => (
                  <span key={idx} className="permit-pill">
                    <Check size={12} className="check-icon" /> {permit}
                  </span>
                ))}
              </div>

              <div className="cat-action">
                <Link href={`/chauffeurs/${cat.slug}`} className="cat-link">
                  <span>Découvrir les profils & missions</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
