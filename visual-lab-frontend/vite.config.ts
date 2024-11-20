import fs from "fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const server = (() => {
    switch (process.env.NODE_ENV) {
      case "production":
        return { host: "0.0.0.0" };
      case "development":
      default:
        return {
          host: "0.0.0.0",
          https: {
            key: fs.readFileSync("./lvh.me-key.pem"),
            cert: fs.readFileSync("./lvh.me.pem"),
          },
        };
    }
  })();

  return {
    server,
    define: {
      "process.env.VITE_API_BASE": JSON.stringify(env.VITE_API_BASE),
      "process.env.VITE_API_KEY": JSON.stringify(env.VITE_API_KEY),
    },
    plugins: [TanStackRouterVite({}), react()],
  };
});
