import api, { getErrorMessage } from "./axios.js";

export async function fetchProjectComments(projectId, page = 1) {
  const { data } = await api.get(`/api/v1/projects/${projectId}/comments`, {
    params: { page },
  });
  if (!data.success) throw new Error(data.message || "Failed to load comments");
  return data;
}

export async function createProjectComment(projectId, body) {
  const { data } = await api.post(`/api/v1/projects/${projectId}/comments`, {
    body,
  });
  if (!data.success) throw new Error(data.message || "Failed to post comment");
  return data.comment;
}

export async function deleteProjectComment(projectId, commentId) {
  const { data } = await api.delete(
    `/api/v1/projects/${projectId}/comments/${commentId}`,
  );
  if (!data.success) throw new Error(data.message || "Failed to delete comment");
  return data;
}

export { getErrorMessage };
