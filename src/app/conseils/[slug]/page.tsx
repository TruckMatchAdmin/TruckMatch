import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ARTICLES } from "@/lib/constants/articles";
import { Clock, Calendar, UserPlus, Building2, HelpCircle } from "lucide-react";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "Article non trouvé | TruckMatch",
    };
  }

  return {
    title: article.meta_title,
    description: article.meta_description,
    openGraph: {
      title: article.meta_title,
      description: article.meta_description,
      type: "article",
      publishedTime: article.published_at,
      authors: ["TruckMatch Rédaction"],
      url: `https://truckmatch.fr/conseils/${article.slug}`,
    },
    alternates: {
      canonical: `https://truckmatch.fr/conseils/${article.slug}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description,
    datePublished: article.published_at,
    author: {
      "@type": "Organization",
      name: "TruckMatch",
      url: "https://truckmatch.fr",
    },
    publisher: {
      "@type": "Organization",
      name: "TruckMatch",
      logo: {
        "@type": "ImageObject",
        url: "https://truckmatch.fr/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://truckmatch.fr/conseils/${article.slug}`,
    },
  };

  const otherArticles = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Article */}
      <header className="article-hero">
        <div className="container">
          <div className="article-hero-box">
            <nav className="breadcrumbs" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link> &gt; <Link href="/conseils">Conseils</Link> &gt;{" "}
              <span>{article.category_label}</span>
            </nav>

            <div className="article-badges">
              <span className="badge badge-blue">{article.category_label}</span>
              <span className="read-time">
                <Clock size={14} /> Temps de lecture : {article.read_time}
              </span>
              <span className="date-tag">
                <Calendar size={14} /> Publié le {article.published_at}
              </span>
            </div>

            <h1 className="article-h1">{article.title}</h1>
            <p className="article-lead">{article.content.intro}</p>
          </div>
        </div>
      </header>

      {/* Corps de l'article */}
      <main className="article-content-section">
        <div className="container">
          <div className="article-layout">
            <div className="article-body">
              {article.content.sections.map((section, idx) => (
                <section key={idx} className="content-block">
                  <h2 className="section-h2">{section.title}</h2>
                  <p className="section-p">{section.body}</p>
                </section>
              ))}

              {/* Bloc FAQ si disponible */}
              {article.content.faq && article.content.faq.length > 0 && (
                <section className="article-faq card">
                  <div className="faq-head">
                    <HelpCircle size={22} className="faq-ico" />
                    <h3 className="faq-title">Questions fréquentes sur ce sujet</h3>
                  </div>
                  <div className="faq-items">
                    {article.content.faq.map((q, idx) => (
                      <div key={idx} className="faq-item">
                        <h4 className="faq-question">{q.question}</h4>
                        <p className="faq-answer">{q.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CTAs Chauffeur & Entreprise intégrés */}
              <div className="article-cta-box">
                <div className="cta-col cta-driver">
                  <h4>Vous êtes chauffeur routier ?</h4>
                  <p>Mettez en avant vos compétences et vos permis auprès de transporteurs réputés.</p>
                  <Link href="/chauffeurs" className="btn btn-primary w-full">
                    <UserPlus size={16} />
                    <span>Créer mon profil gratuit</span>
                  </Link>
                </div>
                <div className="cta-col cta-company">
                  <h4>Vous recrutez des conducteurs ?</h4>
                  <p>Accédez aux chauffeurs qualifiés et disponibles sans commission d'intérim.</p>
                  <Link href="/entreprises" className="btn btn-secondary w-full">
                    <Building2 size={16} />
                    <span>Trouver un chauffeur</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Liens internes & articles associés */}
            <aside className="article-sidebar">
              <div className="sidebar-card card">
                <h3 className="sidebar-title">Spécialisations transport</h3>
                <ul className="sidebar-links">
                  <li>
                    <Link href="/chauffeurs/spl">🚛 Chauffeur SPL (Super Lourd)</Link>
                  </li>
                  <li>
                    <Link href="/chauffeurs/pl">🚚 Chauffeur PL (Poids Lourd)</Link>
                  </li>
                  <li>
                    <Link href="/chauffeurs/porteur">🚛 Chauffeur Porteur</Link>
                  </li>
                  <li>
                    <Link href="/chauffeurs/vul">🚐 Chauffeur VUL / Camionnette</Link>
                  </li>
                </ul>
              </div>

              <div className="sidebar-card card">
                <h3 className="sidebar-title">Articles recommandés</h3>
                <div className="other-articles-list">
                  {otherArticles.map((other) => (
                    <div key={other.slug} className="other-article-item">
                      <span className="badge badge-navy badge-sm">{other.category_label}</span>
                      <h4 className="other-title">
                        <Link href={`/conseils/${other.slug}`}>{other.title}</Link>
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
