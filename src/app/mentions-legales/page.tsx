import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales — TruckMatch",
  description: "Mentions légales, informations sur l'éditeur et l'hébergeur de la plateforme TruckMatch.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-box card">
          <h1 className="legal-title">Mentions Légales</h1>
          <p className="legal-update">Dernière mise à jour : Octobre 2026</p>

          <section className="legal-section">
            <h2>1. Éditeur de la plateforme</h2>
            <p>
              Le site et les services TruckMatch sont édités par la société TruckMatch, plateforme
              indépendante dédiée à la mise en relation dans le secteur du transport routier de marchandises.
            </p>
            <p>
              <strong>Email de contact :</strong> contact@truckmatch.fr
              <br />
              <strong>Directeur de la publication :</strong> Direction Générale TruckMatch
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Hébergement</h2>
            <p>
              La plateforme TruckMatch est hébergée sur des infrastructures serveurs situées dans l'Union Européenne :
            </p>
            <p>
              <strong>Hébergeur :</strong> OVH SAS
              <br />
              <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France
              <br />
              <strong>Site web :</strong> www.ovhcloud.com
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments constituant le site TruckMatch (textes, graphismes, logiciels, photographies,
              images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses) sont la propriété
              exclusive de TruckMatch ou de leurs titulaires respectifs.
            </p>
            <p>
              Toute reproduction, représentation, diffusion ou exploitation de quelque nature que ce soit, totale ou
              partielle, sans l'accord préalable écrit de TruckMatch est strictement interdite.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Données personnelles</h2>
            <p>
              Pour toute information relative au traitement des données personnelles et à l'exercice de vos droits,
              veuillez consulter notre{" "}
              <a href="/politique-confidentialite" className="legal-link">
                Politique de Confidentialité
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
