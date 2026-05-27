import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';
import type { FileSystemPort } from '../../domain/ports/FileSystemPort.js';
import type { ProjectName } from '../../domain/ProjectPath.js';
import { PROJECT_DOC_TEMPLATES } from '../../domain/ProjectTemplates.js';

export type FileSystemForProject = (projectRoot: string) => FileSystemPort;

export class CreateProjectUseCase {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly fsForProject: FileSystemForProject
  ) {}

  async execute(project: ProjectName): Promise<void> {
    if (await this.repo.exists(project)) {
      throw new Error(`El proyecto "${project.value}" ya existe`);
    }
    await this.repo.create(project);
    const fs = this.fsForProject(this.repo.rootPath(project));
    for (const tpl of PROJECT_DOC_TEMPLATES) {
      await fs.writeFile(`docs/${tpl.filename}`, tpl.content);
    }
  }
}
