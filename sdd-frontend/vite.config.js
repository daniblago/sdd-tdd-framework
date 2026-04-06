import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Plugin personalizado para reemplazar dashboard.js
const localApiPlugin = () => {
  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url || '/', `http://${req.headers.host}`);
          
          if (url.pathname === '/api/document') {
            if (req.method === 'GET') {
              const fileName = url.searchParams.get('file');
              if (!fileName) return next();
              
              // Escribir en la carpeta padre (la raíz del proyecto)
              const filePath = path.resolve(process.cwd(), '../', fileName);
              
              if (fs.existsSync(filePath)) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(fs.readFileSync(filePath, 'utf-8'));
              } else {
                res.writeHead(404);
                res.end('Archivo no encontrado');
              }
              return;
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', () => {
                try {
                  const { filePath: fileName, content } = JSON.parse(body);
                  const absolutePath = path.resolve(process.cwd(), '../', fileName);
                  
                  const dir = path.dirname(absolutePath);
                  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                  
                  fs.writeFileSync(absolutePath, content || '', 'utf-8');
                  res.writeHead(200);
                  res.end('OK');
                } catch (e) {
                  res.writeHead(500);
                  res.end('Error al guardar archivo');
                }
              });
              return;
            }
          }
        } catch (e) {
          console.error("Local API Plugin Error:", e);
        }
        next();
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 3000,
  }
})
