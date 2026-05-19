import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AdminRoute from "../components/AdminRoute.jsx";
import AdminPendingRow from "../components/AdminPendingRow.jsx";
import {
  fetchPendingProjects,
  approveProject,
  rejectProject,
  setProjectFeatured,
  getErrorMessage,
} from "../api/projects.js";

function AdminPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPendingProjects();
      setProjects(data.projects);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateProject(id, patch) {
    setProjects((list) =>
      list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  async function handleApprove(id) {
    setActionId(id);
    setError("");
    try {
      const project = await approveProject(id);
      setProjects((list) =>
        list.map((p) =>
          p.id === id
            ? { ...p, ...project, status: "approved" }
            : p,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id, rejectionNote) {
    setActionId(id);
    setError("");
    try {
      await rejectProject(id, rejectionNote);
      setProjects((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleToggleFeature(id, featured) {
    setActionId(id);
    setError("");
    try {
      const project = await setProjectFeatured(id, featured);
      updateProject(id, { is_featured: project.is_featured });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  const pendingCount = projects.filter((p) => p.status === "pending").length;

  if (loading) {
    return <p className="text-slate-500">Loading pending projects...</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {pendingCount} pending · {projects.length} total in queue
        </p>
        <button
          type="button"
          onClick={load}
          className="text-sm text-indigo-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No pending projects.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[960px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Meta</th>
                <th className="px-4 py-3">Submitter</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <AdminPendingRow
                  key={project.id}
                  project={project}
                  busy={actionId === project.id}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onToggleFeature={handleToggleFeature}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useAuth();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Review Projects</h1>
      <p className="mt-1 text-sm text-slate-600">
        Review submissions, approve or reject, then mark approved projects as
        featured.
      </p>

      {loading && <p className="mt-4 text-slate-500">Loading...</p>}

      {!loading && !user && (
        <Navigate to="/admin/login" replace state={{ redirectTo: "/admin" }} />
      )}

      {!loading && user && (
        <AdminRoute>
          <div className="mt-6">
            <AdminPanel />
          </div>
        </AdminRoute>
      )}
    </main>
  );
}
