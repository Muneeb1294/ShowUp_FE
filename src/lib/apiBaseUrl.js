/** API origin: VITE_API_URL in dev; same-origin /api on Vercel (proxied to Railway). */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (raw) {
    if (/^https?:\/\//i.test(raw)) {
      return raw.replace(/\/$/, "");
    }
    const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw);
    const protocol = isLocal ? "http" : "https";
    return `${protocol}://${raw}`.replace(/\/$/, "");
  }
  if (import.meta.env.PROD) {
    return "";
  }
  throw new Error(
    "VITE_API_URL is required in .env for local development (e.g. http://localhost:4000)"
  );
}
