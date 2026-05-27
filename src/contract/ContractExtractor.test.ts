import { describe, it, expect } from 'vitest';
import { ContractExtractor } from './ContractExtractor.js';

describe('ContractExtractor', () => {
  const sample = `
openapi: 3.0.0
info: { title: t, version: '1' }
paths:
  /foo:
    get: { responses: { '200': { description: ok } } }
    post: { responses: { '200': { description: ok } } }
  /bar/{id}:
    delete: { responses: { '200': { description: ok } } }
  /baz:
    parameters:
      - name: shared
        in: query
        schema: { type: string }
`;

  it('extrae endpoints como "METHOD path"', () => {
    const endpoints = new ContractExtractor().fromYaml(sample);
    expect(endpoints.sort()).toEqual([
      'DELETE /bar/{id}',
      'GET /foo',
      'POST /foo'
    ]);
  });

  it('ignora claves no-verbo bajo un path (parameters, summary, etc.)', () => {
    const endpoints = new ContractExtractor().fromYaml(sample);
    expect(endpoints).not.toContain('PARAMETERS /baz');
  });

  it('lanza error si el YAML no tiene sección paths', () => {
    expect(() => new ContractExtractor().fromYaml('openapi: 3.0.0\ninfo: {}')).toThrow(/paths/i);
  });

  it('lanza error si el YAML está malformado', () => {
    expect(() => new ContractExtractor().fromYaml(':::not yaml:::')).toThrow();
  });
});
