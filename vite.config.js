import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (!env.VITE_API_URL?.trim()) {
    throw new Error(
      "VITE_API_URL is required. Set it in .env locally or in Vercel project settings before building."
    );
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
