import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU) — TruckMatch",
  description: "Conditions d'utilisation de la plateforme de mise en relation TruckMatch.",
};

export default function CGUPage() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-box card">
          <h1 className="legal-title">Conditions Générales d'Utilisation</h1>
          <p className="legal-update">En vigueur au 1er octobre 2026</p>

          <section className="legal-section">
            <h2>1. Objet des CGU</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la
              plateforme TruckMatch accessible à l'adresse truckmatch.fr.
            </p>
            <p>
              La plateforme a pour objet la mise en relation entre des conducteurs routiers à la recherche
              d'opportunités professionnelles et des entreprises de transport ou de logistique à la recherche
              de compétences de conduite.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Règle absolue de véracité des informations</h2>
            <p>
              Chaque utilisateur s'engage à fournir des informations strictement exactes, vérifiables et à jour.
            </p>
            <p>
              Les conducteurs s'engagent à détenir les permis, certificats FIMO/FCO et cartes conducteurs déclarés
              en cours de validité.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Absence de garantie d'embauche</h2>
            <p>
              TruckMatch est un intermédiaire technique de mise en relation directe. TruckMatch ne garantit pas
              aux chauffeurs une conclusion de contrat de travail, ni aux entreprises une disponibilité garantie
              à tout instant. La relation contractuelle de travail s'établit exclusivement et directement entre
              le recruteur et le conducteur.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Responsabilité de la plateforme</h2>
            <p>
              TruckMatch met en œuvre tous les moyens raisonnables pour assurer la disponibilité du service.
              TruckMatch ne saurait être tenue responsable des interruptions de service nécessaires à la
              maintenance technique ou dues à des cas de force majeure.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Droit applicable et juridiction</h2>
            <p>
              Les présentes conditions sont régies par le droit français. Tout litige relatif à leur
              interprétation ou leur exécution relève de la compétence exclusive des tribunaux français.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
