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

      {/* Section Conseils & Recrutement Transport 2.0 */}
      <section className="editorial-section-modern">
        <div className="container">
          <div className="head-bar-modern">
            <div>
              <span className="badge badge-blue">Expertise & Réglementation Transport</span>
              <h2>Conseils recrutement & carrières de conducteurs</h2>
              <p>
                Guides pratiques pour optimiser vos embauches de chauffeurs et réussir vos parcours routiers.
              </p>
            </div>
            <Link href="/conseils" className="btn btn-outline btn-sm">
              <BookOpen size={16} />
              <span>Consulter tous les guides</span>
            </Link>
          </div>

          <div className="articles-grid-modern">
            {featuredArticles.map((art) => (
              <article key={art.slug} className="article-card-modern">
                <div className="article-card-top-modern">
                  <span className="badge badge-navy">{art.category_label}</span>
                  <span className="read-time">
                    <Clock size={13} /> {art.read_time}
                  </span>
                </div>
                <h3 className="article-title-modern">
                  <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
                </h3>
                <p className="article-desc-modern">{art.summary}</p>
                <div className="article-footer-modern">
                  <Link href={`/conseils/${art.slug}`} className="btn btn-outline-primary btn-sm w-full">
                    <span>Lire l'article complet</span>
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
