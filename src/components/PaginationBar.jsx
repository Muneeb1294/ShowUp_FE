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

  return (
    <nav className="pagination-bar" aria-label="Pagination">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <p className="font-medium text-slate-900">
            {totalItems} {totalItems === 1 ? itemLabel.replace(/s$/, "") : itemLabel}
          </p>
          <p className="mt-0.5">{rangeLabel}</p>
          <p className="mt-0.5 text-slate-500">
            Page {currentPage} of {totalPages}
            {pageSize > 0 && ` · ${pageSize} per page`}
          </p>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={!hasPrevPage || loading}
              onClick={() => onPageChange(1)}
              className="btn-page"
            >
              First
            </button>
            <button
              type="button"
              disabled={!hasPrevPage || loading}
              onClick={() => onPageChange(currentPage - 1)}
              className="btn-page"
            >
              Prev
            </button>
            {pageNumbers.map((n, i) =>
              n === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-sm text-slate-400"
                  aria-hidden
                >
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
                  className={`btn-page min-w-[2.25rem] ${
                    n === currentPage ? "btn-page-active" : ""
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className="btn-page"
            >
              Next
            </button>
            <button
              type="button"
              disabled={!hasNextPage || loading}
              onClick={() => onPageChange(totalPages)}
              className="btn-page"
            >
              Last
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
