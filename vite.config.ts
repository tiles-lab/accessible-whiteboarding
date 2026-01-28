import path from 'path';
import fs from 'fs';
import dns from 'dns';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// make sure vite picks up all html files in root, needed for vite build
const allHtmlEntries = fs
  .readdirSync('.')
  .filter((file) => path.extname(file) === '.html')
  .reduce((acc, file) => {
    acc[path.basename(file, '.html')] = path.resolve(__dirname, file);

    return acc;
  }, {});

// https://vitejs.dev/config/
export default defineConfig({
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
