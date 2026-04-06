import { describe, it, expect } from 'vitest';
import { Specification } from './Specification.js';

describe('Specification Domain Entity', () => {
  it('debería inicializarse en estado DRAFT con título y descripción válidos', () => {
    const spec = new Specification('Spec-001', 'Descripción de la especificación');
    expect(spec.getTitle()).toBe('Spec-001');
    expect(spec.getStatus()).toBe('DRAFT');
  });

  it('debería lanzar un error si se intenta crear sin título', () => {
    expect(() => new Specification('', 'Descripción')).toThrowError('El título es obligatorio');
    expect(() => new Specification('   ', 'Descripción')).toThrowError('El título es obligatorio');
  });

  it('debería cambiar el estado a REVIEW al solicitar revisión', () => {
    const spec = new Specification('Spec-002', 'Descripción');
    spec.requestReview();
    expect(spec.getStatus()).toBe('REVIEW');
  });

  it('debería permitir aprobar una especificación que está en REVIEW', () => {
    const spec = new Specification('Spec-003', 'Descripción');
    spec.requestReview();
    spec.approve();
    expect(spec.getStatus()).toBe('APPROVED');
  });

  it('debería lanzar un error si se intenta aprobar o rechazar sin estar en REVIEW', () => {
    const spec = new Specification('Spec-004', 'Descripción');
    expect(() => spec.approve()).toThrowError('Debe estar en revision');
    expect(() => spec.reject()).toThrowError('Debe estar en revision');
  });

  it('debería permitir solicitar revisión nuevamente si la especificación fue rechazada', () => {
    const spec = new Specification('Spec-005', 'Descripción');
    spec.requestReview();
    spec.reject();
    spec.requestReview();
    expect(spec.getStatus()).toBe('REVIEW');
  });
});