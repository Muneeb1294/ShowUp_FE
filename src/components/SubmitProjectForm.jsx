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
    <div className="panel-padded">
      {success && (
        <div role="status" className="alert-success mb-6">
          <p className="font-semibold">Submitted successfully</p>
          <div className="mt-3 flex items-center gap-3">
            <OwnerAvatar
              url={success.ownerAvatarUrl}
              login={success.ownerLogin}
              size="md"
            />
            <p className="text-sm leading-relaxed">
              <strong className="text-slate-900">{success.repoName}</strong>
              {success.ownerLogin && (
                <span className="text-slate-600"> · @{success.ownerLogin}</span>
              )}
              <span className="mt-1 block text-slate-600">{success.message}</span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="alert-error mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="field-label">GitHub URL</span>
          <input
            type="url"
            required
            disabled={disabled}
            placeholder="https://github.com/owner/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="field-label">Category</span>
          <select
            required
            disabled={disabled}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select"
          >
            {categoriesLoading && (
              <option value="">Loading categories…</option>
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
          <span className="field-label">
            Note <span className="field-hint">(optional)</span>
          </span>
          <textarea
            disabled={disabled}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Why should this project be featured?"
            className="textarea"
          />
        </label>

        <button type="submit" disabled={disabled} className="btn-primary w-full">
          {submitting && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
          )}
          {submitting
            ? "Submitting…"
            : categoriesLoading
              ? "Loading…"
              : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
