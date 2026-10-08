"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/constants/navigation";
import { Menu, X, ArrowRight, UserPlus, Building2 } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="container header-container">
        {/* Logo */}
        <Link href="/" className="logo-link" aria-label="TruckMatch Accueil">
          <Image
            src="/images/logo.png"
            alt="TruckMatch - Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route."
            width={280}
            height={70}
            priority
            className="logo-img"
          />
        </Link>

        {/* Navigation Desktop Pro - Zero Layout Shift */}
        <nav className="desktop-nav" aria-label="Navigation principale">
          <ul className="nav-list">
            {MAIN_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions Desktop Pro */}
        <div className="header-actions">
          <Link href="/entreprises" className="header-btn-company-pro">
            <Building2 size={15} />
            <span>Espace Entreprise</span>
          </Link>
          <Link href="/inscription?type=candidat" className="header-btn-driver-pro">
            <UserPlus size={15} />
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
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile Déroulant Pro */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-nav" aria-label="Navigation mobile">
            <ul className="mobile-nav-list">
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mobile-menu-cta">
              <Link
                href="/entreprises"
                className="header-btn-company-pro w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 size={16} />
                <span>Espace Entreprise / Recruter</span>
              </Link>
              <Link
                href="/inscription?type=candidat"
                className="header-btn-driver-pro w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={16} />
                <span>Créer mon profil Chauffeur (Gratuit)</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
