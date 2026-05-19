import { useState } from "react";
import OwnerAvatar from "./OwnerAvatar.jsx";

export default function AdminPendingRow({
  project,
  busy,
  onApprove,
  onReject,
  onToggleFeature,
}) {
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  const isApproved = project.status === "approved";
  const isPending = project.status === "pending";
  const topics = project.topics?.length ? project.topics : [];

  async function confirmReject() {
    await onReject(project.id, rejectNote.trim());
    setShowReject(false);
    setRejectNote("");
  }

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="px-4 py-4">
        <div className="flex items-start gap-3">
          <OwnerAvatar
            url={project.owner_avatar_url}
            login={project.owner_login}
            size="sm"
          />
          <div className="min-w-0">
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:underline"
            >
              {project.repo_name}
            </a>
            {project.owner_login && (
              <p className="text-xs text-slate-500">@{project.owner_login}</p>
            )}
          </div>
        </div>
        {project.description && (
          <p className="mt-1 max-w-md text-sm text-slate-600">
            {project.description}
          </p>
        )}
        {topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {topics.map((t) => (
              <span
                key={t}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        {project.category_name || "—"}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        <div>{project.language || "—"}</div>
        <div className="text-slate-400">★ {project.stars ?? 0}</div>
        {project.last_commit && (
          <div className="text-xs text-slate-400">
            {new Date(project.last_commit).toLocaleDateString()}
          </div>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        {project.submitter_name ? (
          <div className="space-y-0.5">
            <div className="font-medium text-slate-800">{project.submitter_name}</div>
            <div>{project.submitter_email}</div>
            <div className="text-xs text-slate-400">
              {project.submitter_role}
              {project.submitter_joined_at &&
                ` · joined ${new Date(project.submitter_joined_at).toLocaleDateString()}`}
            </div>
          </div>
        ) : (
          <span className="text-slate-400">Unknown</span>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        {project.submitter_note || (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
            isApproved
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {project.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          {isPending && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onApprove(project.id)}
                className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowReject((v) => !v)}
                className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}

          {isApproved && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!project.is_featured}
                disabled={busy}
                onChange={() =>
                  onToggleFeature(project.id, !project.is_featured)
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-slate-700">Featured</span>
            </label>
          )}

          {showReject && isPending && (
            <div className="mt-1 space-y-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={2}
                placeholder="Rejection note (optional)"
                className="w-full min-w-[140px] rounded border border-slate-300 px-2 py-1 text-xs"
              />
              <button
                type="button"
                disabled={busy}
                onClick={confirmReject}
                className="w-full rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Confirm reject
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
