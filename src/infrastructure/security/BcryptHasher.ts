import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../../domain/security/PasswordHasher.js';

const BCRYPT_PREFIX = /^\$2[aby]\$\d{2}\$.{53}$/;

export class BcryptHasher implements PasswordHasher {
  constructor(private readonly cost: number = 12) {
    if (cost < 10 || cost > 14) {
      throw new Error(`bcrypt cost fuera de rango razonable [10, 14]: ${cost}`);
    }
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    if (!this.isHashed(hashed)) return false;
    try {
      return await bcrypt.compare(plain, hashed);
    } catch {
      return false;
    }
  }

  isHashed(value: string): boolean {
    return typeof value === 'string' && BCRYPT_PREFIX.test(value);
  }
}
