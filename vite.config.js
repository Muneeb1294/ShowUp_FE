import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (mode === "development" && !env.VITE_API_URL?.trim()) {
    throw new Error(
      "VITE_API_URL is required in .env for local dev (e.g. http://localhost:4000)."
    );
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
