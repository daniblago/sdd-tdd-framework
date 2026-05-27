import { describe, it, expect } from 'vitest';
import { ProjectName, ResolvedArtifactPath } from './ProjectPath.js';
import path from 'path';

describe('ProjectName', () => {
  it('acepta nombres alfanuméricos con guiones y underscores', () => {
    expect(ProjectName.from('residentapp').value).toBe('residentapp');
    expect(ProjectName.from('3g-truckia').value).toBe('3g-truckia');
    expect(ProjectName.from('my_project_42').value).toBe('my_project_42');
  });

  it('rechaza nombres vacíos', () => {
    expect(() => ProjectName.from('')).toThrow(/inválido/i);
    expect(() => ProjectName.from('   ')).toThrow(/inválido/i);
  });

  it('rechaza nombres con separadores de path', () => {
    expect(() => ProjectName.from('foo/bar')).toThrow(/inválido/i);
    expect(() => ProjectName.from('foo\\bar')).toThrow(/inválido/i);
    expect(() => ProjectName.from('..')).toThrow(/inválido/i);
    expect(() => ProjectName.from('.')).toThrow(/inválido/i);
  });

  it('rechaza nombres con caracteres especiales', () => {
    expect(() => ProjectName.from('foo bar')).toThrow(/inválido/i);
    expect(() => ProjectName.from('foo;rm')).toThrow(/inválido/i);
    expect(() => ProjectName.from('foo$bar')).toThrow(/inválido/i);
    expect(() => ProjectName.from('foo\0bar')).toThrow(/inválido/i);
  });

  it('rechaza nombres con caracteres URL-encoded sin decodificar', () => {
    expect(() => ProjectName.from('%2e%2e')).toThrow(/inválido/i);
    expect(() => ProjectName.from('foo%2fbar')).toThrow(/inválido/i);
  });

  it('rechaza nombres demasiado largos', () => {
    const long = 'a'.repeat(101);
    expect(() => ProjectName.from(long)).toThrow(/inválido/i);
  });
});

describe('ResolvedArtifactPath', () => {
  const workspacesDir = path.resolve(process.cwd(), 'workspaces');

  it('resuelve un path relativo dentro del proyecto', () => {
    const project = ProjectName.from('residentapp');
    const resolved = ResolvedArtifactPath.from(workspacesDir, project, 'docs/01-constitucion.md');
    expect(resolved.absolutePath).toBe(path.join(workspacesDir, 'residentapp', 'docs', '01-constitucion.md'));
  });

  it('rechaza segmentos ".."', () => {
    const project = ProjectName.from('residentapp');
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, '../escape.md')).toThrow(/traversal/i);
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, 'docs/../../escape.md')).toThrow(/traversal/i);
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, 'docs/..\\escape.md')).toThrow(/traversal/i);
  });

  it('rechaza paths absolutos', () => {
    const project = ProjectName.from('residentapp');
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, '/etc/passwd')).toThrow(/traversal/i);
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, 'C:\\Windows\\System32\\evil.dll')).toThrow(/traversal/i);
  });

  it('rechaza secuencias URL-encoded de traversal', () => {
    const project = ProjectName.from('residentapp');
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, '%2e%2e/escape.md')).toThrow(/traversal/i);
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, '..%2fescape.md')).toThrow(/traversal/i);
  });

  it('rechaza null bytes', () => {
    const project = ProjectName.from('residentapp');
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, 'docs/safe.md\0../../evil')).toThrow(/inválido/i);
  });

  it('rechaza paths vacíos', () => {
    const project = ProjectName.from('residentapp');
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, '')).toThrow(/requerido/i);
    expect(() => ResolvedArtifactPath.from(workspacesDir, project, '   ')).toThrow(/requerido/i);
  });

  it('preserva el relativePath original tras la validación', () => {
    const project = ProjectName.from('residentapp');
    const resolved = ResolvedArtifactPath.from(workspacesDir, project, 'docs/01-constitucion.md');
    expect(resolved.relativePath).toBe('docs/01-constitucion.md');
    expect(resolved.projectRoot).toBe(path.join(workspacesDir, 'residentapp'));
  });
});
