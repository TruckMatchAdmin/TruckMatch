import React from "react";
import Link from "next/link";
import { Search, Filter, MapPin, FileText, Zap, PhoneCall, Building2, ArrowRight } from "lucide-react";

export function CompanySection() {
  const steps = [
    {
      num: "01",
      title: "Profils spécialisés",
      desc: "Accédez à une communauté de chauffeurs qualifiés du VUL au SPL.",
      icon: Search,
    },
    {
      num: "02",
      title: "Filtres précis",
      desc: "Filtrez instantanément par permis (C, EC), FIMO/FCO, ADR, grue et expérience.",
      icon: Filter,
    },
    {
      num: "03",
      title: "Ciblage géographique",
      desc: "Sélectionnez les candidats selon votre ville, département ou rayon logistique.",
      icon: MapPin,
    },
    {
      num: "04",
      title: "Consultez les profils",
      desc: "Accédez aux synthèses de compétences et aux disponibilités vérifiées.",
      icon: FileText,
    },
    {
      num: "05",
      title: "Gain de temps maximal",
      desc: "Fini les intermédiaires lents : trouvez votre conducteur en quelques clics.",
      icon: Zap,
    },
    {
      num: "06",
      title: "Contactez directement",
      desc: "Échangez directement avec les candidats disponibles sans commissions indues.",
      icon: PhoneCall,
    },
  ];

  return (
    <section className="company-section">
      <div className="container">
        <div className="company-wrapper">
          <div className="company-header">
            <span className="badge badge-navy">Recruteurs & Transporteurs</span>
            <h2 className="company-title">Vous recherchez un chauffeur ?</h2>
            <p className="company-subtitle">
              Sécurisez vos tournées et répondez immédiatement à vos surcroîts d'activité avec des conducteurs
              rigoureusement référencés.
            </p>
          </div>

          <div className="company-grid">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="company-step-card">
                  <div className="step-card-top">
                    <span className="step-num">{s.num}</span>
                    <div className="step-icon-wrap">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="company-cta-group">
            <Link href="/entreprises" className="btn btn-primary btn-lg">
              <span>Trouver un chauffeur</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/entreprises" className="btn btn-outline btn-lg">
              <Building2 size={18} />
              <span>Créer mon espace entreprise</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
