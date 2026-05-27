import { promises as fs } from 'fs';
import path from 'path';
import type { UserRepository } from '../../domain/security/UserRepository.js';
import type { PasswordHasher } from '../../domain/security/PasswordHasher.js';
import type { StoredUserRecord } from '../../application/usecases/MigrateUsersUseCase.js';

const DEFAULT_USERS_PLAIN: Array<{ username: string; password: string; role: 'ARCHITECT' | 'DEVELOPER' }> = [
  { username: 'admin', password: 'architect123', role: 'ARCHITECT' },
  { username: 'dev', password: 'dev123', role: 'DEVELOPER' }
];

export class JsonUserRepository implements UserRepository {
  constructor(
    private readonly filePath: string,
    private readonly hasher: PasswordHasher
  ) {}

  async findByUsername(username: string): Promise<StoredUserRecord | null> {
    const users = await this.load();
    return users.find(u => u.username === username) ?? null;
  }

  private async load(): Promise<StoredUserRecord[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        const seeded = await this.seedDefaults();
        return seeded;
      }
      throw err;
    }
  }

  private async seedDefaults(): Promise<StoredUserRecord[]> {
    const hashed: StoredUserRecord[] = [];
    for (const u of DEFAULT_USERS_PLAIN) {
      hashed.push({ username: u.username, role: u.role, password: await this.hasher.hash(u.password) });
    }
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(hashed, null, 2) + '\n', 'utf8');
    console.warn(`[auth] users.json no existía — sembrado con usuarios por defecto hasheados en ${this.filePath}. Cambia las contraseñas antes de exponer este entorno.`);
    return hashed;
  }
}
