import express from 'express';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'meeting-tracker-api',
        configureServer(server) {
          server.middlewares.use(express.json());
          server.middlewares.use('/api/extract', async (req: any, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }
            try {
              const { text, docTitle } = req.body || {};
              const { extractMeetingData } = await import('./server/extract.ts');
              const result = await extractMeetingData(text, docTitle);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, data: result }));
            } catch (err: any) {
              console.error('Extraction error in API:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message || 'Extraction failed' }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
