import type { PasswordHasher } from '../../domain/security/PasswordHasher.js';

export type UserRole = 'ARCHITECT' | 'DEVELOPER';

export interface StoredUserRecord {
  username: string;
  password: string;
  role: UserRole;
}

export interface MigrationResult {
  total: number;
  migrated: number;
  alreadyHashed: number;
  users: StoredUserRecord[];
}

export class MigrateUsersUseCase {
  constructor(private readonly hasher: PasswordHasher) {}

  async execute(users: StoredUserRecord[]): Promise<MigrationResult> {
    if (!Array.isArray(users)) {
      throw new Error('Se esperaba un array de usuarios');
    }

    let migrated = 0;
    let alreadyHashed = 0;
    const out: StoredUserRecord[] = [];

    for (const u of users) {
      if (!u || typeof u.username !== 'string' || typeof u.role !== 'string') {
        throw new Error(`Registro de usuario inválido: ${JSON.stringify(u)}`);
      }
      if (typeof u.password !== 'string' || u.password === '') {
        throw new Error(`password requerido para usuario ${u.username}`);
      }

      if (this.hasher.isHashed(u.password)) {
        alreadyHashed++;
        out.push(u);
      } else {
        const hashed = await this.hasher.hash(u.password);
        out.push({ ...u, password: hashed });
        migrated++;
      }
    }

    return { total: users.length, migrated, alreadyHashed, users: out };
  }
}
