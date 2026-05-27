import type { Writable } from 'stream';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';
import type { ProjectArchiver } from '../../domain/ports/ProjectArchiver.js';
import type { ProjectName } from '../../domain/ProjectPath.js';

export class ProjectNotFoundError extends Error {
  constructor(name: string) {
    super(`El proyecto "${name}" no existe`);
    this.name = 'ProjectNotFoundError';
  }
}

export class PackageProjectUseCase {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly archiver: ProjectArchiver
  ) {}

  async execute(project: ProjectName, destination: Writable): Promise<void> {
    if (!(await this.repo.exists(project))) {
      throw new ProjectNotFoundError(project.value);
    }
    await this.archiver.pack(this.repo.rootPath(project), destination);
  }
}
