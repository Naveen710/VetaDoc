import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist-admin',
    sourcemap: false,
    rollupOptions: {
      input: {
        admin: 'admin.html'
      }
    }
  }
});
