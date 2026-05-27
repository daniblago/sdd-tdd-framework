import type { PasswordHasher } from '../../domain/security/PasswordHasher.js';
import type { UserRepository } from '../../domain/security/UserRepository.js';
import type { UserRole } from './MigrateUsersUseCase.js';

export interface AuthenticatedUser {
  username: string;
  role: UserRole;
}

export type LoginResult =
  | { outcome: 'ok'; user: AuthenticatedUser }
  | { outcome: 'invalid_credentials' };

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(username: string, password: string): Promise<LoginResult> {
    if (!username || !password) {
      return { outcome: 'invalid_credentials' };
    }
    const record = await this.users.findByUsername(username);
    if (!record) {
      return { outcome: 'invalid_credentials' };
    }
    const ok = await this.hasher.verify(password, record.password);
    if (!ok) {
      return { outcome: 'invalid_credentials' };
    }
    return { outcome: 'ok', user: { username: record.username, role: record.role } };
  }
}
