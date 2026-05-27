import { Router, Request, Response } from 'express';
import { ProjectName } from '../../domain/ProjectPath.js';
import { authMiddleware, architectOnly } from './middleware/authMiddleware.js';
import type { ListProjectsUseCase } from '../../application/usecases/ListProjectsUseCase.js';
import type { CreateProjectUseCase } from '../../application/usecases/CreateProjectUseCase.js';
import type {
  SealProjectUseCase,
  UnsealProjectUseCase,
  GetProjectSealStatusUseCase
} from '../../application/usecases/ProjectSealUseCases.js';

export interface ProjectRouterDeps {
  list: ListProjectsUseCase;
  create: CreateProjectUseCase;
  seal: SealProjectUseCase;
  unseal: UnsealProjectUseCase;
  status: GetProjectSealStatusUseCase;
}

const respondBadRequest = (res: Response, err: unknown): void => {
  res.status(400).json({ error: (err as Error).message });
};

export function createProjectRouter(deps: ProjectRouterDeps): Router {
  const router = Router();

  router.get('/projects', authMiddleware, async (_req, res) => {
    try {
      res.status(200).json({ projects: await deps.list.execute() });
    } catch {
      res.status(500).json({ error: 'Error leyendo proyectos' });
    }
  });

  router.post('/projects', authMiddleware, architectOnly, async (req: Request, res: Response) => {
    let project: ProjectName;
    try { project = ProjectName.from(req.body?.projectName); } catch (e) { return respondBadRequest(res, e); }
    try {
      await deps.create.execute(project);
      res.status(200).json({ message: 'OK', project: project.value });
    } catch (e) {
      const msg = (e as Error).message;
      if (/ya existe/i.test(msg)) { res.status(409).json({ error: msg }); return; }
      res.status(500).json({ error: 'Error creando proyecto' });
    }
  });

  router.get('/seal', authMiddleware, async (req: Request, res: Response) => {
    let project: ProjectName;
    try { project = ProjectName.from(req.query.projectName); } catch (e) { return respondBadRequest(res, e); }
    const isSealed = await deps.status.execute(project);
    res.status(200).json({ isSealed });
  });

  router.post('/seal', authMiddleware, architectOnly, async (req: Request, res: Response) => {
    let project: ProjectName;
    try { project = ProjectName.from(req.body?.projectName); } catch (e) { return respondBadRequest(res, e); }
    try {
      await deps.seal.execute(project);
      res.status(200).json({ message: 'Proyecto sellado con éxito' });
    } catch (e) {
      const msg = (e as Error).message;
      if (/no existe/i.test(msg)) { res.status(404).json({ error: msg }); return; }
      res.status(500).json({ error: 'Error al sellar' });
    }
  });

  router.delete('/seal/:projectName', authMiddleware, architectOnly, async (req: Request, res: Response) => {
    let project: ProjectName;
    try { project = ProjectName.from(req.params.projectName); } catch (e) { return respondBadRequest(res, e); }
    await deps.unseal.execute(project);
    res.status(200).json({ message: 'Candado deshecho (o inexistente)' });
  });

  return router;
}
