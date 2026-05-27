import { describe, it, expect, beforeEach } from 'vitest';
import { MigrateUsersUseCase, type StoredUserRecord } from './MigrateUsersUseCase.js';
import { BcryptHasher } from '../../infrastructure/security/BcryptHasher.js';

describe('MigrateUsersUseCase', () => {
  let hasher: BcryptHasher;
  let useCase: MigrateUsersUseCase;

  beforeEach(() => {
    hasher = new BcryptHasher(10);
    useCase = new MigrateUsersUseCase(hasher);
  });

  it('hashea contraseñas en texto plano', async () => {
    const input: StoredUserRecord[] = [
      { username: 'admin', password: 'architect123', role: 'ARCHITECT' }
    ];
    const result = await useCase.execute(input);
    expect(result.migrated).toBe(1);
    expect(result.alreadyHashed).toBe(0);
    expect(result.users[0].password).not.toBe('architect123');
    expect(hasher.isHashed(result.users[0].password)).toBe(true);
  });

  it('preserva contraseñas ya hasheadas (idempotente)', async () => {
    const hashed = await hasher.hash('architect123');
    const input: StoredUserRecord[] = [
      { username: 'admin', password: hashed, role: 'ARCHITECT' }
    ];
    const result = await useCase.execute(input);
    expect(result.migrated).toBe(0);
    expect(result.alreadyHashed).toBe(1);
    expect(result.users[0].password).toBe(hashed);
  });

  it('procesa una mezcla de hasheados y planos', async () => {
    const hashed = await hasher.hash('dev123');
    const input: StoredUserRecord[] = [
      { username: 'admin', password: 'architect123', role: 'ARCHITECT' },
      { username: 'dev', password: hashed, role: 'DEVELOPER' }
    ];
    const result = await useCase.execute(input);
    expect(result.migrated).toBe(1);
    expect(result.alreadyHashed).toBe(1);
    expect(result.users[1].password).toBe(hashed);
    expect(await hasher.verify('architect123', result.users[0].password)).toBe(true);
  });

  it('preserva username y role', async () => {
    const input: StoredUserRecord[] = [
      { username: 'admin', password: 'architect123', role: 'ARCHITECT' }
    ];
    const { users } = await useCase.execute(input);
    expect(users[0].username).toBe('admin');
    expect(users[0].role).toBe('ARCHITECT');
  });

  it('rechaza un input que no es un array', async () => {
    await expect(useCase.execute(null as any)).rejects.toThrow(/array/i);
    await expect(useCase.execute({} as any)).rejects.toThrow(/array/i);
  });

  it('rechaza registros con campos faltantes', async () => {
    await expect(useCase.execute([{ username: 'x' } as any])).rejects.toThrow();
    await expect(useCase.execute([{ username: 'x', password: '', role: 'ARCHITECT' }])).rejects.toThrow(/password/i);
  });
});
