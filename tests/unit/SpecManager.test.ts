import { describe, it, expect } from 'vitest';
import { SpecManager } from '../../src/application/SpecManager';
import { Specification } from '../../src/domain/Specification';
describe('SpecManager Service', () => {
  it('deberia registrar y listar especificaciones', () => {
    const manager = new SpecManager();
    const spec = new Specification('Alpha', 'Desc');
    manager.registerSpec(spec);
    expect(manager.getAllSpecs()).toHaveLength(1);
    expect(manager.getSpecByTitle('Alpha')).toBeDefined();
  });
});
