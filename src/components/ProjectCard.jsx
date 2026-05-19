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
    <article className={`card group ${featured ? "card-featured" : ""}`}>
      <div className="card-body">
        <div className="flex items-start gap-3.5">
          <OwnerAvatar
            url={project.owner_avatar_url}
            login={project.owner_login}
            size={featured ? "md" : "sm"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 text-base font-semibold leading-snug text-slate-900 sm:text-[1.05rem]">
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-indigo-600"
                >
                  {project.repo_name}
                </a>
              </h3>
              {(project.is_featured || project.is_pinned) && (
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {project.is_featured && (
                    <span className="badge-featured">Featured</span>
                  )}
                  {project.is_pinned && user && (
                    <span className="badge-pinned">Pinned</span>
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
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {project.description}
          </p>
        ) : (
          <p className="mt-4 text-sm italic text-slate-400">No description</p>
        )}

        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {project.language && (
            <li className="badge-muted">
              <span
                className="h-2 w-2 rounded-full bg-indigo-400"
                aria-hidden
              />
              {project.language}
            </li>
          )}
          <li className="badge-muted">
            <span aria-hidden className="text-amber-500">
              ★
            </span>
            {formatStars(project.stars)}
          </li>
          {project.category_name && (
            <li className="badge-outline">{project.category_name}</li>
          )}
        </ul>

        {visibleTopics.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {visibleTopics.map((topic) => (
              <span key={topic} className="tag">
                {topic}
              </span>
            ))}
            {hiddenTopicCount > 0 && (
              <span className="px-2 py-0.5 text-xs text-slate-400">
                +{hiddenTopicCount}
              </span>
            )}
          </div>
        )}
      </div>

      <footer className="card-footer">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/projects/${project.id}/comments`}
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            {commentCount > 0
              ? `${commentCount} comment${commentCount === 1 ? "" : "s"}`
              : "Leave a comment"}
          </Link>

          {showActions && (
            <div className="flex items-center gap-1">
              {user && (
                <button
                  type="button"
                  onClick={handlePinToggle}
                  disabled={pinning || syncing || deleting}
                  title={project.is_pinned ? "Unpin" : "Pin for me"}
                  className="btn-ghost btn-sm"
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
                    className="btn-ghost btn-sm"
                  >
                    {syncing ? "…" : "Sync"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || syncing}
                    className="btn-danger btn-sm"
                  >
                    {deleting ? "…" : "Delete"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {(pinError || syncError || deleteError) && (
          <p className="mt-2 text-xs text-red-600">
            {pinError || syncError || deleteError}
          </p>
        )}
      </footer>
    </article>
  );
}
