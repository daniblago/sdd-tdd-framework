import { describe, it, expect, vi } from 'vitest';
import { SaveArtifactUseCase } from './SaveArtifactUseCase.js';
import { FileSystemPort } from '../../domain/ports/FileSystemPort.js';

describe('SaveArtifactUseCase', () => {
  it('should call writeFile on the FileSystemPort with correct path and content', async () => {
    // Arrange
    const mockFsPort: FileSystemPort = {
      readFile: vi.fn(),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new SaveArtifactUseCase(mockFsPort);
    
    const payload = {
      relativePath: 'specs/001-framework-core/spec.md',
      content: '# Especificación Funcional'
    };

    // Act
    await useCase.execute(payload.relativePath, payload.content);

    // Assert
    expect(mockFsPort.writeFile).toHaveBeenCalledTimes(1);
    expect(mockFsPort.writeFile).toHaveBeenCalledWith(payload.relativePath, payload.content);
  });
});
