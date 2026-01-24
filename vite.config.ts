import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    rollupOptions: {
      // SillyTavern runtime-only modules (provided under /scripts/* in the host app).
      // They don't exist during bundling, so mark them as external.
      external: (id) => typeof id === 'string' && id.startsWith('/scripts/'),
    },
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'STApiWrapper',
      fileName: 'index',
      formats: ['iife'],
    },
    outDir: './dist',
    emptyOutDir: true,
    minify: false,
  },
});
