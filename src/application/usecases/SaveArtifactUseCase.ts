import { FileSystemPort } from '../../domain/ports/FileSystemPort.js';

export class SaveArtifactUseCase {
  constructor(private readonly fileSystem: FileSystemPort) {}

  /**
   * Ejecuta la creacion o actualizacion de un artefacto en el Workspace
   * devolviendo la confirmación.
   */
  async execute(relativePath: string, content: string): Promise<void> {
    if (!relativePath || relativePath.trim() === '') {
      throw new Error('El path del artefacto es requerido');
    }
    
    if (content === undefined || content === null) {
      throw new Error('El contenido del artefacto no puede ser nulo');
    }

    await this.fileSystem.writeFile(relativePath, content);
  }
}
