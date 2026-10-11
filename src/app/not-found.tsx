import Link from "next/link";
import { Home, Search, Truck } from "lucide-react";

export default function NotFound() {
  return (
    <section className="state-page">
      <div className="state-card">
        <div className="state-icon" aria-hidden="true">
          <Truck size={34} />
        </div>
        <span className="state-code">404</span>
        <h1>Cette route n&apos;existe pas</h1>
        <p>
          La page que vous cherchez a été déplacée ou n&apos;existe plus. Revenez à l&apos;accueil
          ou consultez les dernières offres de chauffeurs routiers.
        </p>
        <div className="state-actions">
          <Link href="/" className="btn btn-primary">
            <Home size={16} />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <Link href="/offres-emploi" className="btn btn-outline">
            <Search size={16} />
            <span>Voir les offres</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
