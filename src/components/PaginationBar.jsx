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

const pageBtnBase =
  "inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none";

const pageBtnActive =
  "border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700 hover:text-white";

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
            className={pageBtnBase}
          >
            First
          </button>
          <button
            type="button"
            disabled={!hasPrevPage || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className={pageBtnBase}
          >
            Prev
          </button>

          {showPageNumbers ? (
            pageNumbers.map((n, i) =>
              n === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex min-h-9 min-w-9 items-center justify-center px-1 text-sm font-medium text-slate-500"
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
                  className={`${pageBtnBase} min-w-9 ${n === currentPage ? pageBtnActive : ""}`}
                >
                  {n}
                </button>
              ),
            )
          ) : (
            <span
              className={`${pageBtnBase} min-w-9 ${pageBtnActive}`}
              aria-current="page"
            >
              1
            </span>
          )}

          <button
            type="button"
            disabled={!hasNextPage || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className={pageBtnBase}
          >
            Next
          </button>
          <button
            type="button"
            disabled={!hasNextPage || loading}
            onClick={() => onPageChange(totalPages)}
            className={pageBtnBase}
          >
            Last
          </button>
        </div>
      </div>
    </nav>
  );
}
