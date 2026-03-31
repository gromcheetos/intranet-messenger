import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({
    include: "**/*.{jsx,tsx,js,ts}",
  })],
  base: '/messenger/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/wz/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    global: 'window',
  },

});

