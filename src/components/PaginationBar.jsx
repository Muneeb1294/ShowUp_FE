export function buildPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current]);
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

function pageBtnClass(isActive) {
  return isActive ? "pagination-btn pagination-btn--active" : "pagination-btn";
}

export default function PaginationBar({
  totalItems,
  itemLabel = "projects",
  currentPage,
  totalPages,
  pageSize,
  hasNextPage,
  hasPrevPage,
  pageNumbers,
  onPageChange,
  loading = false,
}) {
  if (totalItems === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const rangeLabel = `Showing ${from}–${to} of ${totalItems}`;
  const label = totalItems === 1 ? itemLabel.replace(/s$/, "") : itemLabel;
  const showPageNumbers = totalPages > 1;

  return (
    <nav className="pagination-bar mt-8" aria-label="Pagination">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-900">
            {totalItems} {label}
          </p>
          <p className="mt-0.5">{rangeLabel}</p>
          <p className="mt-0.5 text-slate-600">
            Page {currentPage} of {totalPages}
            {pageSize > 0 && ` · ${pageSize} per page`}
          </p>
        </div>

        <div
          className="pagination-controls"
          role="group"
          aria-label="Page navigation"
        >
          <button
            type="button"
            disabled={!hasPrevPage || loading}
            onClick={() => onPageChange(1)}
            className="pagination-btn"
          >
            First
          </button>
          <button
            type="button"
            disabled={!hasPrevPage || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="pagination-btn"
          >
            Prev
          </button>

          {showPageNumbers ? (
            pageNumbers.map((n, i) =>
              n === "…" ? (
                <span key={`ellipsis-${i}`} className="pagination-ellipsis" aria-hidden>
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  disabled={loading}
                  onClick={() => onPageChange(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={pageBtnClass(n === currentPage)}
                >
                  {n}
                </button>
              ),
            )
          ) : (
            <span className="pagination-btn pagination-btn--active" aria-current="page">
              1
            </span>
          )}

          <button
            type="button"
            disabled={!hasNextPage || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="pagination-btn"
          >
            Next
          </button>
          <button
            type="button"
            disabled={!hasNextPage || loading}
            onClick={() => onPageChange(totalPages)}
            className="pagination-btn"
          >
            Last
          </button>
        </div>
      </div>
    </nav>
  );
}
