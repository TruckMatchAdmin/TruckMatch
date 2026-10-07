import React from "react";
import Link from "next/link";
import { Search, Filter, MapPin, FileText, Zap, PhoneCall, Building2, ArrowRight } from "lucide-react";

export function CompanySection() {
  const steps = [
    {
      num: "01",
      title: "Profils qualifiés & vérifiés",
      desc: "Accédez à un réseau exclusif de conducteurs SPL, PL, Porteurs et VUL prêts à rouler.",
      icon: Search,
    },
    {
      num: "02",
      title: "Filtres précis par habilitation",
      desc: "Ciblez par permis (C, EC), FIMO/FCO, validité carte chrono, citerne ADR ou CACES grue.",
      icon: Filter,
    },
    {
      num: "03",
      title: "Ciblage géographique immédiat",
      desc: "Localisez les chauffeurs résidant à proximité immédiate de vos dépôts et bases logistiques.",
      icon: MapPin,
    },
    {
      num: "04",
      title: "Dossiers de compétences complets",
      desc: "Consultez l'historique d'expérience, les types de matériels maîtrisés et les disponibilités.",
      icon: FileText,
    },
    {
      num: "05",
      title: "Gain de temps décisif",
      desc: "Remplacement urgent sous 24h ou renfort saisonnier sans délais d'agence d'intérim.",
      icon: Zap,
    },
    {
      num: "06",
      title: "Contact direct sans commission horaire",
      desc: "Échangez directement avec vos futurs conducteurs selon vos propres modalités contractuelles.",
      icon: PhoneCall,
    },
  ];

  return (
    <section className="company-section-modern">
      <div className="container">
        <div className="immersive-box">
          <div className="section-header-centered">
            <span className="badge badge-navy">Recruteurs & Entreprises de Transport</span>
            <h2>Vous recherchez un chauffeur ? Sécurisez vos tournées</h2>
            <p>
              La pénurie de conducteurs ne doit plus bloquer vos camions au dépôt. Identifiez
              immédiatement les professionnels disponibles sur vos bassins d'activité.
            </p>
          </div>

          <div className="grid-3-modern">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="feature-card-modern">
                  <div className="feature-icon-circle" style={{ color: "#0b192c" }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-card-title">{s.title}</h3>
                  <p className="feature-card-desc">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
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
