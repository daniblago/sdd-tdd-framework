import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import jwt from 'jsonwebtoken';
import { authRouter, resetAuthForTests } from './AuthRouter.js';
import { resetEnvForTests } from '../config/env.js';

const ORIGINAL_CWD = process.cwd();
let tempDir: string;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
};

describe('AuthRouter /api/auth/login', () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdd-auth-'));
    process.chdir(tempDir);
    const e = process.env as Record<string, string | undefined>;
    e.NODE_ENV = 'test';
    e.JWT_SECRET = 'test-secret-with-32-chars-minimum-yes';
    e.BCRYPT_COST = '10';
    resetEnvForTests();
    resetAuthForTests();
  });

  afterEach(async () => {
    process.chdir(ORIGINAL_CWD);
    await fs.rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('siembra users.json con hashes la primera vez y permite login con defaults', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'architect123' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ username: 'admin', role: 'ARCHITECT' });
    expect(res.body.token).toBeTruthy();

    const stored = JSON.parse(await fs.readFile(path.join(tempDir, 'users.json'), 'utf8'));
    expect(stored[0].password).not.toBe('architect123');
    expect(stored[0].password).toMatch(/^\$2[aby]\$/);
  });

  it('emite un JWT firmado con el secreto configurado', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'architect123' });
    const decoded = jwt.verify(res.body.token, (process.env as any).JWT_SECRET) as any;
    expect(decoded.username).toBe('admin');
    expect(decoded.role).toBe('ARCHITECT');
  });

  it('rechaza credenciales inválidas con 401', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/inválidas/i);
  });

  it('rechaza payload incompleto con 400', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ username: 'admin' });
    expect(res.status).toBe(400);
  });

  it('rechaza tipos no-string en el payload', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/auth/login').send({ username: 123, password: { x: 1 } });
    expect(res.status).toBe(400);
  });
});
