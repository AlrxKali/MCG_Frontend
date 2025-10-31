import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiBase = env.VITE_API_BASE_URL || "http://localhost:8080";
  const url = (p: string) => new URL(p, apiBase).toString();

  return {
    plugins: [react()],
    define: {
      __API_BASE_URL__: JSON.stringify(apiBase)
    },
    server: {
      port: 5173
    }
  };
});
