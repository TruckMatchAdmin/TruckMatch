import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

const PARTNER_LOGOS = [
  { name: "XPO Logistics", src: "/images/partners/logo-xpo.png", width: 150, height: 60 },
  { name: "GEODIS", src: "/images/partners/logo-geodis.png", width: 140, height: 65 },
  { name: "DB Schenker", src: "/images/partners/logo-db-schenker.png", width: 150, height: 60 },
  { name: "DHL", src: "/images/partners/logo-dhl.png", width: 150, height: 40 },
  { name: "STEF", src: "/images/partners/logo-stef.png", width: 140, height: 45 },
  { name: "Kuehne+Nagel", src: "/images/partners/logo-kuehne-nagel.png", width: 150, height: 65 },
  { name: "DSV", src: "/images/partners/logo-dsv.png", width: 140, height: 45 },
  { name: "CEVA Logistics", src: "/images/partners/logo-ceva.png", width: 145, height: 48 },
  { name: "FM Logistic", src: "/images/partners/logo-fm-logistic.png", width: 135, height: 55 },
  { name: "Dachser", src: "/images/partners/logo-dachser.png", width: 145, height: 50 },
];

export function PartnerMarquee() {
  return (
    <section className="partner-marquee-section" aria-label="Entreprises partenaires">
      <div className="container">
        <div className="partner-marquee-header">
          <span className="badge badge-blue">
            <Sparkles size={13} /> Leaders du Transport & Logistique
          </span>
          <h2 className="partner-marquee-title">Ils nous font déjà confiance</h2>
          <p className="partner-marquee-subtitle">
            Les plus grands transporteurs recrutent leurs conducteurs routiers sur TruckMatch
          </p>
        </div>
      </div>

      <div className="partner-marquee-container">
        <div className="partner-marquee-track">
          {/* Première série de logos */}
          {PARTNER_LOGOS.map((logo, idx) => (
            <div key={`logo-1-${idx}`} className="partner-marquee-card">
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="partner-marquee-logo-img"
              />
            </div>
          ))}

          {/* Deuxième série pour le défilement infini fluide */}
          {PARTNER_LOGOS.map((logo, idx) => (
            <div key={`logo-2-${idx}`} className="partner-marquee-card">
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="partner-marquee-logo-img"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
