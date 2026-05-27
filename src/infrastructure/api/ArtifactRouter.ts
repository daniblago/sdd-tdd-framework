import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ProjectName, ResolvedArtifactPath } from '../../domain/ProjectPath.js';
import { authMiddleware, architectOnly } from './middleware/authMiddleware.js';
import { LocalFileSystemAdapter } from '../filesystem/LocalFileSystemAdapter.js';
import { SaveArtifactUseCase } from '../../application/usecases/SaveArtifactUseCase.js';
import { ReadArtifactUseCase } from '../../application/usecases/ReadArtifactUseCase.js';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';

const SaveSchema = z.object({
  projectName: z.string().min(1),
  relativePath: z.string().min(1),
  content: z.string()
});

export interface ArtifactRouterDeps {
  workspacesDir: string;
  projects: ProjectRepository;
}

export function createArtifactRouter(deps: ArtifactRouterDeps): Router {
  const router = Router();

  const useCasesFor = (project: ProjectName) => {
    const adapter = new LocalFileSystemAdapter(deps.projects.rootPath(project));
    return {
      save: new SaveArtifactUseCase(adapter),
      read: new ReadArtifactUseCase(adapter)
    };
  };

  router.post('/artifact', authMiddleware, architectOnly, async (req: Request, res: Response) => {
    let parsed: z.infer<typeof SaveSchema>;
    try { parsed = SaveSchema.parse(req.body); }
    catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Validación fallida', details: err.issues });
        return;
      }
      res.status(400).json({ error: 'Validación fallida' });
      return;
    }
    let project: ProjectName;
    let resolved: ResolvedArtifactPath;
    try {
      project = ProjectName.from(parsed.projectName);
      resolved = ResolvedArtifactPath.from(deps.workspacesDir, project, parsed.relativePath);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
      return;
    }
    try {
      await useCasesFor(project).save.execute(resolved.relativePath, parsed.content);
      res.status(200).json({ message: 'Artefacto guardado con éxito' });
    } catch (e) {
      res.status(500).json({ error: 'Error del servidor', details: (e as Error).message });
    }
  });

  router.get('/artifact', authMiddleware, async (req: Request, res: Response) => {
    let project: ProjectName;
    let resolved: ResolvedArtifactPath;
    try {
      project = ProjectName.from(req.query.projectName);
      resolved = ResolvedArtifactPath.from(deps.workspacesDir, project, req.query.relativePath);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
      return;
    }
    try {
      const content = await useCasesFor(project).read.execute(resolved.relativePath);
      if (content === null) {
        res.status(404).json({ error: 'Artefacto no encontrado' });
        return;
      }
      res.status(200).send(content);
    } catch {
      res.status(500).json({ error: 'Error interno leyendo' });
    }
  });

  return router;
}
