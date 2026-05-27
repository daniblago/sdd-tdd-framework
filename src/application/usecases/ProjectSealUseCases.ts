import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';
import type { ProjectName } from '../../domain/ProjectPath.js';

export class SealProjectUseCase {
  constructor(private readonly repo: ProjectRepository) {}
  async execute(project: ProjectName): Promise<void> {
    if (!(await this.repo.exists(project))) {
      throw new Error(`El proyecto "${project.value}" no existe`);
    }
    await this.repo.seal(project);
  }
}

export class UnsealProjectUseCase {
  constructor(private readonly repo: ProjectRepository) {}
  async execute(project: ProjectName): Promise<void> {
    await this.repo.unseal(project);
  }
}

export class GetProjectSealStatusUseCase {
  constructor(private readonly repo: ProjectRepository) {}
  async execute(project: ProjectName): Promise<boolean> {
    return this.repo.isSealed(project);
  }
}
