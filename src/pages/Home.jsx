import { useEffect, useMemo, useRef, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchProjects,
  fetchFeaturedProjects,
  fetchMyPinnedProjects,
  getErrorMessage,
} from "../api/projects.js";
import { fetchCategories } from "../api/categories.js";

const SORT_OPTIONS = [
  { value: "stars", label: "Most stars" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A–Z)" },
  { value: "language", label: "Language" },
];

function buildPageNumbers(current, total) {
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

function SectionHeading({ id, title, count }) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 id={id} className="section-heading">
        {title}
      </h2>
      {count != null && <span className="section-count">{count}</span>}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [myPins, setMyPins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("stars");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalProjects: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchMyPinnedProjects()
      .then(setMyPins)
      .catch(() => setMyPins([]));
  }, [user]);

  const prevSearchRef = useRef("");

  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim();
      if (prevSearchRef.current !== next) {
        prevSearchRef.current = next;
        setSearch(next);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const categoryFilter = category || undefined;
        const searchFilter = search || undefined;
        const [list, featuredList] = await Promise.all([
          fetchProjects({
            page,
            category: categoryFilter,
            sort,
            search: searchFilter,
          }),
          page === 1 && !searchFilter
            ? fetchFeaturedProjects({ category: categoryFilter })
            : Promise.resolve([]),
        ]);
        if (cancelled) return;

        const topFeatured = featuredList.slice(0, 3);
        const featuredIds = new Set(topFeatured.map((p) => p.id));

        setFeatured(topFeatured);
        setProjects(
          page === 1
            ? list.projects.filter((p) => !featuredIds.has(p.id))
            : list.projects
        );
        const nextPage = list.currentPage ?? page;
        setPagination({
          totalProjects: list.totalProjects ?? 0,
          currentPage: nextPage,
          totalPages: list.totalPages ?? 1,
          pageSize: list.pageSize ?? 10,
          hasNextPage: Boolean(list.hasNextPage),
          hasPrevPage: Boolean(list.hasPrevPage),
        });
        if (nextPage !== page) {
          setPage(nextPage);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, category, sort, search]);

  const {
    totalProjects,
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPrevPage,
  } = pagination;

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const rangeLabel = useMemo(() => {
    if (totalProjects === 0) return "";
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalProjects);
    return `${from}–${to} of ${totalProjects}`;
  }, [currentPage, pageSize, totalProjects]);

  function resetFilters(next) {
    setPage(1);
    return next;
  }

  function handleSynced(updated) {
    const merge = (list) =>
      list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
    setProjects(merge);
    setFeatured(merge);
    setMyPins(merge);
  }

  function handlePinnedChange(project, pinned) {
    const withPin = { ...project, is_pinned: pinned };
    const merge = (list) =>
      list.map((p) => (p.id === project.id ? { ...p, is_pinned: pinned } : p));
    setProjects(merge);
    setFeatured(merge);
    if (pinned) {
      setMyPins((list) =>
        list.some((p) => p.id === project.id) ? merge(list) : [withPin, ...list],
      );
    } else {
      setMyPins((list) => list.filter((p) => p.id !== project.id));
    }
  }

  function handleDeleted(projectId) {
    const remove = (list) => list.filter((p) => p.id !== projectId);
    setProjects(remove);
    setFeatured(remove);
    setMyPins(remove);
    setPagination((prev) => ({
      ...prev,
      totalProjects: Math.max(0, prev.totalProjects - 1),
    }));
  }

  const pinsToShow = user ? myPins : [];
  const showPins = pinsToShow.length > 0 && !search;
  const showFeatured = page === 1 && !search && featured.length > 0;

  return (
    <main className="page">
      <header className="page-header">
        <p className="page-eyebrow">Community catalog</p>
        <h1 className="page-title">Discover open-source projects</h1>
        <p className="page-lead">
          Browse approved repos, filter by category, and pin favorites for quick
          access.
        </p>
      </header>

      <div className="filter-bar mt-8">
        <div className="filter-grid">
          <div className="filter-field sm:col-span-2 lg:col-span-1">
            <label htmlFor="home-search">Search</label>
            <input
              id="home-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Repos, languages, topics…"
              className="input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="home-category">Category</label>
            <select
              id="home-category"
              value={category}
              onChange={(e) => setCategory(resetFilters(e.target.value))}
              className="select"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="home-sort">Sort by</label>
            <select
              id="home-sort"
              value={sort}
              onChange={(e) => setSort(resetFilters(e.target.value))}
              className="select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="alert-error mt-6">
          {error}
        </p>
      )}

      {showPins && (
        <section className="mt-12" aria-labelledby="my-pins-heading">
          <SectionHeading id="my-pins-heading" title="My pins" count={pinsToShow.length} />
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pinsToShow.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onSynced={handleSynced}
                onPinnedChange={handlePinnedChange}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        </section>
      )}

      {showFeatured && (
        <section className="mt-12" aria-labelledby="featured-heading">
          <SectionHeading id="featured-heading" title="Featured" />
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                featured
                onSynced={handleSynced}
                onPinnedChange={handlePinnedChange}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        </section>
      )}

      <section
        className={showPins || showFeatured ? "mt-12" : "mt-10"}
        aria-labelledby="all-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionHeading
            id="all-heading"
            title={search ? "Search results" : "All projects"}
            count={!loading && totalProjects > 0 ? totalProjects : null}
          />
          {!loading && totalProjects > 0 && (
            <p className="text-sm text-slate-500">{rangeLabel}</p>
          )}
        </div>

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="skeleton-card"
                aria-hidden
              />
            ))}
          </div>
        )}

        {!loading && !error && totalProjects === 0 && (
          <p className="empty-state mt-8">
            No projects match your search or filters.
          </p>
        )}

        {!loading && totalProjects > 0 && projects.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Featured projects are listed above. Go to the next page for more.
          </p>
        )}

        {!loading && projects.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onSynced={handleSynced}
                onPinnedChange={handlePinnedChange}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-1"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={!hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="btn-page"
              aria-label="Previous page"
            >
              Previous
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
                  onClick={() => setPage(n)}
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
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="btn-page"
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
