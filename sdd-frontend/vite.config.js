import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// El `.env` de la raíz es la única fuente de verdad del puerto del API.
// Leerlo aquí evita que el proxy y el server se desincronicen.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, repoRoot, '')
  const apiPort = rootEnv.PORT || 3000

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true
        }
      }
    }
  }
})