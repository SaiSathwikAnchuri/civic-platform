import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",   // ✅ force IPv4 (fixes ::1 issue)
    port: 5173,          // ✅ change from 3000
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
      },
    },
  },
});