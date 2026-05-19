import OwnerAvatar from "./OwnerAvatar.jsx";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function AdminHistoryRow({
  project,
  busy,
  onDelete,
  onToggleFeature,
}) {
  const isApproved = project.status === "approved";
  const reviewedAt = project.reviewed_at || project.created_at;
  const topics = project.topics?.length ? project.topics : [];

  function handleDelete() {
    if (
      !window.confirm(
        `Delete "${project.repo_name}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    onDelete(project.id);
  }

  return (
    <tr>
      <td>
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
                className="tag"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </td>
      <td>
        {project.category_name || "—"}
      </td>
      <td>
        {project.submitter_name ? (
          <div className="space-y-0.5">
            <div className="font-medium text-slate-800">
              {project.submitter_name}
            </div>
            <div>{project.submitter_email}</div>
          </div>
        ) : (
          <span className="text-slate-400">Unknown</span>
        )}
      </td>
      <td>
        <span
          className={isApproved ? "status-approved" : "status-rejected"}
        >
          {project.status}
        </span>
        <p className="mt-1 text-xs text-slate-400">{formatDate(reviewedAt)}</p>
      </td>
      <td>
        {isApproved ? (
          <span className="text-slate-400">—</span>
        ) : (
          project.rejection_note || (
            <span className="text-slate-400 italic">No reason given</span>
          )
        )}
      </td>
      <td>
        <div className="flex flex-col gap-2">
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
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="btn-secondary btn-sm text-red-700"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
