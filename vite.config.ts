import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/images": path.resolve(__dirname, "./src/images"),
      "@/router": path.resolve(__dirname, "./src/router"),
      "@/layout": path.resolve(__dirname, "./src/layout"),
      "@/api": path.resolve(__dirname, "./src/api"),
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/redux": path.resolve(__dirname, "./src/redux"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  server: {
    proxy: {
      "/nominatim": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/nominatim/, ""),
      },
    },
  },
});
