import { defineConfig } from 'vite';

// One multi-page build: the public app (index.html) and the staff
// workspace (admin.html) deploy together to Firebase Hosting.
export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase';
        }
      }
    },
    chunkSizeWarningLimit: 700
  }
});
