import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProjectById } from "../api/projects.js";
import {
  fetchProjectComments,
  createProjectComment,
  deleteProjectComment,
  getErrorMessage,
} from "../api/comments.js";
import OwnerAvatar from "../components/OwnerAvatar.jsx";

const pageBtnClass =
  "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

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

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProjectCommentsPage() {
  const { id: projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    totalComments: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    totalComments,
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
    if (totalComments === 0) return "";
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalComments);
    return `Showing ${from}–${to} of ${totalComments}`;
  }, [currentPage, pageSize, totalComments]);

  function goToPage(nextPage) {
    setSearchParams(nextPage <= 1 ? {} : { page: String(nextPage) });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [projectData, commentsData] = await Promise.all([
          fetchProjectById(projectId),
          fetchProjectComments(projectId, page),
        ]);
        if (cancelled) return;

        setProject(projectData);
        setComments(commentsData.comments);
        setPagination({
          totalComments: commentsData.totalComments ?? 0,
          currentPage: commentsData.currentPage ?? page,
          totalPages: commentsData.totalPages ?? 1,
          pageSize: commentsData.pageSize ?? 10,
          hasNextPage: Boolean(commentsData.hasNextPage),
          hasPrevPage: Boolean(commentsData.hasPrevPage),
        });
        if (commentsData.currentPage !== page) {
          const p = commentsData.currentPage;
          setSearchParams(p <= 1 ? {} : { page: String(p) });
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
  }, [projectId, page]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    setSubmitting(true);
    setError("");
    try {
      await createProjectComment(projectId, text);
      setBody("");
      if (page === 1) {
        const commentsData = await fetchProjectComments(projectId, 1);
        setComments(commentsData.comments);
        setPagination({
          totalComments: commentsData.totalComments ?? 0,
          currentPage: commentsData.currentPage ?? 1,
          totalPages: commentsData.totalPages ?? 1,
          pageSize: commentsData.pageSize ?? 10,
          hasNextPage: Boolean(commentsData.hasNextPage),
          hasPrevPage: Boolean(commentsData.hasPrevPage),
        });
        setProject((p) =>
          p ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p,
        );
      } else {
        goToPage(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    setDeletingId(commentId);
    setError("");
    try {
      await deleteProjectComment(projectId, commentId);
      if (comments.length === 1 && page > 1) {
        goToPage(page - 1);
      } else {
        setComments((list) => list.filter((c) => c.id !== commentId));
        setPagination((p) => ({
          ...p,
          totalComments: Math.max(0, p.totalComments - 1),
        }));
        setProject((p) =>
          p ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) } : p,
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  function canDelete(comment) {
    if (!user) return false;
    return isAdmin || comment.user_id === user.id;
  }

  if (loading && !project) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-slate-500">Loading...</p>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p role="alert" className="text-red-600">
          {error}
        </p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to projects
      </Link>

      {project && (
        <header className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <OwnerAvatar
              url={project.owner_avatar_url}
              login={project.owner_login}
              size="md"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900">
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600"
                >
                  {project.repo_name}
                </a>
              </h1>
              {project.owner_login && (
                <p className="text-sm text-slate-500">@{project.owner_login}</p>
              )}
              {project.description && (
                <p className="mt-2 text-sm text-slate-600">{project.description}</p>
              )}
            </div>
          </div>
        </header>
      )}

      <section className="mt-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="text-lg font-semibold text-slate-900">
          Comments
          {project?.comment_count != null && (
            <span className="ml-2 text-base font-normal text-slate-500">
              ({project.comment_count})
            </span>
          )}
        </h2>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {user ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
              maxLength={2000}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            <Link to="/admin" className="text-indigo-600 hover:underline">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}

        {loading && <p className="mt-6 text-slate-500">Loading comments...</p>}

        {!loading && comments.length === 0 && !error && (
          <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            No comments yet. Be the first to comment.
          </p>
        )}

        {!loading && comments.length > 0 && (
          <ul className="mt-6 space-y-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {comment.author_name}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {comment.body}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  {canDelete(comment) && (
                    <button
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDelete(comment.id)}
                      className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === comment.id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && totalComments > 0 && (
          <nav
            className="mt-8 rounded-lg border border-slate-200 bg-white px-4 py-4"
            aria-label="Comments pagination"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                <p className="font-medium text-slate-900">
                  {totalComments} comment{totalComments === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5">{rangeLabel}</p>
                <p className="mt-0.5 text-slate-500">
                  Page {currentPage} of {totalPages}
                  {pageSize > 0 && ` · ${pageSize} per page`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  disabled={!hasPrevPage || loading}
                  onClick={() => goToPage(1)}
                  className={pageBtnClass}
                >
                  First
                </button>
                <button
                  type="button"
                  disabled={!hasPrevPage || loading}
                  onClick={() => goToPage(currentPage - 1)}
                  className={pageBtnClass}
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
                      onClick={() => goToPage(n)}
                      aria-current={n === currentPage ? "page" : undefined}
                      className={`${pageBtnClass} min-w-[2.25rem] ${
                        n === currentPage
                          ? "border-indigo-600 bg-indigo-50 font-medium text-indigo-700"
                          : ""
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={!hasNextPage || loading}
                  onClick={() => goToPage(currentPage + 1)}
                  className={pageBtnClass}
                >
                  Next
                </button>
                <button
                  type="button"
                  disabled={!hasNextPage || loading}
                  onClick={() => goToPage(totalPages)}
                  className={pageBtnClass}
                >
                  Last
                </button>
              </div>
            </div>
          </nav>
        )}
      </section>
    </main>
  );
}
