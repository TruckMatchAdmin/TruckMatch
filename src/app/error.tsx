"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="state-page">
      <div className="state-card">
        <div className="state-icon state-icon-warn" aria-hidden="true">
          <AlertTriangle size={34} />
        </div>
        <h1>Un incident est survenu</h1>
        <p>
          Quelque chose s&apos;est mal passé lors du chargement de cette page. Réessayez, ou
          revenez à l&apos;accueil.
        </p>
        <div className="state-actions">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            <RotateCcw size={16} />
            <span>Réessayer</span>
          </button>
          <Link href="/" className="btn btn-outline">
            <Home size={16} />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
