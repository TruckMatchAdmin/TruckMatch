export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="page-loading-bar" />
      <span className="sr-only">Chargement en cours…</span>
    </div>
  );
}
