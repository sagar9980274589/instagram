import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite config
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // Ensure static assets are served from the root
  server: {
    host: '0.0.0.0', // Bind to all interfaces
    port: 5173,
  },
});
