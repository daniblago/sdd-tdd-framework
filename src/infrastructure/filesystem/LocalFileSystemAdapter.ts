import { FileSystemPort } from '../../domain/ports/FileSystemPort.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LocalFileSystemAdapter implements FileSystemPort {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  async readFile(relativePath: string): Promise<string | null> {
    const fullPath = path.join(this.workspaceRoot, relativePath);
    try {
      const data = await fs.readFile(fullPath, 'utf-8');
      return data;
    } catch (e: any) {
      if (e.code === 'ENOENT') return null;
      throw e;
    }
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspaceRoot, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }
}
