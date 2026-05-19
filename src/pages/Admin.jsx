import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AdminRoute from "../components/AdminRoute.jsx";
import AdminPendingRow from "../components/AdminPendingRow.jsx";
import AdminHistoryRow from "../components/AdminHistoryRow.jsx";
import {
  fetchPendingProjects,
  fetchReviewedProjects,
  approveProject,
  rejectProject,
  setProjectFeatured,
  deleteProject,
  getErrorMessage,
} from "../api/projects.js";

const TABS = [
  { id: "pending", label: "Pending review" },
  { id: "history", label: "Review history" },
];

function AdminPendingPanel() {
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
          p.id === id ? { ...p, ...project, status: "approved" } : p,
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
          {projects.length} pending submission{projects.length === 1 ? "" : "s"}
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

function AdminHistoryPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  async function load(nextPage = page, filter = statusFilter) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReviewedProjects({
        page: nextPage,
        status: filter || undefined,
      });
      setProjects(data.projects);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalProjects: data.totalProjects,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page, statusFilter);
  }, [page, statusFilter]);

  function handleFilterChange(value) {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleDelete(id) {
    setActionId(id);
    setError("");
    try {
      await deleteProject(id);
      setProjects((list) => list.filter((p) => p.id !== id));
      if (pagination) {
        setPagination((p) => ({
          ...p,
          totalProjects: Math.max(0, (p.totalProjects ?? 1) - 1),
        }));
      }
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
      setProjects((list) =>
        list.map((p) =>
          p.id === id ? { ...p, is_featured: project.is_featured } : p,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  if (loading && projects.length === 0) {
    return <p className="text-slate-500">Loading review history...</p>;
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="history-status" className="text-sm text-slate-600">
            Filter:
          </label>
          <select
            id="history-status"
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="">All decisions</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => load(page, statusFilter)}
          className="text-sm text-indigo-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      <p className="text-sm text-slate-600">
        {pagination?.totalProjects ?? projects.length} reviewed project
        {(pagination?.totalProjects ?? projects.length) === 1 ? "" : "s"}
      </p>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No reviewed projects yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitter</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <AdminHistoryRow
                  key={project.id}
                  project={project}
                  busy={actionId === project.id}
                  onDelete={handleDelete}
                  onToggleFeature={handleToggleFeature}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={!pagination.hasPrevPage || loading}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNextPage || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState("pending");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pending" ? <AdminPendingPanel /> : <AdminHistoryPanel />}
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useAuth();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Review Projects</h1>
      <p className="mt-1 text-sm text-slate-600">
        Review submissions, approve or reject with a reason, and browse past
        decisions.
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
