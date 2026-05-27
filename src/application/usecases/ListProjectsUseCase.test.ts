import { describe, it, expect } from 'vitest';
import { ListProjectsUseCase } from './ListProjectsUseCase.js';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';

const fakeRepo = (names: string[]): ProjectRepository => ({
  list: async () => names,
  exists: async () => false,
  create: async () => {},
  seal: async () => {},
  unseal: async () => {},
  isSealed: async () => false,
  rootPath: () => ''
});

describe('ListProjectsUseCase', () => {
  it('delega en el repositorio y devuelve la lista ordenada', async () => {
    const uc = new ListProjectsUseCase(fakeRepo(['zeta', 'alpha', 'mu']));
    expect(await uc.execute()).toEqual(['alpha', 'mu', 'zeta']);
  });

  it('devuelve [] sin proyectos', async () => {
    const uc = new ListProjectsUseCase(fakeRepo([]));
    expect(await uc.execute()).toEqual([]);
  });
});
