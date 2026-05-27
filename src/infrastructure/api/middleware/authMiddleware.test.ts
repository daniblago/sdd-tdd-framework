import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authMiddleware, architectOnly } from './authMiddleware.js';
import { resetEnvForTests } from '../../config/env.js';

const TEST_SECRET = 'test-secret-with-at-least-32-chars-yes';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/auth', authMiddleware, (req, res) => res.status(200).json({ user: (req as any).user }));
  app.get('/architect', authMiddleware, architectOnly, (_req, res) => res.status(200).json({ ok: true }));
  return app;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    (process.env as Record<string, string | undefined>).JWT_SECRET = TEST_SECRET;
    resetEnvForTests();
  });

  it('401 sin Authorization header', async () => {
    const res = await request(buildApp()).get('/auth');
    expect(res.status).toBe(401);
  });

  it('401 con header que no empieza con "Bearer "', async () => {
    const res = await request(buildApp()).get('/auth').set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });

  it('401 si el token no es válido', async () => {
    const res = await request(buildApp()).get('/auth').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });

  it('401 si el token está firmado con otro secreto', async () => {
    const other = jwt.sign({ username: 'x', role: 'ARCHITECT' }, 'a-different-but-long-enough-secret-aaaa');
    const res = await request(buildApp()).get('/auth').set('Authorization', `Bearer ${other}`);
    expect(res.status).toBe(401);
  });

  it('NO acepta token en query string (regresión)', async () => {
    const token = jwt.sign({ username: 'x', role: 'ARCHITECT' }, TEST_SECRET);
    const res = await request(buildApp()).get(`/auth?token=${token}`);
    expect(res.status).toBe(401);
  });

  it('200 con Bearer válido; expone req.user', async () => {
    const token = jwt.sign({ username: 'admin', role: 'ARCHITECT' }, TEST_SECRET);
    const res = await request(buildApp()).get('/auth').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('admin');
    expect(res.body.user.role).toBe('ARCHITECT');
  });
});

describe('architectOnly', () => {
  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    (process.env as Record<string, string | undefined>).JWT_SECRET = TEST_SECRET;
    resetEnvForTests();
  });

  it('403 si el rol no es ARCHITECT', async () => {
    const token = jwt.sign({ username: 'dev', role: 'DEVELOPER' }, TEST_SECRET);
    const res = await request(buildApp()).get('/architect').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('200 si el rol es ARCHITECT', async () => {
    const token = jwt.sign({ username: 'admin', role: 'ARCHITECT' }, TEST_SECRET);
    const res = await request(buildApp()).get('/architect').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
