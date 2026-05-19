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
      <main className="page-medium">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="page-medium">
        <p role="alert" className="alert-error">
          {error}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main className="page-medium">
      <Link
        to="/"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        ← Back to projects
      </Link>

      {project && (
        <header className="panel-padded mt-6">
          <div className="flex items-start gap-3">
            <OwnerAvatar
              url={project.owner_avatar_url}
              login={project.owner_login}
              size="md"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
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
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </header>
      )}

      <section className="mt-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="section-heading">
          Comments
          {project?.comment_count != null && (
            <span className="ml-2 text-base font-normal text-slate-500">
              ({project.comment_count})
            </span>
          )}
        </h2>

        {error && (
          <p role="alert" className="alert-error mt-4">
            {error}
          </p>
        )}

        {user ? (
          <form onSubmit={handleSubmit} className="panel-padded mt-4 space-y-3">
            <label htmlFor="comment-body" className="field-label">
              Add a comment
            </label>
            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts about this project…"
              rows={4}
              maxLength={2000}
              className="textarea"
            />
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="btn-primary"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}

        {loading && <p className="mt-6 text-slate-500">Loading comments...</p>}

        {!loading && comments.length === 0 && !error && (
          <p className="empty-state mt-6">
            No comments yet. Be the first to comment.
          </p>
        )}

        {!loading && comments.length > 0 && (
          <ul className="mt-6 space-y-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="comment-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {comment.author_name}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
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
                      className="btn-danger btn-sm shrink-0 disabled:opacity-50"
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
            className="panel-padded mt-8"
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
                  className="btn-page"
                >
                  First
                </button>
                <button
                  type="button"
                  disabled={!hasPrevPage || loading}
                  onClick={() => goToPage(currentPage - 1)}
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
                      onClick={() => goToPage(n)}
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
                  onClick={() => goToPage(currentPage + 1)}
                  className="btn-page"
                >
                  Next
                </button>
                <button
                  type="button"
                  disabled={!hasNextPage || loading}
                  onClick={() => goToPage(totalPages)}
                  className="btn-page"
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
