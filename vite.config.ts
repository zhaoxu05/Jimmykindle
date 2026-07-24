import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function kindleLegacyScriptPlugin(): Plugin {
  return {
    name: 'kindle-legacy-script-plugin',
    apply: 'build',
    transformIndexHtml(html: string) {
      // Remove type="module" and crossorigin in built bundle so Kindle Experimental Browser executes the JS file without ES module syntax errors
      return html
        .replace(/type="module"\s*/g, 'defer ')
        .replace(/crossorigin\s*/g, '');
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      kindleLegacyScriptPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: ['es2015', 'chrome60', 'safari11'],
      cssTarget: ['chrome49', 'safari9'],
      modulePreload: false,
    },
    esbuild: {
      target: 'es2015',
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
