import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function showroomEntry(): Plugin {
  return {
    name: "showroom-html-entry",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          req.url = req.url.replace(/^\/(?:index\.html)?(?=\?|$)/, "/index.dev.html");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [showroomEntry(), react(), tailwindcss()],
  server: { host: "0.0.0.0", port: 3000, allowedHosts: true },
  build: {
    rollupOptions: {
      input: { index: "index.dev.html" },
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const dependency = id.split("/node_modules/")[1];
          if (!dependency) return;
          if (/^(react|react-dom|scheduler)\//.test(dependency)) return "react-runtime";
          if (dependency.startsWith("three/")) return "three-engine";
          if (dependency.startsWith("postprocessing/")) return "postprocessing";
        },
      },
    },
    chunkSizeWarningLimit: 950,
  },
});
