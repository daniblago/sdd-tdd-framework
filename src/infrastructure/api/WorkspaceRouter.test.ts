import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { workspaceRouter } from './WorkspaceRouter.js';
import * as fs from 'fs/promises';

// Evitamos que los tests modifiquen el disco físico en la integración
vi.mock('fs/promises');

describe('WorkspaceRouter - /api/workspace/artifact', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/workspace', workspaceRouter);
    vi.clearAllMocks();
  });

  it('debería retornar 200 y llamar fs.writeFile si el payload es válido', async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined as any);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    const payload = {
      relativePath: 'specs/test.md',
      content: '# Test'
    };

    const res = await request(app).post('/api/workspace/artifact').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Artefacto guardado exitosamente');
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.mkdir).toHaveBeenCalledTimes(1);
  });

  it('debería retornar 400 de validación de Zod si falta relativePath', async () => {
    const payload = {
      content: '# Test'
    };

    const res = await request(app).post('/api/workspace/artifact').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validación fallida');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
