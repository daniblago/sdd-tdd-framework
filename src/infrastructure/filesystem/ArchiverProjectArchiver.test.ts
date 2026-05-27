import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import { ArchiverProjectArchiver } from './ArchiverProjectArchiver.js';

describe('ArchiverProjectArchiver', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdd-archiver-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('produce un ZIP válido (magic bytes PK) con el contenido del directorio', async () => {
    const sourceDir = path.join(tempDir, 'project');
    await fs.mkdir(path.join(sourceDir, 'docs'), { recursive: true });
    await fs.writeFile(path.join(sourceDir, 'docs', 'a.md'), '# A');
    await fs.writeFile(path.join(sourceDir, 'README.md'), 'hello');

    const zipPath = path.join(tempDir, 'out.zip');
    const out = createWriteStream(zipPath);
    const archiver = new ArchiverProjectArchiver();
    await archiver.pack(sourceDir, out);
    await new Promise<void>(resolve => out.on('close', () => resolve()));

    const data = await fs.readFile(zipPath);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toBe(0x50);
    expect(data[1]).toBe(0x4b);
  });

  it('lanza si la fuente no existe', async () => {
    const out = createWriteStream(path.join(tempDir, 'empty.zip'));
    const archiver = new ArchiverProjectArchiver();
    await expect(archiver.pack(path.join(tempDir, 'no-such-dir'), out)).rejects.toThrow();
  });
});
