import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants/categories";
import { ArrowRight, Check } from "lucide-react";

export function CategoryCards() {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-head-modern">
          <span className="badge badge-blue">Spécialités du transport routier</span>
          <h2>Explorez nos viviers de conducteurs par catégorie</h2>
          <p>
            Chaque type de marchandise et de véhicule impose des compétences réglementaires précises.
            Accédez directement aux spécialistes de votre secteur d'activité.
          </p>
        </div>

        <div className="categories-grid-modern">
          {Object.values(CATEGORIES).map((cat) => (
            <div key={cat.id} className="cat-card-modern">
              <div className="cat-card-top">
                <div className="cat-icon-visual-wrapper">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      width={120}
                      height={65}
                      className="cat-icon-visual-img"
                    />
                  ) : (
                    <span className="cat-icon-emoji">{cat.icon}</span>
                  )}
                </div>
                <span className="badge badge-navy">{cat.permits[0]}</span>
              </div>

              <h3 className="cat-title-modern">{cat.title}</h3>
              <p className="cat-desc-modern">{cat.description}</p>

              <div className="cat-pills-wrap">
                {cat.permits.map((permit, idx) => (
                  <span key={idx} className="permit-pill-modern">
                    <Check size={12} color="#0080ff" /> {permit}
                  </span>
                ))}
              </div>

              <div className="mt-auto">
                <Link href={`/chauffeurs/${cat.slug}`} className="btn btn-outline-primary btn-sm w-full">
                  <span>Voir la fiche métier & profils</span>
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
