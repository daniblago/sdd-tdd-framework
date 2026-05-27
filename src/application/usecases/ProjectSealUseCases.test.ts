import { describe, it, expect, beforeEach } from 'vitest';
import { SealProjectUseCase, UnsealProjectUseCase, GetProjectSealStatusUseCase } from './ProjectSealUseCases.js';
import { ProjectName } from '../../domain/ProjectPath.js';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';

const buildRepo = () => {
  const sealed = new Set<string>();
  const existing = new Set<string>(['demo']);
  return {
    repo: {
      list: async () => [...existing],
      exists: async (p) => existing.has(p.value),
      create: async (p) => { existing.add(p.value); },
      seal: async (p) => { sealed.add(p.value); },
      unseal: async (p) => { sealed.delete(p.value); },
      isSealed: async (p) => sealed.has(p.value),
      rootPath: (p) => `/fake/${p.value}`
    } as ProjectRepository,
    sealed,
    existing
  };
};

describe('SealProjectUseCase', () => {
  let ctx: ReturnType<typeof buildRepo>;
  beforeEach(() => { ctx = buildRepo(); });

  it('sella un proyecto existente', async () => {
    await new SealProjectUseCase(ctx.repo).execute(ProjectName.from('demo'));
    expect(ctx.sealed.has('demo')).toBe(true);
  });

  it('rechaza sellar un proyecto inexistente', async () => {
    await expect(new SealProjectUseCase(ctx.repo).execute(ProjectName.from('nope')))
      .rejects.toThrow(/no existe/i);
  });

  it('es idempotente al sellar dos veces', async () => {
    const uc = new SealProjectUseCase(ctx.repo);
    await uc.execute(ProjectName.from('demo'));
    await uc.execute(ProjectName.from('demo'));
    expect(ctx.sealed.has('demo')).toBe(true);
  });
});

describe('UnsealProjectUseCase', () => {
  it('quita el sello', async () => {
    const ctx = buildRepo();
    await new SealProjectUseCase(ctx.repo).execute(ProjectName.from('demo'));
    await new UnsealProjectUseCase(ctx.repo).execute(ProjectName.from('demo'));
    expect(ctx.sealed.has('demo')).toBe(false);
  });

  it('es idempotente si no estaba sellado', async () => {
    const ctx = buildRepo();
    await expect(new UnsealProjectUseCase(ctx.repo).execute(ProjectName.from('demo'))).resolves.toBeUndefined();
  });
});

describe('GetProjectSealStatusUseCase', () => {
  it('refleja el estado del sello', async () => {
    const ctx = buildRepo();
    const uc = new GetProjectSealStatusUseCase(ctx.repo);
    expect(await uc.execute(ProjectName.from('demo'))).toBe(false);
    await new SealProjectUseCase(ctx.repo).execute(ProjectName.from('demo'));
    expect(await uc.execute(ProjectName.from('demo'))).toBe(true);
  });
});
