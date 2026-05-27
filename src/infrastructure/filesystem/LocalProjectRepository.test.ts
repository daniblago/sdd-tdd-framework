import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { LocalProjectRepository } from './LocalProjectRepository.js';
import { ProjectName } from '../../domain/ProjectPath.js';

describe('LocalProjectRepository', () => {
  let tempDir: string;
  let repo: LocalProjectRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdd-repo-'));
    repo = new LocalProjectRepository(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('list', () => {
    it('devuelve [] cuando el directorio raíz está vacío', async () => {
      expect(await repo.list()).toEqual([]);
    });

    it('crea el directorio raíz si no existe', async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
      expect(await repo.list()).toEqual([]);
      const stat = await fs.stat(tempDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it('lista solo subdirectorios (ignora archivos)', async () => {
      await fs.mkdir(path.join(tempDir, 'alpha'));
      await fs.mkdir(path.join(tempDir, 'beta'));
      await fs.writeFile(path.join(tempDir, 'README'), 'x');
      const projects = await repo.list();
      expect(projects.sort()).toEqual(['alpha', 'beta']);
    });
  });

  describe('exists', () => {
    it('false si el proyecto no existe', async () => {
      expect(await repo.exists(ProjectName.from('nope'))).toBe(false);
    });

    it('true tras crearlo', async () => {
      await repo.create(ProjectName.from('demo'));
      expect(await repo.exists(ProjectName.from('demo'))).toBe(true);
    });
  });

  describe('create', () => {
    it('crea el directorio del proyecto idempotentemente', async () => {
      await repo.create(ProjectName.from('demo'));
      await repo.create(ProjectName.from('demo'));
      expect(await repo.exists(ProjectName.from('demo'))).toBe(true);
    });

    it('rootPath devuelve el path absoluto esperado', () => {
      const p = repo.rootPath(ProjectName.from('demo'));
      expect(p).toBe(path.join(tempDir, 'demo'));
    });
  });

  describe('seal lifecycle', () => {
    beforeEach(async () => {
      await repo.create(ProjectName.from('demo'));
    });

    it('isSealed=false por defecto', async () => {
      expect(await repo.isSealed(ProjectName.from('demo'))).toBe(false);
    });

    it('seal escribe el marcador y isSealed=true', async () => {
      await repo.seal(ProjectName.from('demo'));
      expect(await repo.isSealed(ProjectName.from('demo'))).toBe(true);
    });

    it('unseal borra el marcador', async () => {
      await repo.seal(ProjectName.from('demo'));
      await repo.unseal(ProjectName.from('demo'));
      expect(await repo.isSealed(ProjectName.from('demo'))).toBe(false);
    });

    it('unseal es idempotente si no estaba sellado', async () => {
      await expect(repo.unseal(ProjectName.from('demo'))).resolves.toBeUndefined();
    });
  });
});
