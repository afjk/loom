import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/loomlet/node-editor/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
