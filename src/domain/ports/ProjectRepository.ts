import type { ProjectName } from '../ProjectPath.js';

export interface ProjectRepository {
  list(): Promise<string[]>;
  exists(project: ProjectName): Promise<boolean>;
  create(project: ProjectName): Promise<void>;
  seal(project: ProjectName): Promise<void>;
  unseal(project: ProjectName): Promise<void>;
  isSealed(project: ProjectName): Promise<boolean>;
  rootPath(project: ProjectName): string;
}
