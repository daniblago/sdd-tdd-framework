import { promises as fs } from 'fs';
import path from 'path';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';
import type { ProjectName } from '../../domain/ProjectPath.js';

const SEAL_MARKER = '.sdd-sealed';

export class LocalProjectRepository implements ProjectRepository {
  constructor(private readonly workspacesDir: string) {}

  async list(): Promise<string[]> {
    await this.ensureRoot();
    const entries = await fs.readdir(this.workspacesDir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  }

  async exists(project: ProjectName): Promise<boolean> {
    try {
      const stat = await fs.stat(this.rootPath(project));
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async create(project: ProjectName): Promise<void> {
    await fs.mkdir(this.rootPath(project), { recursive: true });
  }

  async seal(project: ProjectName): Promise<void> {
    await fs.writeFile(this.sealPath(project), 'SEALED', 'utf8');
  }

  async unseal(project: ProjectName): Promise<void> {
    try {
      await fs.unlink(this.sealPath(project));
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  async isSealed(project: ProjectName): Promise<boolean> {
    try {
      await fs.access(this.sealPath(project));
      return true;
    } catch {
      return false;
    }
  }

  rootPath(project: ProjectName): string {
    return path.join(this.workspacesDir, project.value);
  }

  private sealPath(project: ProjectName): string {
    return path.join(this.rootPath(project), SEAL_MARKER);
  }

  private async ensureRoot(): Promise<void> {
    await fs.mkdir(this.workspacesDir, { recursive: true });
  }
}
