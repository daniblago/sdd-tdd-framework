import { describe, it, expect } from 'vitest';
import { Specification } from '../../src/domain/Specification.js';
describe('Specification Entity', () => {
  it('deberia iniciar en DRAFT', () => {
    const spec = new Specification('Test', 'Desc');
    expect(spec.getStatus()).toBe('DRAFT');
  });
  it('deberia permitir flujo DRAFT -> REVIEW -> APPROVED', () => {
    const spec = new Specification('Test', 'Desc');
    spec.requestReview();
    spec.approve();
    expect(spec.getStatus()).toBe('APPROVED');
  });
});
