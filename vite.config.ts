import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // Determine base path:
  // - GitHub Pages needs '/phoenix-tattoz-github/'
  // - Vercel and local dev need '/'
  const isGitHubPages = Boolean(
    (process.env.GITHUB_ACTIONS === 'true' && !process.env.VERCEL) ||
    process.env.BUILD_FOR_GH === 'true' ||
    process.env.VITE_BASE_GH === 'true'
  );
  const base = isGitHubPages ? '/phoenix-tattoz-github/' : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
