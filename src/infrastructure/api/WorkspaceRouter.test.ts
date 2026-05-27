import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import jwt from 'jsonwebtoken';
import { createWorkspaceRouter, resetWorkspaceForTests } from './WorkspaceRouter.js';
import { resetEnvForTests } from '../config/env.js';

const TEST_SECRET = 'test-secret-with-32-chars-minimum-yes';
let tempDir: string;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/workspace', createWorkspaceRouter());
  return app;
};

const architectToken = () => jwt.sign({ username: 'admin', role: 'ARCHITECT' }, TEST_SECRET, { expiresIn: '1h' });
const developerToken = () => jwt.sign({ username: 'dev', role: 'DEVELOPER' }, TEST_SECRET, { expiresIn: '1h' });

describe('WorkspaceRouter', () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdd-ws-'));
    const e = process.env as Record<string, string | undefined>;
    e.NODE_ENV = 'test';
    e.JWT_SECRET = TEST_SECRET;
    e.BCRYPT_COST = '10';
    e.WORKSPACES_DIR = tempDir;
    resetEnvForTests();
    resetWorkspaceForTests();
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    delete (process.env as Record<string, string | undefined>).WORKSPACES_DIR;
    vi.restoreAllMocks();
  });

  describe('authentication', () => {
    it('rechaza 401 sin Authorization header', async () => {
      const res = await request(buildApp()).get('/api/workspace/projects');
      expect(res.status).toBe(401);
    });

    it('rechaza 401 con token inválido', async () => {
      const res = await request(buildApp()).get('/api/workspace/projects').set('Authorization', 'Bearer garbage');
      expect(res.status).toBe(401);
    });

    it('no acepta token vía query string (regresión)', async () => {
      const res = await request(buildApp()).get(`/api/workspace/projects?token=${architectToken()}`);
      expect(res.status).toBe(401);
    });

    it('rechaza 403 a DEVELOPER intentando crear proyecto', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${developerToken()}`)
        .send({ projectName: 'demo' });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /projects', () => {
    it('crea un proyecto y siembra las 10 plantillas', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
      expect(res.status).toBe(200);
      const docs = await fs.readdir(path.join(tempDir, 'demo', 'docs'));
      expect(docs).toHaveLength(10);
      expect(docs).toContain('01-constitucion.md');
    });

    it('rechaza nombres de proyecto con caracteres prohibidos', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: '../escape' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /artifact', () => {
    beforeEach(async () => {
      await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
    });

    it('guarda un artefacto válido', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/artifact')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo', relativePath: 'docs/01-constitucion.md', content: '# Hello' });
      expect(res.status).toBe(200);
      const stored = await fs.readFile(path.join(tempDir, 'demo', 'docs', '01-constitucion.md'), 'utf8');
      expect(stored).toBe('# Hello');
    });

    it('rechaza path traversal con segmentos ".."', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/artifact')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo', relativePath: '../escape.md', content: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/traversal/i);
    });

    it('rechaza path absoluto', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/artifact')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo', relativePath: '/etc/passwd', content: 'x' });
      expect(res.status).toBe(400);
    });

    it('rechaza secuencias URL-encoded de traversal', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/artifact')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo', relativePath: '%2e%2e/escape.md', content: 'x' });
      expect(res.status).toBe(400);
    });

    it('rechaza payload sin relativePath con 400', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/artifact')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo', content: 'x' });
      expect(res.status).toBe(400);
    });

    it('rechaza al DEVELOPER (solo ARCHITECT puede guardar)', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/artifact')
        .set('Authorization', `Bearer ${developerToken()}`)
        .send({ projectName: 'demo', relativePath: 'docs/01-constitucion.md', content: 'x' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /artifact', () => {
    beforeEach(async () => {
      await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
    });

    it('devuelve el contenido si el artefacto existe', async () => {
      const res = await request(buildApp())
        .get('/api/workspace/artifact')
        .query({ projectName: 'demo', relativePath: 'docs/01-constitucion.md' })
        .set('Authorization', `Bearer ${architectToken()}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Constitución');
    });

    it('rechaza traversal en query', async () => {
      const res = await request(buildApp())
        .get('/api/workspace/artifact')
        .query({ projectName: 'demo', relativePath: '../../../etc/passwd' })
        .set('Authorization', `Bearer ${architectToken()}`);
      expect(res.status).toBe(400);
    });

    it('devuelve 404 si el artefacto no existe', async () => {
      const res = await request(buildApp())
        .get('/api/workspace/artifact')
        .query({ projectName: 'demo', relativePath: 'docs/no-existe.md' })
        .set('Authorization', `Bearer ${architectToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Sealing', () => {
    beforeEach(async () => {
      await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
    });

    it('inicialmente reporta isSealed=false', async () => {
      const res = await request(buildApp())
        .get('/api/workspace/seal').query({ projectName: 'demo' })
        .set('Authorization', `Bearer ${architectToken()}`);
      expect(res.body.isSealed).toBe(false);
    });

    it('sella y luego reporta isSealed=true', async () => {
      await request(buildApp())
        .post('/api/workspace/seal')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
      const res = await request(buildApp())
        .get('/api/workspace/seal').query({ projectName: 'demo' })
        .set('Authorization', `Bearer ${architectToken()}`);
      expect(res.body.isSealed).toBe(true);
    });

    it('rompe el sello al DELETE', async () => {
      await request(buildApp())
        .post('/api/workspace/seal')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
      await request(buildApp())
        .delete('/api/workspace/seal/demo')
        .set('Authorization', `Bearer ${architectToken()}`);
      const res = await request(buildApp())
        .get('/api/workspace/seal').query({ projectName: 'demo' })
        .set('Authorization', `Bearer ${architectToken()}`);
      expect(res.body.isSealed).toBe(false);
    });
  });

  describe('Download flow (ticket de un solo uso)', () => {
    beforeEach(async () => {
      await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
    });

    it('rechaza /download sin ticket', async () => {
      const res = await request(buildApp()).get('/api/workspace/download/demo');
      expect(res.status).toBe(401);
    });

    it('emite ticket y permite descarga; segundo uso falla', async () => {
      const issue = await request(buildApp())
        .post('/api/workspace/download-ticket')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
      expect(issue.status).toBe(200);
      const ticket = issue.body.ticket;
      expect(typeof ticket).toBe('string');

      const first = await request(buildApp()).get(`/api/workspace/download/demo?ticket=${encodeURIComponent(ticket)}`);
      expect(first.status).toBe(200);
      expect(first.headers['content-type']).toBe('application/zip');

      const second = await request(buildApp()).get(`/api/workspace/download/demo?ticket=${encodeURIComponent(ticket)}`);
      expect(second.status).toBe(401);
    });

    it('rechaza ticket emitido para otro proyecto', async () => {
      await request(buildApp())
        .post('/api/workspace/projects')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'other' });

      const issue = await request(buildApp())
        .post('/api/workspace/download-ticket')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'demo' });
      const res = await request(buildApp()).get(`/api/workspace/download/other?ticket=${encodeURIComponent(issue.body.ticket)}`);
      expect(res.status).toBe(401);
    });

    it('404 al pedir ticket para proyecto inexistente', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/download-ticket')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ projectName: 'no-existe' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /ai-status', () => {
    it('reporta presencia de claves del servidor', async () => {
      const res = await request(buildApp()).get('/api/workspace/ai-status');
      expect(res.status).toBe(200);
      expect(res.body.serverHasKey).toEqual({
        gemini: false, openai: false, anthropic: false
      });
    });
  });

  describe('POST /ai-draft', () => {
    it('400 si no hay API key disponible (ni en server ni en body)', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ provider: 'openai', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/OPENAI/);
    });

    it('403 si DEVELOPER intenta usar ai-draft', async () => {
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${developerToken()}`)
        .send({ provider: 'openai', apiKey: 'sk-x', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(403);
    });

    it('proxy OpenAI: extrae el texto de la respuesta', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'Hola desde OpenAI' } }] })
      } as any);
      vi.stubGlobal('fetch', fetchMock);
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ provider: 'openai', apiKey: 'sk-x', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(200);
      expect(res.body.text).toBe('Hola desde OpenAI');
      expect(fetchMock).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', expect.any(Object));
    });

    it('proxy Anthropic: extrae el texto del primer bloque', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ content: [{ text: 'Hola desde Claude' }] })
      } as any);
      vi.stubGlobal('fetch', fetchMock);
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ provider: 'anthropic', apiKey: 'sk-ant-x', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(200);
      expect(res.body.text).toBe('Hola desde Claude');
    });

    it('proxy Gemini: extrae el texto del primer candidato', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Hola desde Gemini' }] } }] })
      } as any);
      vi.stubGlobal('fetch', fetchMock);
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ provider: 'gemini', apiKey: 'AIza-x', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(200);
      expect(res.body.text).toBe('Hola desde Gemini');
    });

    it('propaga el status del proveedor cuando falla', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'invalid api key' })
      } as any);
      vi.stubGlobal('fetch', fetchMock);
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ provider: 'openai', apiKey: 'sk-bad', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(401);
    });

    it('500 si fetch lanza una excepción', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));
      const res = await request(buildApp())
        .post('/api/workspace/ai-draft')
        .set('Authorization', `Bearer ${architectToken()}`)
        .send({ provider: 'openai', apiKey: 'sk-x', systemPrompt: 's', userPrompt: 'u' });
      expect(res.status).toBe(500);
    });
  });
});
