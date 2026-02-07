import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: ".",
  build: {
    outDir: "dist/editor",
  },
  server: {
    port: 3001,
    open: "/editor.html",
  },
});
