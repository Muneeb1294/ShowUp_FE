/** Absolute API origin from VITE_API_URL (protocol required for axios). */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    throw new Error("VITE_API_URL is required in .env");
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw);
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${raw}`.replace(/\/$/, "");
}
