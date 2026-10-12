import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  Users,
  Truck,
  ArrowRight,
} from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { FacebookIcon, TelegramIcon } from "@/components/ui/SocialIcons";

export const metadata: Metadata = {
  title: "Contactez l'Équipe TruckMatch — Assistance, Recrutement & Support Transport",
  description:
    "Contact direct avec l'équipe TruckMatch : email jobs@truckmatch.fr, Telegram officiel @TruckMatchOfficiel et page Facebook. Permanence d'exploitation pour recruteurs et chauffeurs.",
  alternates: {
    canonical: "https://truckmatch.fr/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="contact-page min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* 1. HERO SECTION AVEC GLOW ET BADGES */}
      <section className="relative pt-12 pb-14 overflow-hidden border-b border-slate-900 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="container relative z-10 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
            <Sparkles size={14} />
            <span>Permanence Sourcing &amp; Exploitation Transport</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Contactez l'Équipe{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              TruckMatch
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
            Une question technique, un besoin urgent de conducteur routier ou un échange sur votre profil ?
            Notre permanence dédiée aux transporteurs et candidats est à votre écoute en direct.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Réponse garantie sous 24h ouvrées
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-sky-400" />
              Échanges sécurisés et confidentiels
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-amber-400" />
              100% Spécialisé transport de marchandises
            </span>
          </div>
        </div>
      </section>

      {/* 2. LES 3 CANAUX OFFICIELS DE CONTACT DIRECT */}
      <section className="py-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* CANAL 1 : EMAIL DIRECT */}
            <a
              href="mailto:jobs@truckmatch.fr"
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
                  Email Professionnel
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-sky-300 transition-colors">
                  jobs@truckmatch.fr
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Canal direct de la permanence. Idéal pour les besoins de tournées, dépôts de candidatures ou questions administratives.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400">
                <span>Écrire un message</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* CANAL 2 : TELEGRAM OFFICIEL */}
            <a
              href="https://t.me/TruckMatchOfficiel"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                  <TelegramIcon size={24} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  Canal Telegram Officiel
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors font-mono">
                  @TruckMatchOfficiel
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Messagerie instantanée &amp; alertes en direct. Échangez rapidement avec notre équipe sur Telegram pour toute urgence.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Ouvrir sur Telegram</span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>

            {/* CANAL 3 : FACEBOOK OFFICIEL */}
            <a
              href="https://www.facebook.com/profile.php?id=61593705328209"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-200 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-600/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  <FacebookIcon size={24} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                  Page Facebook Officielle
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  TruckMatch Officiel
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Rejoignez la communauté officielle des conducteurs et transporteurs. Actualités, tournées et opportunités en France.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>Rejoindre sur Facebook</span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 3. SECTION PRINCIPALE : FORMULAIRE DE CONTACT & INFORMATIONS D'EXPLOITATION */}
      <section className="py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* COLONNE GAUCHE (7 / 12) : FORMULAIRE INTERACTIF */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* COLONNE DROITE (5 / 12) : HORAIRES & ENGAGEMENTS DE SUPPORT */}
            <div className="lg:col-span-5 space-y-5">
              {/* CARTE 1 : PERMANENCE ET HORAIRES */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                  <Clock size={16} className="text-emerald-400" />
                  <span>Horaires de la Permanence</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <span className="text-slate-400">Du Lundi au Vendredi</span>
                    <span className="font-semibold text-white">8h30 — 19h00</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <span className="text-slate-400">Samedi &amp; Dimanche</span>
                    <span className="font-semibold text-amber-400">Astreinte Tournées Urgentes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Délai moyen de réponse</span>
                    <span className="font-mono font-bold text-emerald-400">&lt; 2 heures</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  En dehors des horaires ouvrés, nos notifications par bot Telegram restent actives pour tout besoin urgent de remplacement de chauffeur.
                </div>
              </div>

              {/* CARTE 2 : POURQUOI CONTACTER TRUCKMATCH */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                  <Truck size={16} className="text-sky-400" />
                  <span>Accompagnement Dédié</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-white">Transporteurs :</strong> Déposez vos besoins de conducteurs (SPL, PL, VUL) pour un matching express sous 24h.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-white">Conducteurs :</strong> Assistance pour la vérification de vos permis, FIMO, FCO et carte chrono sur votre compte.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-white">Zéro intermédiaire :</strong> Vous échangez directement avec les professionnels, sans commission d'agence.
                    </div>
                  </li>
                </ul>
              </div>

              {/* CARTE 3 : LIENS DIRECTS COMMUNAUTÉ */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Rejoignez notre réseau en direct
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Restez informé des nouveaux profils de conducteurs disponibles et des annonces de recrutement :
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://www.facebook.com/profile.php?id=61593705328209"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-600/30 text-blue-400 hover:bg-blue-600/25 transition-all text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <FacebookIcon size={16} />
                    <span>Facebook</span>
                  </a>

                  <a
                    href="https://t.me/TruckMatchOfficiel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition-all text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <TelegramIcon size={16} />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
