import { describe, it, expect } from 'vitest';
import { SpecManager } from './SpecManager.js';
import { Specification } from '../domain/Specification.js';

describe('SpecManager Service', () => {
  it('debería registrar y listar especificaciones', () => {
    const manager = new SpecManager();
    const spec = new Specification('Alpha', 'Desc');
    manager.registerSpec(spec);
    expect(manager.getAllSpecs()).toHaveLength(1);
    expect(manager.getSpecByTitle('Alpha')).toBeDefined();
  });
});
