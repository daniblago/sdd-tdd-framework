import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUseCase, type LoginResult } from './LoginUseCase.js';
import { BcryptHasher } from '../../infrastructure/security/BcryptHasher.js';
import type { UserRepository } from '../../domain/security/UserRepository.js';
import type { StoredUserRecord } from './MigrateUsersUseCase.js';

const buildRepo = (users: StoredUserRecord[]): UserRepository => ({
  findByUsername: async (name: string) => users.find(u => u.username === name) ?? null
});

describe('LoginUseCase', () => {
  const hasher = new BcryptHasher(10);
  let adminHash: string;
  let useCase: LoginUseCase;

  beforeEach(async () => {
    adminHash = await hasher.hash('architect123');
    useCase = new LoginUseCase(buildRepo([
      { username: 'admin', password: adminHash, role: 'ARCHITECT' }
    ]), hasher);
  });

  it('autentica con credenciales válidas', async () => {
    const result = await useCase.execute('admin', 'architect123');
    expect(result.outcome).toBe('ok');
    if (result.outcome === 'ok') {
      expect(result.user).toEqual({ username: 'admin', role: 'ARCHITECT' });
    }
  });

  it('rechaza con contraseña incorrecta', async () => {
    const result = await useCase.execute('admin', 'wrong');
    expect(result.outcome).toBe('invalid_credentials');
  });

  it('rechaza usuario inexistente sin filtrar diferencia con contraseña incorrecta', async () => {
    const result = await useCase.execute('nobody', 'whatever');
    expect(result.outcome).toBe('invalid_credentials');
  });

  it('rechaza credenciales vacías', async () => {
    expect((await useCase.execute('', 'x')).outcome).toBe('invalid_credentials');
    expect((await useCase.execute('admin', '')).outcome).toBe('invalid_credentials');
  });

  it('rechaza un usuario con contraseña almacenada en plano (defensa en profundidad)', async () => {
    const repo = buildRepo([{ username: 'legacy', password: 'plain-text', role: 'ARCHITECT' }]);
    const uc = new LoginUseCase(repo, hasher);
    const result: LoginResult = await uc.execute('legacy', 'plain-text');
    expect(result.outcome).toBe('invalid_credentials');
  });
});
