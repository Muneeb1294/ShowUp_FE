import api, { getErrorMessage } from "./axios.js";
import { getApiBaseUrl } from "../lib/apiBaseUrl.js";

export function getGithubAuthUrl(redirectTo = "/") {
  const base = getApiBaseUrl();
  const params = new URLSearchParams({ redirect: redirectTo });
  return `${base}/api/v1/auth/github?${params}`;
}

export async function adminLogin(email, password) {
  const { data } = await api.post("/api/v1/auth/admin/login", {
    email,
    password,
  });
  if (!data.success) throw new Error(data.message || "Login failed");
  return data;
}

export async function getMe() {
  const { data } = await api.get("/api/v1/auth/me");
  if (!data.success) throw new Error(data.message || "Failed to load user");
  return data.user;
}

export { getErrorMessage };
