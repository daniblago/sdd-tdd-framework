import { describe, it, expect } from 'vitest';
import { User } from './User.js';

describe('User Domain Entity', () => {
  it('debería inicializarse como unverified con un email válido (Regla 2)', () => {
    const user = new User('test@example.com');
    expect(user.isVerified()).toBe(false);
  });

  it('debería lanzar un error si se intenta crear sin email (Regla 1)', () => {
    expect(() => new User('')).toThrowError('Email requerido');
  });

  it('debería cambiar a verified al llamar verify() (Regla 3)', () => {
    const user = new User('test@example.com');
    user.verify();
    expect(user.isVerified()).toBe(true);
  });
});