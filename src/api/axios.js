import axios from "axios";
import { getToken, clearToken } from "../lib/authStorage.js";
import { getApiBaseUrl } from "../lib/apiBaseUrl.js";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
}

export default api;
