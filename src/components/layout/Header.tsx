"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MAIN_NAV } from "@/lib/constants/navigation";
import { Menu, X, ArrowRight, UserPlus, Building2 } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Logo */}
        <Link href="/" className="logo-link" aria-label="TruckMatch Accueil">
          <Image
            src="/images/logo.png"
            alt="TruckMatch - Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route."
            width={240}
            height={62}
            priority
            className="logo-img"
          />
        </Link>

        {/* Navigation Desktop */}
        <nav className="desktop-nav" aria-label="Navigation principale">
          <ul className="nav-list">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions Desktop */}
        <div className="header-actions">
          <Link href="/entreprises" className="btn btn-outline btn-sm header-btn-company">
            <Building2 size={16} />
            <span>Je suis une entreprise</span>
          </Link>
          <Link href="/chauffeurs" className="btn btn-primary btn-sm">
            <UserPlus size={16} />
            <span>Créer mon profil</span>
          </Link>
        </div>

        {/* Bouton Mobile Menu */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menu Mobile Déroulant */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-nav" aria-label="Navigation mobile">
            <ul className="mobile-nav-list">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mobile-menu-cta">
              <Link
                href="/entreprises"
                className="btn btn-outline btn-lg w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 size={18} />
                <span>Je suis une entreprise</span>
              </Link>
              <Link
                href="/chauffeurs"
                className="btn btn-primary btn-lg w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={18} />
                <span>Créer mon profil chauffeur</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
