import OwnerAvatar from "./OwnerAvatar.jsx";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function AdminHistoryRow({ project, busy, onDelete }) {
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
      <td className="px-4 py-4">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
            isApproved
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {project.status}
        </span>
        <p className="mt-1 text-xs text-slate-400">{formatDate(reviewedAt)}</p>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        {isApproved ? (
          <span className="text-slate-400">—</span>
        ) : (
          project.rejection_note || (
            <span className="text-slate-400 italic">No reason given</span>
          )
        )}
      </td>
      <td className="px-4 py-4">
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
