import express from 'express';
import cors from 'cors';
import { env } from '../config/env.js';
import { workspaceRouter } from './WorkspaceRouter.js';
import { authRouter } from './AuthRouter.js';

const config = env();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'SDD-TDD Orchestrator API',
    status: 'Running',
    version: '1.0.0',
    env: config.nodeEnv
  });
});

app.use('/api/workspace', workspaceRouter);
app.use('/api/auth', authRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (!config.isProduction) console.error(err);
  res.status(500).send({ error: 'Internal error' });
});

export const server = app.listen(config.port, () => {
  console.log(`============= SDD-TDD Orchestrator =============`);
  console.log(`API escuchando en puerto ${config.port} (env=${config.nodeEnv})`);
  console.log(`================================================`);
});
