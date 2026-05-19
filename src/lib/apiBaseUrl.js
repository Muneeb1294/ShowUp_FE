/** API origin from VITE_API_URL (.env locally, .env.production on Vercel). */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "VITE_API_URL is missing. Use .env for local dev or .env.production for deploys."
    );
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw);
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${raw}`.replace(/\/$/, "");
}
