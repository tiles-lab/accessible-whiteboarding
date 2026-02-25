import path from 'path';
import fs from 'fs';
import dns from 'dns';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git']);

// make sure vite picks up all html files in root and modals/, needed for vite build
const collectHtmlEntries = (dir: string, prefix = '') =>
  fs.readdirSync(dir).reduce(
    (acc, file) => {
      if (IGNORED_DIRS.has(file)) return acc;
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        Object.assign(acc, collectHtmlEntries(fullPath, `${prefix}${file}/`));
      } else if (path.extname(file) === '.html') {
        acc[`${prefix}${path.basename(file, '.html')}`] = path.resolve(
          __dirname,
          fullPath
        );
      }
      return acc;
    },
    {} as Record<string, string>
  );

const allHtmlEntries = collectHtmlEntries('.');

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: allHtmlEntries,
    },
  },
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, './data'),
      '@models': path.resolve(__dirname, './src/models'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
