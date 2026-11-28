import { fileURLToPath } from 'node:url'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'

const frontendRoot = fileURLToPath(new URL('.', import.meta.url))
const apiTarget = process.env.PRESIDENT_API_TARGET || 'http://127.0.0.1:8080'
const dataFiles = [
  'presidency-scores.stage-2.json',
  'presidency-assessments.stage-2.json',
  'historical-events.stage-1.json',
].map((name) => fileURLToPath(new URL(`../data/${name}`, import.meta.url)))

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': apiTarget,
      '/ws/presence': { target: apiTarget, ws: true },
    },
    fs: { allow: [searchForWorkspaceRoot(frontendRoot), ...dataFiles] },
    watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
  },
})
