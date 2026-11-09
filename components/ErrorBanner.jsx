export default function ErrorBanner({ message, stale, onRetry }) {
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3 mb-0" role="alert">
      <span>{stale ? `${message}. Showing the last known prices.` : message}</span>
      <button type="button" className="btn btn-outline-danger btn-sm" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
