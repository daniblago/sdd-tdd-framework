import { FileSystemPort } from '../../domain/ports/FileSystemPort.js';

export class ReadArtifactUseCase {
  constructor(private readonly fileSystem: FileSystemPort) {}

  /**
   * Ejecuta la lectura de un artefacto del Workspace
   * retorna el string o null si no se encuentra.
   */
  async execute(relativePath: string): Promise<string | null> {
    if (!relativePath || relativePath.trim() === '') {
      throw new Error('El path del artefacto es requerido para leer');
    }
    return await this.fileSystem.readFile(relativePath);
  }
}
