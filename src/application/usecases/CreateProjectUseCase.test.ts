import { describe, it, expect } from 'vitest';
import { CreateProjectUseCase } from './CreateProjectUseCase.js';
import { ProjectName } from '../../domain/ProjectPath.js';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';
import type { FileSystemPort } from '../../domain/ports/FileSystemPort.js';
import { PROJECT_DOC_TEMPLATES } from '../../domain/ProjectTemplates.js';

const stubRepo = () => {
  const created: string[] = [];
  return {
    repo: {
      list: async () => [],
      exists: async (p) => created.includes(p.value),
      create: async (p) => { created.push(p.value); },
      seal: async () => {},
      unseal: async () => {},
      isSealed: async () => false,
      rootPath: (p) => `/fake/${p.value}`
    } as ProjectRepository,
    created
  };
};

const fakeFs = () => {
  const writes: Array<[string, string]> = [];
  return {
    port: {
      readFile: async () => null,
      writeFile: async (rel: string, content: string) => { writes.push([rel, content]); }
    } as FileSystemPort,
    writes
  };
};

describe('CreateProjectUseCase', () => {
  it('crea el proyecto y siembra las 10 plantillas en docs/', async () => {
    const { repo, created } = stubRepo();
    const { port, writes } = fakeFs();
    const uc = new CreateProjectUseCase(repo, () => port);
    await uc.execute(ProjectName.from('demo'));

    expect(created).toEqual(['demo']);
    expect(writes).toHaveLength(PROJECT_DOC_TEMPLATES.length);
    expect(writes.map(([p]) => p)).toEqual(PROJECT_DOC_TEMPLATES.map(t => `docs/${t.filename}`));
    expect(writes[0][1]).toBe(PROJECT_DOC_TEMPLATES[0].content);
  });

  it('rechaza recrear un proyecto ya existente', async () => {
    const { repo } = stubRepo();
    const { port } = fakeFs();
    const uc = new CreateProjectUseCase(repo, () => port);
    await uc.execute(ProjectName.from('demo'));
    await expect(uc.execute(ProjectName.from('demo'))).rejects.toThrow(/ya existe/i);
  });
});
