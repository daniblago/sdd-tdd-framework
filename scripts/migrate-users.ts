#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';
import { MigrateUsersUseCase, type StoredUserRecord } from '../src/application/usecases/MigrateUsersUseCase.js';
import { BcryptHasher } from '../src/infrastructure/security/BcryptHasher.js';
import { loadEnv } from '../src/infrastructure/config/env.js';

const USERS_FILE = path.join(process.cwd(), 'users.json');
const BACKUP_FILE = path.join(process.cwd(), 'users.json.bak');

async function main(): Promise<void> {
  let raw: string;
  try {
    raw = await fs.readFile(USERS_FILE, 'utf8');
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('[migrate-users] No existe users.json; nada que migrar.');
      return;
    }
    throw err;
  }

  let parsed: StoredUserRecord[];
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`users.json no es JSON válido: ${(e as Error).message}`);
  }

  const env = loadEnv();
  const useCase = new MigrateUsersUseCase(new BcryptHasher(env.bcryptCost));
  const result = await useCase.execute(parsed);

  console.log(`[migrate-users] total=${result.total}, hasheados ahora=${result.migrated}, ya estaban=${result.alreadyHashed}`);

  if (result.migrated === 0) {
    console.log('[migrate-users] Nada que escribir. users.json ya está al día.');
    return;
  }

  await fs.writeFile(BACKUP_FILE, raw, 'utf8');
  await fs.writeFile(USERS_FILE, JSON.stringify(result.users, null, 2) + '\n', 'utf8');
  console.log(`[migrate-users] Backup escrito en ${BACKUP_FILE}`);
  console.log(`[migrate-users] users.json actualizado. Borra el .bak cuando hayas verificado el login.`);
}

main().catch(err => {
  console.error('[migrate-users] ERROR:', err.message);
  process.exit(1);
});
