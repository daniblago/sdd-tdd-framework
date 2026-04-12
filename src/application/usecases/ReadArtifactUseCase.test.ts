import { describe, it, expect, vi } from 'vitest';
import { ReadArtifactUseCase } from './ReadArtifactUseCase.js';
import { FileSystemPort } from '../../domain/ports/FileSystemPort.js';

describe('ReadArtifactUseCase', () => {
  it('should call readFile returning content', async () => {
    const mockFsPort: FileSystemPort = {
      readFile: vi.fn().mockResolvedValue('# Contenido real'),
      writeFile: vi.fn(),
    };
    const useCase = new ReadArtifactUseCase(mockFsPort);
    const content = await useCase.execute('test.md');
    expect(mockFsPort.readFile).toHaveBeenCalledWith('test.md');
    expect(content).toBe('# Contenido real');
  });

  it('should return null if file does not exist', async () => {
    const mockFsPort: FileSystemPort = {
      readFile: vi.fn().mockResolvedValue(null),
      writeFile: vi.fn(),
    };
    const useCase = new ReadArtifactUseCase(mockFsPort);
    const content = await useCase.execute('no-existe.md');
    expect(content).toBeNull();
  });
});
