import { describe, it, expect } from 'vitest';
import { BcryptHasher } from './BcryptHasher.js';

describe('BcryptHasher', () => {
  const hasher = new BcryptHasher(10);

  it('produce un hash distinto al texto plano', async () => {
    const hash = await hasher.hash('architect123');
    expect(hash).not.toBe('architect123');
    expect(hash.length).toBeGreaterThan(40);
  });

  it('produce hashes diferentes para la misma contraseña (salt aleatorio)', async () => {
    const a = await hasher.hash('same-pass');
    const b = await hasher.hash('same-pass');
    expect(a).not.toBe(b);
  });

  it('verifica correctamente una contraseña válida', async () => {
    const hash = await hasher.hash('correct horse battery staple');
    expect(await hasher.verify('correct horse battery staple', hash)).toBe(true);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const hash = await hasher.hash('correct horse battery staple');
    expect(await hasher.verify('wrong password', hash)).toBe(false);
  });

  it('isHashed detecta hashes bcrypt válidos', async () => {
    const hash = await hasher.hash('x');
    expect(hasher.isHashed(hash)).toBe(true);
  });

  it('isHashed rechaza texto plano', () => {
    expect(hasher.isHashed('architect123')).toBe(false);
    expect(hasher.isHashed('')).toBe(false);
    expect(hasher.isHashed('plaintext-but-long-enough-to-trick-naive-checks')).toBe(false);
  });

  it('verify no lanza si el hash es malformado, devuelve false', async () => {
    expect(await hasher.verify('any', 'not-a-bcrypt-hash')).toBe(false);
  });

  it('rechaza cost inválido en el constructor', () => {
    expect(() => new BcryptHasher(3)).toThrow(/cost/i);
    expect(() => new BcryptHasher(20)).toThrow(/cost/i);
  });
});
