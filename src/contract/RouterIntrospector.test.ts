import { describe, it, expect } from 'vitest';
import { Router } from 'express';
import { RouterIntrospector } from './RouterIntrospector.js';

describe('RouterIntrospector', () => {
  it('extrae rutas de un Router con su mount path', () => {
    const r = Router();
    r.get('/projects', (_q, res) => res.end());
    r.post('/projects', (_q, res) => res.end());

    const endpoints = new RouterIntrospector().fromMounts([
      { mount: '/api/workspace', router: r }
    ]);
    expect(endpoints.sort()).toEqual([
      'GET /api/workspace/projects',
      'POST /api/workspace/projects'
    ]);
  });

  it('soporta varios mounts a la vez', () => {
    const a = Router();
    a.post('/login', (_q, r) => r.end());
    const b = Router();
    b.get('/projects', (_q, r) => r.end());

    const endpoints = new RouterIntrospector().fromMounts([
      { mount: '/api/auth', router: a },
      { mount: '/api/workspace', router: b }
    ]);
    expect(endpoints.sort()).toEqual([
      'GET /api/workspace/projects',
      'POST /api/auth/login'
    ]);
  });

  it('normaliza :param de Express a {param} estilo OpenAPI', () => {
    const r = Router();
    r.delete('/seal/:projectName', (_q, res) => res.end());
    r.get('/download/:projectName', (_q, res) => res.end());

    const endpoints = new RouterIntrospector().fromMounts([
      { mount: '/api/workspace', router: r }
    ]);
    expect(endpoints.sort()).toEqual([
      'DELETE /api/workspace/seal/{projectName}',
      'GET /api/workspace/download/{projectName}'
    ]);
  });

  it('recursivamente camina sub-routers compuestos sin mount path (router.use(subRouter))', () => {
    const composer = Router();
    const a = Router();
    a.get('/foo', (_q, r) => r.end());
    const b = Router();
    b.post('/bar', (_q, r) => r.end());
    composer.use(a);
    composer.use(b);

    const endpoints = new RouterIntrospector().fromMounts([
      { mount: '/api/workspace', router: composer }
    ]);
    expect(endpoints.sort()).toEqual([
      'GET /api/workspace/foo',
      'POST /api/workspace/bar'
    ].sort());
  });

  it('dedupe: el mismo path/método registrado dos veces se reporta una', () => {
    const r = Router();
    r.get('/x', (_q, res) => res.end());
    r.get('/x', (_q, res) => res.end());

    const endpoints = new RouterIntrospector().fromMounts([{ mount: '', router: r }]);
    expect(endpoints).toEqual(['GET /x']);
  });

  it('soporta mount path vacío para endpoints raíz (health check)', () => {
    const r = Router();
    r.get('/', (_q, res) => res.end());
    const endpoints = new RouterIntrospector().fromMounts([{ mount: '', router: r }]);
    expect(endpoints).toEqual(['GET /']);
  });
});
