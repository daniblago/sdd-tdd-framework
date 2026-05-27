import { z } from 'zod';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export interface AppEnv {
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  port: number;
  jwtSecret: string;
  workspacesDir: string;
  bcryptCost: number;
  aiKeys: {
    gemini: string | undefined;
    openai: string | undefined;
    anthropic: string | undefined;
  };
}

const Schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1).optional(),
  PORT: z.string().regex(/^\d+$/, 'PORT debe ser numérico').transform(Number).default(3000),
  WORKSPACES_DIR: z.string().default(path.join(process.cwd(), 'workspaces')),
  BCRYPT_COST: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(10).max(14)).default(12),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional()
});

export function loadEnv(): AppEnv {
  const parsed = Schema.safeParse(process.env);
  if (!parsed.success) {
    const messages = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Configuración de entorno inválida → ${messages}`);
  }

  const cfg = parsed.data;
  const isProduction = cfg.NODE_ENV === 'production';

  let jwtSecret = cfg.JWT_SECRET;
  if (!jwtSecret) {
    if (isProduction) {
      throw new Error('JWT_SECRET es obligatorio en producción. Defínelo en variables de entorno.');
    }
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[env] JWT_SECRET no definido; usando secreto efímero en desarrollo. Las sesiones se invalidan al reiniciar.');
  } else if (isProduction && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción.');
  }

  return {
    nodeEnv: cfg.NODE_ENV,
    isProduction,
    port: cfg.PORT,
    jwtSecret,
    workspacesDir: cfg.WORKSPACES_DIR,
    bcryptCost: cfg.BCRYPT_COST,
    aiKeys: {
      gemini: cfg.GEMINI_API_KEY,
      openai: cfg.OPENAI_API_KEY,
      anthropic: cfg.ANTHROPIC_API_KEY
    }
  };
}

let cached: AppEnv | undefined;
export function env(): AppEnv {
  if (!cached) cached = loadEnv();
  return cached;
}

export function resetEnvForTests(): void {
  cached = undefined;
}
