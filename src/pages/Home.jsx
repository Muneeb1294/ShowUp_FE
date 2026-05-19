import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard.jsx";
import PaginationBar, { buildPageNumbers } from "../components/PaginationBar.jsx";
import { normalizePagination } from "../lib/pagination.js";
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

function SectionHeading({ id, title, count, description }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <h2 id={id} className="section-heading">
          {title}
        </h2>
        {count != null && <span className="section-count">{count}</span>}
      </div>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
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
  const projectsSectionRef = useRef(null);

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

        setFeatured(featuredList.slice(0, 3));
        setProjects(list.projects ?? []);
        const meta = normalizePagination(list, page);
        setPagination(meta);
        if (meta.currentPage !== page) {
          setPage(meta.currentPage);
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

  const categoryName = useMemo(
    () => categories.find((c) => c.id === category)?.name,
    [categories, category],
  );

  const sortLabel = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort,
    [sort],
  );

  const hasActiveFilters = Boolean(search || category);

  function resetFilters(next) {
    setPage(1);
    return next;
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setPage(1);
  }

  function goToPage(nextPage) {
    setPage(nextPage);
    projectsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
      <header className="home-hero">
        <p className="page-eyebrow">Community catalog</p>
        <h1 className="page-title">Discover open-source projects</h1>
        <p className="page-lead max-w-xl">
          Browse approved repos, filter by category, and pin favorites for quick
          access.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!loading && totalProjects > 0 && (
            <span className="filter-chip">
              {totalProjects} project{totalProjects === 1 ? "" : "s"} in catalog
            </span>
          )}
          {user && (
            <Link to="/submit" className="btn-primary btn-sm">
              Submit a project
            </Link>
          )}
        </div>
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
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active filters
            </span>
            {search && <span className="filter-chip">Search: {search}</span>}
            {categoryName && (
              <span className="filter-chip">Category: {categoryName}</span>
            )}
            <span className="filter-chip">Sort: {sortLabel}</span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="alert-error mt-6">
          {error}
        </p>
      )}

      {showPins && (
        <section className="home-section" aria-labelledby="my-pins-heading">
          <SectionHeading
            id="my-pins-heading"
            title="My pins"
            count={pinsToShow.length}
            description="Projects you've saved for quick access."
          />
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
        <section
          className="home-section home-featured"
          aria-labelledby="featured-heading"
        >
          <SectionHeading
            id="featured-heading"
            title="Featured picks"
            count={featured.length}
            description="Highlighted by admins — also listed below with the full catalog."
          />
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
        ref={projectsSectionRef}
        className={`home-section ${showPins || showFeatured ? "" : "mt-10"}`}
        aria-labelledby="all-heading"
      >
        <SectionHeading
          id="all-heading"
          title={search ? "Search results" : "All projects"}
          count={!loading && totalProjects > 0 ? totalProjects : null}
          description={
            showFeatured
              ? "Full paginated list including featured projects."
              : undefined
          }
        />

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="skeleton-card" aria-hidden />
            ))}
          </div>
        )}

        {!loading && !error && totalProjects === 0 && (
          <p className="empty-state mt-8">
            No projects match your search or filters.
          </p>
        )}

        {!loading && projects.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                featured={p.is_featured}
                onSynced={handleSynced}
                onPinnedChange={handlePinnedChange}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {!loading && totalProjects > 0 && (
          <PaginationBar
            totalItems={totalProjects}
            itemLabel="projects"
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            pageNumbers={pageNumbers}
            onPageChange={goToPage}
            loading={loading}
          />
        )}
      </section>
    </main>
  );
}
