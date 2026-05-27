import { Router, Request, Response } from 'express';
import { ProjectName } from '../../domain/ProjectPath.js';
import { authMiddleware, AuthenticatedRequest } from './middleware/authMiddleware.js';
import type { DownloadTicketStore } from '../security/DownloadTicket.js';
import type { PackageProjectUseCase } from '../../application/usecases/PackageProjectUseCase.js';
import { ProjectNotFoundError } from '../../application/usecases/PackageProjectUseCase.js';
import type { ProjectRepository } from '../../domain/ports/ProjectRepository.js';

export interface DownloadRouterDeps {
  tickets: DownloadTicketStore;
  pack: PackageProjectUseCase;
  projects: ProjectRepository;
}

export function createDownloadRouter(deps: DownloadRouterDeps): Router {
  const router = Router();

  router.post('/download-ticket', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    let project: ProjectName;
    try { project = ProjectName.from(req.body?.projectName); }
    catch (e) { res.status(400).json({ error: (e as Error).message }); return; }

    if (!(await deps.projects.exists(project))) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }
    const ticket = deps.tickets.issue({ projectName: project.value, username: req.user!.username });
    res.status(200).json({ ticket, expiresInSeconds: 30 });
  });

  router.get('/download/:projectName', async (req: Request, res: Response) => {
    let project: ProjectName;
    try { project = ProjectName.from(req.params.projectName); }
    catch (e) { res.status(400).json({ error: (e as Error).message }); return; }

    const ticket = req.query.ticket as string | undefined;
    if (!ticket) { res.status(401).json({ error: 'Ticket de descarga requerido' }); return; }
    try { deps.tickets.consume(ticket, project.value); }
    catch (e) { res.status(401).json({ error: (e as Error).message }); return; }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${project.value}-sdd-architecture.zip`);

    try {
      await deps.pack.execute(project, res);
    } catch (e) {
      if (!res.headersSent) {
        const status = e instanceof ProjectNotFoundError ? 404 : 500;
        res.status(status).json({ error: (e as Error).message });
      } else {
        res.end();
      }
    }
  });

  return router;
}
