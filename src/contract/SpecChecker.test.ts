import { describe, it, expect } from 'vitest';
import { SpecChecker } from './SpecChecker.js';

describe('SpecChecker', () => {
  it('reporta ok cuando spec e implementación coinciden', () => {
    const result = new SpecChecker().compare(
      ['GET /foo', 'POST /foo', 'DELETE /bar/{id}'],
      ['GET /foo', 'POST /foo', 'DELETE /bar/{id}']
    );
    expect(result.ok).toBe(true);
    expect(result.missingInCode).toEqual([]);
    expect(result.missingInSpec).toEqual([]);
    expect(result.totalSpec).toBe(3);
    expect(result.totalCode).toBe(3);
  });

  it('detecta endpoint declarado en spec pero no implementado', () => {
    const result = new SpecChecker().compare(
      ['GET /foo', 'POST /bar'],
      ['GET /foo']
    );
    expect(result.ok).toBe(false);
    expect(result.missingInCode).toEqual(['POST /bar']);
    expect(result.missingInSpec).toEqual([]);
  });

  it('detecta endpoint implementado pero no declarado en spec', () => {
    const result = new SpecChecker().compare(
      ['GET /foo'],
      ['GET /foo', 'POST /extra']
    );
    expect(result.ok).toBe(false);
    expect(result.missingInCode).toEqual([]);
    expect(result.missingInSpec).toEqual(['POST /extra']);
  });

  it('detecta drift en ambas direcciones simultáneamente', () => {
    const result = new SpecChecker().compare(
      ['GET /a', 'POST /b'],
      ['GET /a', 'DELETE /c']
    );
    expect(result.ok).toBe(false);
    expect(result.missingInCode.sort()).toEqual(['POST /b']);
    expect(result.missingInSpec.sort()).toEqual(['DELETE /c']);
  });

  it('es insensible al orden de entrada', () => {
    const result = new SpecChecker().compare(
      ['POST /b', 'GET /a'],
      ['GET /a', 'POST /b']
    );
    expect(result.ok).toBe(true);
  });

  it('formatea un reporte humano con secciones claras', () => {
    const result = new SpecChecker().compare(
      ['GET /a', 'POST /missing'],
      ['GET /a', 'DELETE /extra']
    );
    const report = SpecChecker.format(result);
    expect(report).toMatch(/SPEC DRIFT/i);
    expect(report).toContain('POST /missing');
    expect(report).toContain('DELETE /extra');
  });

  it('format devuelve OK cuando no hay drift', () => {
    const result = new SpecChecker().compare(['GET /x'], ['GET /x']);
    const report = SpecChecker.format(result);
    expect(report).toMatch(/✓|OK/i);
  });
});
