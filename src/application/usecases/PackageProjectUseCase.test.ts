import { describe, it, expect } from 'vitest';
import { PassThrough } from 'stream';
import { PackageProjectUseCase } from './PackageProjectUseCase.js';
import { ProjectName } from '../../domain/ProjectPath.js';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';
import type { ProjectArchiver } from '../../domain/ports/ProjectArchiver.js';

const repoWith = (existing: string[]): ProjectRepository => ({
  list: async () => existing,
  exists: async (p) => existing.includes(p.value),
  create: async () => {},
  seal: async () => {},
  unseal: async () => {},
  isSealed: async () => false,
  rootPath: (p) => `/fake/${p.value}`
});

describe('PackageProjectUseCase', () => {
  it('llama al archiver con la rootPath del proyecto y el destino', async () => {
    const calls: Array<[string, NodeJS.WritableStream]> = [];
    const archiver: ProjectArchiver = {
      pack: async (src, dest) => { calls.push([src, dest]); }
    };
    const dest = new PassThrough();
    const uc = new PackageProjectUseCase(repoWith(['demo']), archiver);
    await uc.execute(ProjectName.from('demo'), dest);
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('/fake/demo');
    expect(calls[0][1]).toBe(dest);
  });

  it('lanza ProjectNotFoundError si el proyecto no existe', async () => {
    const archiver: ProjectArchiver = { pack: async () => {} };
    const uc = new PackageProjectUseCase(repoWith([]), archiver);
    await expect(uc.execute(ProjectName.from('nope'), new PassThrough()))
      .rejects.toThrowError(/no existe/i);
  });
});
