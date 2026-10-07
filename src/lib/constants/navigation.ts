export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Trouver un chauffeur", href: "/entreprises" },
  { label: "Je suis chauffeur", href: "/chauffeurs" },
  { label: "Offres d'emploi", href: "/offres-emploi" },
  { label: "Conseils", href: "/conseils" },
];

export const CATEGORY_LINKS: NavItem[] = [
  { label: "Chauffeur SPL", href: "/chauffeurs/spl" },
  { label: "Chauffeur PL", href: "/chauffeurs/pl" },
  { label: "Chauffeur Porteur", href: "/chauffeurs/porteur" },
  { label: "Chauffeur VUL", href: "/chauffeurs/vul" },
];

export const FOOTER_LINKS = {
  chauffeurs: [
    { label: "Espace Chauffeur", href: "/chauffeurs" },
    { label: "Chauffeur SPL", href: "/chauffeurs/spl" },
    { label: "Chauffeur PL", href: "/chauffeurs/pl" },
    { label: "Chauffeur Porteur", href: "/chauffeurs/porteur" },
    { label: "Chauffeur VUL", href: "/chauffeurs/vul" },
    { label: "Offres d'emploi", href: "/offres-emploi" },
  ],
  entreprises: [
    { label: "Espace Entreprise", href: "/entreprises" },
    { label: "Recruter un chauffeur", href: "/entreprises" },
    { label: "Guide de recrutement", href: "/conseils/comment-recruter-un-chauffeur-spl" },
    { label: "Tarifs & solutions", href: "/entreprises#solutions" },
  ],
  conseils: [
    { label: "Tous les conseils", href: "/conseils" },
    { label: "Recruter un chauffeur SPL", href: "/conseils/comment-recruter-un-chauffeur-spl" },
    { label: "Trouver un chauffeur PL", href: "/conseils/comment-trouver-un-chauffeur-pl" },
    { label: "Devenir chauffeur routier", href: "/conseils/comment-devenir-chauffeur-routier" },
    { label: "Compétences & Permis", href: "/conseils/chauffeur-spl-competences-et-qualifications" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/politique-confidentialite" },
    { label: "Conditions Générales d'Utilisation", href: "/cgu" },
    { label: "Contact", href: "/contact" },
  ],
};
