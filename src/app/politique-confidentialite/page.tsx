import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité & RGPD — TruckMatch",
  description:
    "Engagement de TruckMatch pour la protection des données personnelles des conducteurs et des recruteurs conformément au RGPD.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-box card">
          <h1 className="legal-title">Politique de Confidentialité</h1>
          <p className="legal-update">Dernière mise à jour : Octobre 2026 — Conforme RGPD</p>

          <section className="legal-section">
            <h2>1. Engagement de confidentialité</h2>
            <p>
              TruckMatch s'engage résolument à préserver la confidentialité et la sécurité des données
              personnelles de ses utilisateurs, qu'ils soient chauffeurs routiers ou représentants
              d'entreprises de transport.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation de nos services, nous collectons les données suivantes :</p>
            <ul className="legal-bullet-list">
              <li>
                <strong>Pour les chauffeurs :</strong> nom, prénom, numéro de téléphone, email, localisation
                (ville/département), types de permis détenus (C, EC, B), validité FIMO/FCO, cartes conducteurs,
                habilitations spécifiques (ADR, grue).
              </li>
              <li>
                <strong>Pour les entreprises :</strong> raison sociale, numéro SIREN/SIRET, coordonnées du
                contact recruteur, besoins en effectifs et localisations de missions.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Finalités du traitement</h2>
            <p>Les données sont collectées exclusivement pour :</p>
            <ul className="legal-bullet-list">
              <li>Permettre la mise en relation ciblée entre chauffeurs et recruteurs ;</li>
              <li>Vérifier la cohérence des compétences professionnelles déclarées ;</li>
              <li>Assurer la sécurité des échanges et prévenir les abus ;</li>
              <li>Répondre aux obligations légales et réglementaires applicables.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Non-divulgation des coordonnées privées</h2>
            <p>
              Les coordonnées directes des conducteurs (numéro de téléphone, adresse précise, documents
              confidentiels) ne sont jamais affichées publiquement en libre accès sur le web.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Vos droits (RGPD)</h2>
            <p>
              Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification,
              d'effacement, de limitation du traitement et de portabilité de vos données.
            </p>
            <p>
              Pour exercer vos droits, adressez votre demande à :{" "}
              <strong>dpo@truckmatch.fr</strong> ou via notre formulaire de contact.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
