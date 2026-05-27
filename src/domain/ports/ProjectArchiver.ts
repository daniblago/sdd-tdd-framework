import type { Writable } from 'stream';

export interface ProjectArchiver {
  pack(sourceDir: string, destination: Writable): Promise<void>;
}
