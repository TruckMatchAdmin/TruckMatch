import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://truckmatch.fr"),
  title: {
    default: "TruckMatch — Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route.",
    template: "%s | TruckMatch",
  },
  description:
    "Plateforme spécialisée dans le recrutement et la mise en relation entre transporteurs et chauffeurs routiers (SPL, PL, Porteur, VUL). Recrutez sans intermédiaire superflu.",
  keywords: [
    "chauffeur SPL",
    "chauffeur PL",
    "chauffeur porteur",
    "chauffeur VUL",
    "recrutement transport",
    "emploi chauffeur routier",
    "transport de marchandises",
    "FIMO",
    "FCO",
  ],
  authors: [{ name: "TruckMatch" }],
  creator: "TruckMatch",
  publisher: "TruckMatch",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://truckmatch.fr",
    siteName: "TruckMatch",
    title: "TruckMatch — La plateforme de recrutement du transport routier",
    description:
      "Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route. Mise en relation directe pour chauffeurs SPL, PL, Porteur et VUL.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "TruckMatch Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TruckMatch",
    url: "https://truckmatch.fr",
    description: "Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://truckmatch.fr/offres-emploi?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Header />
        <main style={{ minHeight: "calc(100vh - 160px)" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
