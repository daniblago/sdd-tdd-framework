import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadEnv } from './env.js';

const e = process.env as Record<string, string | undefined>;

describe('loadEnv', () => {
  const TRACKED = ['JWT_SECRET', 'PORT', 'NODE_ENV', 'WORKSPACES_DIR', 'BCRYPT_COST', 'GEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'] as const;
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of TRACKED) {
      snapshot[k] = e[k];
      delete e[k];
    }
  });

  afterEach(() => {
    for (const k of TRACKED) {
      if (snapshot[k] === undefined) delete e[k];
      else e[k] = snapshot[k];
    }
    vi.restoreAllMocks();
  });

  it('rechaza arrancar en producción sin JWT_SECRET', () => {
    e.NODE_ENV = 'production';
    expect(() => loadEnv()).toThrow(/JWT_SECRET/);
  });

  it('rechaza JWT_SECRET menor a 32 caracteres en producción', () => {
    e.NODE_ENV = 'production';
    e.JWT_SECRET = 'too-short';
    expect(() => loadEnv()).toThrow(/JWT_SECRET.*32/);
  });

  it('en desarrollo genera un secreto en memoria y emite warning si falta JWT_SECRET', () => {
    e.NODE_ENV = 'development';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = loadEnv();
    expect(env.jwtSecret).toHaveLength(64);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/JWT_SECRET/));
  });

  it('respeta JWT_SECRET cuando está presente', () => {
    e.NODE_ENV = 'production';
    e.JWT_SECRET = 'a'.repeat(40);
    const env = loadEnv();
    expect(env.jwtSecret).toBe('a'.repeat(40));
  });

  it('aplica valores por defecto para PORT y WORKSPACES_DIR', () => {
    e.NODE_ENV = 'development';
    const env = loadEnv();
    expect(env.port).toBe(3000);
    expect(env.workspacesDir).toContain('workspaces');
  });

  it('parsea PORT a número y rechaza valores no numéricos', () => {
    e.NODE_ENV = 'development';
    e.PORT = '4040';
    expect(loadEnv().port).toBe(4040);
    e.PORT = 'not-a-port';
    expect(() => loadEnv()).toThrow();
  });

  it('expone las API keys de IA cuando están presentes', () => {
    e.NODE_ENV = 'development';
    e.GEMINI_API_KEY = 'g-key';
    e.OPENAI_API_KEY = 'o-key';
    e.ANTHROPIC_API_KEY = 'a-key';
    const env = loadEnv();
    expect(env.aiKeys).toEqual({ gemini: 'g-key', openai: 'o-key', anthropic: 'a-key' });
  });

  it('isProduction refleja NODE_ENV', () => {
    e.NODE_ENV = 'production';
    e.JWT_SECRET = 'a'.repeat(40);
    expect(loadEnv().isProduction).toBe(true);
    e.NODE_ENV = 'development';
    delete e.JWT_SECRET;
    expect(loadEnv().isProduction).toBe(false);
  });

  it('aplica BCRYPT_COST por defecto y rechaza valores fuera de rango', () => {
    e.NODE_ENV = 'development';
    expect(loadEnv().bcryptCost).toBe(12);
    e.BCRYPT_COST = '14';
    expect(loadEnv().bcryptCost).toBe(14);
    e.BCRYPT_COST = '3';
    expect(() => loadEnv()).toThrow(/BCRYPT_COST/);
  });
});
