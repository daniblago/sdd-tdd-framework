import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';

export class ListProjectsUseCase {
  constructor(private readonly repo: ProjectRepository) {}

  async execute(): Promise<string[]> {
    const names = await this.repo.list();
    return [...names].sort((a, b) => a.localeCompare(b));
  }
}
