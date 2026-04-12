export interface FileSystemPort {
  /**
   * Lee el contenido de un archivo en el workspace.
   */
  readFile(relativePath: string): Promise<string | null>;

  /**
   * Sobrescribe el contenido de un archivo en el workspace.
   * Crea el directorio y el archivo si no existen.
   */
  writeFile(relativePath: string, content: string): Promise<void>;
}
