import React from "react";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { SearchDriverBar } from "@/components/home/SearchDriverBar";
import { CategoryCards } from "@/components/home/CategoryCards";
import { DriverSection } from "@/components/home/DriverSection";
import { CompanySection } from "@/components/home/CompanySection";
import { LatestJobsSection } from "@/components/home/LatestJobsSection";
import { ARTICLES } from "@/lib/constants/articles";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

export default function HomePage() {
  const featuredArticles = ARTICLES.slice(0, 3);

  return (
    <div>
      <Hero />
      <SearchDriverBar />
      <CategoryCards />
      <DriverSection />
      <CompanySection />
      <LatestJobsSection />

      {/* Section Conseils & Recrutement Transport */}
      <section className="editorial-preview-section">
        <div className="container">
          <div className="editorial-head">
            <div>
              <span className="badge badge-blue">Expertise & Métiers</span>
              <h2 className="editorial-title">Conseils & recrutement transport</h2>
              <p className="editorial-subtitle">
                Guides pratiques, réglementations et bonnes pratiques pour réussir vos recrutements de conducteurs.
              </p>
            </div>
            <Link href="/conseils" className="btn btn-outline btn-sm">
              <BookOpen size={16} />
              <span>Tous nos guides</span>
            </Link>
          </div>

          <div className="articles-grid">
            {featuredArticles.map((art) => (
              <article key={art.slug} className="article-card">
                <div className="article-meta">
                  <span className="badge badge-navy">{art.category_label}</span>
                  <span className="read-time">
                    <Clock size={12} /> {art.read_time}
                  </span>
                </div>
                <h3 className="article-title">
                  <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
                </h3>
                <p className="article-excerpt">{art.summary}</p>
                <div className="article-link-wrap">
                  <Link href={`/conseils/${art.slug}`} className="article-read-link">
                    <span>Lire l'article</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
