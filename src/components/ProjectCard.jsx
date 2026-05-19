import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  syncProject,
  deleteProject,
  pinProject,
  unpinProject,
  getErrorMessage,
} from "../api/projects.js";
import OwnerAvatar from "./OwnerAvatar.jsx";

const MAX_TOPICS = 3;

function formatStars(count) {
  const n = count ?? 0;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export default function ProjectCard({
  project,
  featured = false,
  onSynced,
  onPinnedChange,
  onDeleted,
}) {
  const { user, isAdmin } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [pinError, setPinError] = useState("");

  const topics = project.topics ?? [];
  const visibleTopics = topics.slice(0, MAX_TOPICS);
  const hiddenTopicCount = topics.length - visibleTopics.length;
  const showActions = user || isAdmin;
  const commentCount = project.comment_count ?? 0;

  async function handlePinToggle() {
    setPinning(true);
    setPinError("");
    try {
      if (project.is_pinned) {
        await unpinProject(project.id);
        onPinnedChange?.({ ...project, is_pinned: false }, false);
      } else {
        await pinProject(project.id);
        onPinnedChange?.({ ...project, is_pinned: true }, true);
      }
    } catch (err) {
      setPinError(getErrorMessage(err));
    } finally {
      setPinning(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncError("");
    try {
      const updated = await syncProject(project.id);
      onSynced?.(updated);
    } catch (err) {
      setSyncError(getErrorMessage(err));
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete() {
    const label = project.repo_name || "this project";
    if (
      !window.confirm(
        `Delete "${label}" permanently? Comments and pins will be removed.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProject(project.id);
      onDeleted?.(project.id);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article
      className={`group flex h-full flex-col rounded-xl border bg-white transition-shadow ${
        featured
          ? "border-indigo-200 shadow-md ring-1 ring-indigo-100"
          : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <OwnerAvatar
            url={project.owner_avatar_url}
            login={project.owner_login}
            size={featured ? "md" : "sm"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 text-base font-semibold leading-snug text-slate-900">
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600"
                >
                  {project.repo_name}
                </a>
              </h3>
              {(project.is_featured || project.is_pinned) && (
                <div className="flex shrink-0 gap-1">
                  {project.is_featured && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Featured
                    </span>
                  )}
                  {project.is_pinned && user && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                      Pinned
                    </span>
                  )}
                </div>
              )}
            </div>
            {project.owner_login && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                @{project.owner_login}
              </p>
            )}
          </div>
        </div>

        {project.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {project.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No description</p>
        )}

        <ul className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {project.language && (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
              <span
                className="h-2 w-2 rounded-full bg-indigo-400"
                aria-hidden
              />
              {project.language}
            </li>
          )}
          <li className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            <span aria-hidden>★</span>
            {formatStars(project.stars)}
          </li>
          {project.category_name && (
            <li className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600 ring-1 ring-slate-200/80">
              {project.category_name}
            </li>
          )}
        </ul>

        {visibleTopics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200/60"
              >
                {topic}
              </span>
            ))}
            {hiddenTopicCount > 0 && (
              <span className="rounded-md px-2 py-0.5 text-xs text-slate-400">
                +{hiddenTopicCount}
              </span>
            )}
          </div>
        )}
      </div>

      <footer className="mt-auto border-t border-slate-100 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/projects/${project.id}/comments`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {commentCount > 0 ? `${commentCount} comments` : "Comments"}
          </Link>

          {showActions && (
            <div className="flex items-center gap-1.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {user && (
                <button
                  type="button"
                  onClick={handlePinToggle}
                  disabled={pinning || syncing || deleting}
                  title={project.is_pinned ? "Unpin" : "Pin for me"}
                  className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {pinning ? "…" : project.is_pinned ? "Unpin" : "Pin"}
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={syncing || deleting}
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {syncing ? "…" : "Sync"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || syncing}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting ? "…" : "Delete"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {(pinError || syncError || deleteError) && (
          <p className="mt-1.5 text-xs text-red-600">
            {pinError || syncError || deleteError}
          </p>
        )}
      </footer>
    </article>
  );
}
