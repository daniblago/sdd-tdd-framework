import path from 'path';

const PROJECT_NAME_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;

export class ProjectName {
  private constructor(public readonly value: string) {}

  static from(raw: unknown): ProjectName {
    if (typeof raw !== 'string') {
      throw new Error('Nombre de proyecto inválido: debe ser texto');
    }
    const trimmed = raw.trim();
    if (!PROJECT_NAME_REGEX.test(trimmed)) {
      throw new Error(`Nombre de proyecto inválido: "${raw}". Solo se permiten [a-zA-Z0-9_-], longitud 1-100.`);
    }
    return new ProjectName(trimmed);
  }
}

export class ResolvedArtifactPath {
  private constructor(
    public readonly absolutePath: string,
    public readonly relativePath: string,
    public readonly projectRoot: string
  ) {}

  static from(workspacesDir: string, project: ProjectName, relativePath: unknown): ResolvedArtifactPath {
    if (typeof relativePath !== 'string' || relativePath.trim() === '') {
      throw new Error('relativePath es requerido');
    }
    if (relativePath.includes('\0')) {
      throw new Error('relativePath inválido: contiene null byte');
    }
    if (/%2e|%2f|%5c/i.test(relativePath)) {
      throw new Error('Path traversal detectado: secuencia URL-encoded no permitida');
    }
    if (path.isAbsolute(relativePath) || /^[a-zA-Z]:/.test(relativePath)) {
      throw new Error('Path traversal detectado: se requiere un path relativo');
    }
    const segments = relativePath.split(/[\\/]/);
    if (segments.some(s => s === '..')) {
      throw new Error('Path traversal detectado: segmento ".." no permitido');
    }

    const projectRoot = path.resolve(workspacesDir, project.value);
    const candidate = path.resolve(projectRoot, relativePath);
    const projectRootWithSep = projectRoot + path.sep;

    if (candidate !== projectRoot && !candidate.startsWith(projectRootWithSep)) {
      throw new Error(`Path traversal detectado: "${relativePath}" escapa de ${projectRoot}`);
    }

    return new ResolvedArtifactPath(candidate, relativePath, projectRoot);
  }
}
