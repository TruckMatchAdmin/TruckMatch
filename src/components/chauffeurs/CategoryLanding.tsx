import React from "react";
import Link from "next/link";
import {
  Check,
  Truck,
  ArrowRight,
  UserPlus,
  Building2,
  ShieldCheck,
  Clock,
  Euro,
  MapPin,
  Sparkles,
  FileText,
  BadgeCheck,
  ChevronRight,
  Phone,
  HelpCircle,
} from "lucide-react";

export interface CategoryLandingProps {
  id: "spl" | "pl" | "porteur" | "vul";
  title: string;
  shortTitle: string;
  badgePermit: string;
  badgeWeight: string;
  icon: string;
  heroDescription: string;
  salaryRange: string;
  experienceAvg: string;
  keySkills: string[];
  typicalMissions: string[];
  equipmentList?: string[];
  faqItems: { q: string; a: string }[];
  accentColor?: string; // ex: 'sky', 'emerald', 'amber', 'purple'
}

export function CategoryLanding({
  id,
  title,
  shortTitle,
  badgePermit,
  badgeWeight,
  icon,
  heroDescription,
  salaryRange,
  experienceAvg,
  keySkills,
  typicalMissions,
  equipmentList = [],
  faqItems,
}: CategoryLandingProps) {
  return (
    <div className="category-landing-page min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* 1. HERO SECTION PREMIUM */}
      <section className="relative pt-10 pb-16 border-b border-slate-900 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 overflow-hidden">
        {/* Halo lumineux */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <ChevronRight size={12} className="text-slate-600" />
            <Link href="/chauffeurs" className="hover:text-white transition-colors">
              Chauffeurs
            </Link>
            <ChevronRight size={12} className="text-slate-600" />
            <span className="text-sky-400 font-semibold">{shortTitle}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Texte Hero */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold">
                  <BadgeCheck size={14} />
                  <span>{badgePermit}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
                  <Truck size={14} className="text-amber-400" />
                  <span>{badgeWeight}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Profils Disponibles</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {title}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                {heroDescription}
              </p>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-3.5 items-center">
                <Link
                  href="/inscription?type=candidat"
                  className="btn btn-primary btn-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 gap-2 font-bold"
                >
                  <UserPlus size={18} />
                  <span>Créer mon profil {shortTitle}</span>
                </Link>

                <Link
                  href="/entreprises"
                  className="btn btn-secondary btn-lg border-slate-700 hover:border-slate-500 gap-2"
                >
                  <Building2 size={18} />
                  <span>Recruter un {shortTitle}</span>
                </Link>

                <Link
                  href="/carte-chauffeurs"
                  className="btn btn-outline btn-lg gap-2 text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
                >
                  <MapPin size={17} />
                  <span>Carte des conducteurs</span>
                </Link>
              </div>
            </div>

            {/* Carte Chiffres Clés Cockpit */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                  <span>Repères Clés du Métier</span>
                  <span className="text-2xl">{icon}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Euro size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Rémunération constatée</div>
                      <div className="text-sm font-bold text-white font-mono">{salaryRange}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Clock size={18} className="text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Expérience moyenne</div>
                      <div className="text-sm font-bold text-white">{experienceAvg}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <ShieldCheck size={18} className="text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Mise en relation directe</div>
                      <div className="text-sm font-bold text-white">100% Sans agence ni commission</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                  <Link
                    href="/offres-emploi"
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Consulter les offres d'emploi {shortTitle}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DÉTAILS COMPÉTENCES & MISSIONS TYPES */}
      <section className="py-12 border-b border-slate-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Compétences requises &amp; Configurations de postes
            </h2>
            <p className="text-slate-400 text-sm">
              Ce que recherchent les recruteurs et les exigences indispensables pour exercer en toute sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARTE 1 : COMPÉTENCES */}
            <div className="p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Qualifications &amp; Compétences clés</h3>
                  <p className="text-xs text-slate-400">Prérequis exigés par les entreprises de transport</p>
                </div>
              </div>

              <ul className="space-y-3.5">
                {keySkills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CARTE 2 : MISSIONS TYPES */}
            <div className="p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Missions &amp; Activités régulières</h3>
                  <p className="text-xs text-slate-400">Typologies de tournées les plus demandées</p>
                </div>
              </div>

              <ul className="space-y-3.5">
                {typicalMissions.map((mission, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <div className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                      •
                    </div>
                    <span>{mission}</span>
                  </li>
                ))}
              </ul>

              {equipmentList.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Équipements &amp; Spécialités courantes :
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {equipmentList.map((eq, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs font-mono"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOIRE AUX QUESTIONS MÉTIER */}
      {faqItems && faqItems.length > 0 && (
        <section className="py-12 border-b border-slate-900 bg-slate-900/30">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                <HelpCircle size={14} />
                <span>Questions Fréquentes</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Tout savoir sur le métier de {shortTitle}
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 shadow-md"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span className="text-sky-400 font-mono">Q{i + 1}.</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. BANNIÈRE FINALE DE MISE EN RELATION */}
      <section className="pt-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-sky-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-3">
                <Sparkles size={13} />
                <span>Réseau Direct Transport</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Besoin d'un {shortTitle} qualifié ou d'une nouvelle tournée ?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Rejoignez la première plateforme dédiée sans intermédiaire. Publication d'offres et mise en relation directe.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/inscription?type=candidat"
                className="btn btn-primary btn-lg shadow-lg font-bold"
              >
                <span>Je suis Chauffeur</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/entreprises"
                className="btn btn-secondary btn-lg border-slate-700"
              >
                <span>Je suis Transporteur</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
