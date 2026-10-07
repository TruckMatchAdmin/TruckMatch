import React from "react";
import Link from "next/link";
import { UserCheck, CheckCircle2, Shield, MapPin, Clock, Award, ArrowRight } from "lucide-react";

export function DriverSection() {
  const benefits = [
    {
      title: "Créez votre profil gratuitement",
      desc: "Inscription 100% gratuite, sans engagement ni frais cachés.",
      icon: UserCheck,
    },
    {
      title: "Présentez votre expérience",
      desc: "Mettez en avant vos années de route et vos spécialités de transport.",
      icon: Award,
    },
    {
      title: "Indiquez vos permis & qualifications",
      desc: "Renseignez vos permis (C, EC), FIMO, FCO, carte chrono et ADR.",
      icon: Shield,
    },
    {
      title: "Choisissez votre zone de travail",
      desc: "Définissez votre rayon kilométrique, vos préférences régionales ou nationales.",
      icon: MapPin,
    },
    {
      title: "Indiquez votre disponibilité",
      desc: "Disponible immédiatement, sous préavis ou pour des missions ponctuelles.",
      icon: Clock,
    },
    {
      title: "Soyez visible auprès des entreprises",
      desc: "Recevez directement des opportunités de transporteurs sans intermédiaire.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="driver-section">
      <div className="container">
        <div className="driver-wrapper">
          <div className="driver-header">
            <span className="badge badge-blue">Conducteurs routiers</span>
            <h2 className="driver-title">Vous êtes chauffeur ?</h2>
            <p className="driver-subtitle">
              Prenez le contrôle de votre carrière. Valorisez vos compétences et trouvez les missions
              qui correspondent à vos attentes géographiques et de rythme de vie.
            </p>
          </div>

          <div className="driver-grid">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="driver-benefit-card">
                  <div className="benefit-icon-box">
                    <Icon size={22} />
                  </div>
                  <h3 className="benefit-title">{b.title}</h3>
                  <p className="benefit-desc">{b.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="driver-cta-center">
            <Link href="/chauffeurs" className="btn btn-primary btn-lg">
              <span>Créer mon profil gratuitement</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
