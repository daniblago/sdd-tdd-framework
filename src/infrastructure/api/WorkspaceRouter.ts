import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { SaveArtifactUseCase } from '../../application/usecases/SaveArtifactUseCase.js';
import { ReadArtifactUseCase } from '../../application/usecases/ReadArtifactUseCase.js';
import { LocalFileSystemAdapter } from '../filesystem/LocalFileSystemAdapter.js';

export const workspaceRouter = Router();

// Esquema de validación usando Zod (Clean Architecture: Validación estricta en el Controller)
const SaveArtifactSchema = z.object({
  relativePath: z.string().min(1, 'El relativePath es requerido'),
  content: z.string()
});

// Composición manual de dependencias
const workspaceRoot = process.cwd(); 
const fsAdapter = new LocalFileSystemAdapter(workspaceRoot);
const saveArtifactUseCase = new SaveArtifactUseCase(fsAdapter);
const readArtifactUseCase = new ReadArtifactUseCase(fsAdapter);

/**
 * Endpoints para sobrescribir o crear cualquier artefacto en el Local Workspace.
 * Payload esperado: { "relativePath": "tasks.md", "content": "..." }
 */
workspaceRouter.post('/artifact', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = SaveArtifactSchema.parse(req.body);
    await saveArtifactUseCase.execute(parsed.relativePath, parsed.content);
    res.status(200).json({ message: 'Artefacto guardado exitosamente', path: parsed.relativePath });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validación fallida', details: err.errors });
    } else {
      console.error('[Error en WorkspaceRouter]:', err);
      res.status(500).json({ error: 'Error interno del servidor guardando el artefacto' });
    }
  }
});

/**
 * Endpoints para leer un artefacto del Local Workspace.
 * Query string esperado: ?relativePath=tasks.md
 */
workspaceRouter.get('/artifact', async (req: Request, res: Response): Promise<void> => {
  try {
    const relativePath = req.query.relativePath as string;
    if (!relativePath) {
      res.status(400).json({ error: 'Falta el parámetro relativePath' });
      return;
    }
    const content = await readArtifactUseCase.execute(relativePath);
    if (content === null) {
      res.status(404).json({ error: 'Artefacto no encontrado' });
      return;
    }
    res.status(200).send(content);
  } catch (err: any) {
    console.error('[Error en WorkspaceRouter GET]:', err);
    res.status(500).json({ error: 'Error interno del servidor leyendo el artefacto' });
  }
});
