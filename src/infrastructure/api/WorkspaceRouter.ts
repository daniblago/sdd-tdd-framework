import { Router } from 'express';
import { env } from '../config/env.js';
import { LocalProjectRepository } from '../filesystem/LocalProjectRepository.js';
import { LocalFileSystemAdapter } from '../filesystem/LocalFileSystemAdapter.js';
import { ArchiverProjectArchiver } from '../filesystem/ArchiverProjectArchiver.js';
import { AiProviderFactory } from '../ai/AiProviderFactory.js';
import { DownloadTicketStore } from '../security/DownloadTicket.js';

import { ListProjectsUseCase } from '../../application/usecases/ListProjectsUseCase.js';
import { CreateProjectUseCase } from '../../application/usecases/CreateProjectUseCase.js';
import { SealProjectUseCase, UnsealProjectUseCase, GetProjectSealStatusUseCase } from '../../application/usecases/ProjectSealUseCases.js';
import { PackageProjectUseCase } from '../../application/usecases/PackageProjectUseCase.js';
import { DraftWithAiUseCase } from '../../application/usecases/DraftWithAiUseCase.js';

import { createProjectRouter } from './ProjectRouter.js';
import { createArtifactRouter } from './ArtifactRouter.js';
import { createDownloadRouter } from './DownloadRouter.js';
import { createAiRouter } from './AiRouter.js';

interface Composition {
  router: Router;
  reset: () => void;
}

let composition: Composition | null = null;

function compose(): Composition {
  const cfg = env();
  const projects = new LocalProjectRepository(cfg.workspacesDir);
  const archiverAdapter = new ArchiverProjectArchiver();
  const fsForProject = (projectRoot: string) => new LocalFileSystemAdapter(projectRoot);

  const tickets = new DownloadTicketStore({ ttlMs: 30_000, secret: cfg.jwtSecret });
  const cleanupInterval = setInterval(() => tickets.cleanup(), 60_000) as unknown as { unref?: () => void };
  cleanupInterval.unref?.();

  const aiFactory = new AiProviderFactory();

  const router = Router();
  router.use(createProjectRouter({
    list: new ListProjectsUseCase(projects),
    create: new CreateProjectUseCase(projects, fsForProject),
    seal: new SealProjectUseCase(projects),
    unseal: new UnsealProjectUseCase(projects),
    status: new GetProjectSealStatusUseCase(projects)
  }));
  router.use(createArtifactRouter({
    workspacesDir: cfg.workspacesDir,
    projects
  }));
  router.use(createDownloadRouter({
    tickets,
    pack: new PackageProjectUseCase(projects, archiverAdapter),
    projects
  }));
  router.use(createAiRouter({
    env: cfg,
    factory: aiFactory,
    buildUseCase: (name) => new DraftWithAiUseCase(aiFactory.get(name))
  }));

  return {
    router,
    reset: () => { clearInterval(cleanupInterval as unknown as NodeJS.Timeout); }
  };
}

export function createWorkspaceRouter(): Router {
  if (!composition) composition = compose();
  return composition.router;
}

export function resetWorkspaceForTests(): void {
  if (composition) composition.reset();
  composition = null;
}
