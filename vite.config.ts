import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
  },
  // Handle 404s in SPA
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  base: '/',
});
