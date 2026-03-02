import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/nursing-research-gemini/',
  server: {
    port: 5173,
    open: false
  }
});
