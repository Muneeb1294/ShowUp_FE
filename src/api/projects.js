import api, { getErrorMessage } from "./axios.js";

export async function fetchProjectById(id) {
  const { data } = await api.get(`/api/v1/projects/${id}`);
  if (!data.success) throw new Error(data.message || "Failed to load project");
  return data.project;
}

export async function fetchProjects({ page = 1, category, sort, search } = {}) {
  const params = { page };
  if (category) params.category = category;
  if (sort) params.sort = sort;
  if (search) params.search = search;
  const { data } = await api.get("/api/v1/projects", { params });
  if (!data.success) throw new Error(data.message || "Failed to load projects");
  return data;
}

export async function fetchFeaturedProjects({ category, search } = {}) {
  const params = {};
  if (category) params.category = category;
  if (search) params.search = search;
  const { data } = await api.get("/api/v1/projects/featured", { params });
  if (!data.success) throw new Error(data.message || "Failed to load featured");
  return data.projects;
}

export async function fetchPendingProjects(page = 1) {
  const { data } = await api.get("/api/v1/projects/pending", { params: { page } });
  if (!data.success) throw new Error(data.message || "Failed to load pending");
  return data;
}

export async function fetchReviewedProjects({ page = 1, status } = {}) {
  const params = { page };
  if (status) params.status = status;
  const { data } = await api.get("/api/v1/projects/reviewed", { params });
  if (!data.success) throw new Error(data.message || "Failed to load history");
  return data;
}

export async function submitProject({ githubUrl, category, note }) {
  const { data } = await api.post("/api/v1/projects", {
    githubUrl,
    category,
    note,
  });
  if (!data.success) throw new Error(data.message || "Submission failed");
  return data.project;
}

export async function approveProject(id) {
  const { data } = await api.patch(`/api/v1/projects/${id}/approve`);
  if (!data.success) throw new Error(data.message || "Approve failed");
  return data.project;
}

export async function rejectProject(id, rejectionNote) {
  const { data } = await api.patch(`/api/v1/projects/${id}/reject`, {
    rejectionNote,
  });
  if (!data.success) throw new Error(data.message || "Reject failed");
  return data.project;
}

export async function setProjectFeatured(id, featured) {
  const { data } = await api.patch(`/api/v1/projects/${id}/feature`, {
    featured,
  });
  if (!data.success) throw new Error(data.message || "Update feature failed");
  return data.project;
}

export async function syncProject(id) {
  const { data } = await api.patch(`/api/v1/projects/${id}/sync`);
  if (!data.success) throw new Error(data.message || "Sync failed");
  return data.project;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/api/v1/projects/${id}`);
  if (!data.success) throw new Error(data.message || "Delete failed");
  return data;
}

export async function fetchMyPinnedProjects() {
  const { data } = await api.get("/api/v1/projects/pinned", { params: { page: 1 } });
  if (!data.success) throw new Error(data.message || "Failed to load pinned");
  return data.projects;
}

export async function pinProject(id) {
  const { data } = await api.post(`/api/v1/projects/${id}/pin`);
  if (!data.success) throw new Error(data.message || "Pin failed");
  return data;
}

export async function unpinProject(id) {
  const { data } = await api.delete(`/api/v1/projects/${id}/pin`);
  if (!data.success) throw new Error(data.message || "Unpin failed");
  return data;
}

export { getErrorMessage };
