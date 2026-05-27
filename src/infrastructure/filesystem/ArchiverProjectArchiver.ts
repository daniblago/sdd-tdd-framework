import { promises as fs } from 'fs';
import archiver from 'archiver';
import type { Writable } from 'stream';
import type { ProjectArchiver } from '../../domain/ports/ProjectArchiver.js';

export class ArchiverProjectArchiver implements ProjectArchiver {
  async pack(sourceDir: string, destination: Writable): Promise<void> {
    const stat = await fs.stat(sourceDir);
    if (!stat.isDirectory()) {
      throw new Error(`No es un directorio: ${sourceDir}`);
    }
    const archive = archiver('zip', { zlib: { level: 9 } });
    const done = new Promise<void>((resolve, reject) => {
      archive.on('error', reject);
      archive.on('end', resolve);
    });
    archive.pipe(destination);
    archive.directory(sourceDir, false);
    await archive.finalize();
    await done;
  }
}
