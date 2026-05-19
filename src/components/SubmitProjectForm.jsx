import { useEffect, useState } from "react";
import { fetchCategories } from "../api/categories.js";
import { submitProject, getErrorMessage } from "../api/projects.js";
import OwnerAvatar from "./OwnerAvatar.jsx";

export default function SubmitProjectForm() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [githubUrl, setGithubUrl] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((list) => {
        setCategories(list);
        if (list[0]) setCategory(list[0].id);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setCategoriesLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setSubmitting(true);

    try {
      const project = await submitProject({
        githubUrl: githubUrl.trim(),
        category,
        note: note.trim() || undefined,
      });
      setSuccess({
        repoName: project.repo_name,
        ownerLogin: project.owner_login,
        ownerAvatarUrl: project.owner_avatar_url,
        message: "Your project is queued for admin review.",
      });
      setGithubUrl("");
      setNote("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = submitting || categoriesLoading || !category;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {success && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-900"
        >
          <p className="font-medium">Submitted successfully</p>
          <div className="mt-2 flex items-center gap-3">
            <OwnerAvatar
              url={success.ownerAvatarUrl}
              login={success.ownerLogin}
              size="md"
            />
            <p className="text-sm">
              <strong>{success.repoName}</strong>
              {success.ownerLogin && (
                <span className="text-slate-600"> · @{success.ownerLogin}</span>
              )}
              <span className="mt-0.5 block text-slate-600">{success.message}</span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">GitHub URL</span>
          <input
            type="url"
            required
            disabled={disabled}
            placeholder="https://github.com/owner/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            required
            disabled={disabled}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
          >
            {categoriesLoading && (
              <option value="">Loading categories...</option>
            )}
            {!categoriesLoading && categories.length === 0 && (
              <option value="">No categories available</option>
            )}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Note <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            disabled={disabled}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Why should this project be featured?"
            className="mt-1.5 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>

        <button
          type="submit"
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
          )}
          {submitting
            ? "Submitting..."
            : categoriesLoading
              ? "Loading..."
              : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
