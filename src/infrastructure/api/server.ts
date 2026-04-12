import express from 'express';
import cors from 'cors';
import { workspaceRouter } from './WorkspaceRouter.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Main Health Check (Evita 404 al abrir en el navegador)
app.get('/', (req, res) => {
  res.json({
    name: 'SDD-TDD Orchestrator API',
    status: 'Running',
    version: '1.0.0'
  });
});

// Registro de Rutas
app.use('/api/workspace', workspaceRouter);

// Handler genérico de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke!' });
});

export const server = app.listen(PORT, () => {
  console.log(`============= SDD-TDD Orchestrator =============`);
  console.log(`🚀 API Generador de Artefactos escuchando en puerto ${PORT}`);
  console.log(`===============================================`);
});
