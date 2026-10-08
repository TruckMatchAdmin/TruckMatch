import React from "react";
import Link from "next/link";
import { UserCheck, CheckCircle2, Shield, MapPin, Clock, Award, ArrowRight } from "lucide-react";

export function DriverSection() {
  const benefits = [
    {
      title: "Créez votre profil gratuitement",
      desc: "Inscription rapide et sans aucun frais, valorisez vos compétences sans intermédiaire.",
      icon: UserCheck,
    },
    {
      title: "Présentez votre expérience",
      desc: "Mettez en avant vos années de conduite, vos spécialités (bâché, frigo, citerne, benne).",
      icon: Award,
    },
    {
      title: "Indiquez vos permis & cartes",
      desc: "Permis C, EC, validité FIMO/FCO, carte conducteur numérique et attestations ADR.",
      icon: Shield,
    },
    {
      title: "Choisissez votre secteur",
      desc: "Définissez votre zone kilométrique, découché accepté ou retour quotidien au domicile.",
      icon: MapPin,
    },
    {
      title: "Affichez votre disponibilité",
      desc: "Disponible immédiatement, sous préavis ou pour des missions ponctuelles de relais.",
      icon: Clock,
    },
    {
      title: "Recevez des offres directes",
      desc: "Les transporteurs vous contactent directement sans passer par une agence intermédiaire.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="driver-section-modern">
      <div className="container">
        <div className="immersive-box">
          <div className="section-header-centered">
            <span className="badge badge-blue">Conducteurs & Chauffeurs Routiers</span>
            <h2>Vous êtes chauffeur ? Trouvez le poste qui respecte votre vie</h2>
            <p>
              Prenez les commandes de votre carrière. Valorisez vos habilitations et entrez directement
              en contact avec des entreprises de transport sérieuses.
            </p>
          </div>

          <div className="grid-3-modern">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="feature-card-modern">
                  <div className="feature-icon-circle">
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-card-title">{b.title}</h3>
                  <p className="feature-card-desc">{b.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/inscription?type=candidat" className="btn btn-primary btn-lg">
              <span>Créer mon profil chauffeur gratuitement</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
