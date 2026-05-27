import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import archiver from 'archiver';
import jwt from 'jsonwebtoken';
import * as fs from 'fs/promises';
import path from 'path';
import { SaveArtifactUseCase } from '../../application/usecases/SaveArtifactUseCase.js';
import { ReadArtifactUseCase } from '../../application/usecases/ReadArtifactUseCase.js';
import { LocalFileSystemAdapter } from '../filesystem/LocalFileSystemAdapter.js';
import { env } from '../config/env.js';
import { ProjectName, ResolvedArtifactPath } from '../../domain/ProjectPath.js';
import { DownloadTicketStore } from '../security/DownloadTicket.js';

export const workspaceRouter = Router();

const ensureWorkspacesDir = async (): Promise<void> => {
  try { await fs.mkdir(env().workspacesDir, { recursive: true }); } catch {}
};
ensureWorkspacesDir();

let ticketStoreSingleton: DownloadTicketStore | null = null;
const getTicketStore = (): DownloadTicketStore => {
  if (!ticketStoreSingleton) {
    ticketStoreSingleton = new DownloadTicketStore({ ttlMs: 30_000, secret: env().jwtSecret });
    const handle = setInterval(() => ticketStoreSingleton?.cleanup(), 60_000) as unknown as { unref?: () => void };
    handle.unref?.();
  }
  return ticketStoreSingleton;
};

export function resetWorkspaceForTests(): void {
  ticketStoreSingleton = null;
}

const getUseCasesForProject = (project: ProjectName) => {
  const projectRoot = path.join(env().workspacesDir, project.value);
  const fsAdapter = new LocalFileSystemAdapter(projectRoot);
  return {
    saveArtifactUseCase: new SaveArtifactUseCase(fsAdapter),
    readArtifactUseCase: new ReadArtifactUseCase(fsAdapter)
  };
};

const SaveArtifactSchema = z.object({
  projectName: z.string().min(1),
  relativePath: z.string().min(1),
  content: z.string()
});

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Falta token de acceso (header Authorization: Bearer ...)' });
    return;
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), env().jwtSecret) as any;
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const architectOnly = (req: Request, res: Response, next: NextFunction): void => {
  if ((req as any).user?.role !== 'ARCHITECT') {
    res.status(403).json({ error: 'Acción restringida al rol ARCHITECT' });
    return;
  }
  next();
};

workspaceRouter.get('/projects', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const entries = await fs.readdir(env().workspacesDir, { withFileTypes: true });
    const projects = entries.filter(e => e.isDirectory()).map(e => e.name);
    res.status(200).json({ projects });
  } catch {
    res.status(500).json({ error: 'Error leyendo proyectos' });
  }
});

const PROJECT_TEMPLATES: Array<{ name: string; title: string }> = [
  { name: '01-constitucion.md', title: '# 01. Constitución del Proyecto\n\nDefine los principios de gobernanza, calidad y arquitectura limpia.' },
  { name: '02-glosario.md', title: '# 02. Glosario de Dominio\n\nLista de términos de negocio empresariales y sus definiciones (Lenguaje Ubicuo).' },
  { name: '03-especificacion-funcional.md', title: '# 03. Especificación Funcional\n\nHistorias de usuario y criterios de aceptación detallados.' },
  { name: '04-arquitectura-y-blueprint.md', title: '# 04. Arquitectura de Alto Nivel y Blueprint\n\nDiagramas de arquitectura C4 (Mermaid) y registros ADR.' },
  { name: '05-modelo-datos.md', title: '# 05. Modelo de Datos y Cargas\n\nEntidades persistentes, relaciones, contratos JSON y sincronización.' },
  { name: '06-roles-y-acceso.md', title: '# 06. Matriz de Roles y Control de Acceso\n\nMatriz RBAC (rol vs acción vs recurso).' },
  { name: '07-flujos.md', title: '# 07. Workflows Operativos\n\nDiagramas de estados y workflows de transiciones del negocio.' },
  { name: '08-plan-tecnico.md', title: '# 08. Plan Técnico de Implementación\n\nDefinición del stack tecnológico final y estructura de módulos.' },
  { name: '09-backlog-tdd.md', title: '# 09. Backlog de Tareas Orientado a TDD\n\nLista de tareas unitarias descompiladas bajo el ciclo RED/GREEN/REFACTOR.' },
  { name: '10-implementacion.md', title: '# 10. Implementación y Verificación TDD\n\nReporte de la construcción y verificación final del código.' }
];

workspaceRouter.post('/projects', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  try {
    project = ProjectName.from(req.body?.projectName);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  try {
    const targetPath = path.join(env().workspacesDir, project.value);
    const docsPath = path.join(targetPath, 'docs');
    await fs.mkdir(docsPath, { recursive: true });
    for (const t of PROJECT_TEMPLATES) {
      await fs.writeFile(path.join(docsPath, t.name), t.title, 'utf8');
    }
    res.status(200).json({ message: 'OK', project: project.value });
  } catch {
    res.status(500).json({ error: 'Error creando proyecto' });
  }
});

workspaceRouter.get('/seal', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  try {
    project = ProjectName.from(req.query.projectName);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  const sealPath = path.join(env().workspacesDir, project.value, '.sdd-sealed');
  try {
    await fs.access(sealPath);
    res.status(200).json({ isSealed: true });
  } catch {
    res.status(200).json({ isSealed: false });
  }
});

workspaceRouter.post('/seal', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  try {
    project = ProjectName.from(req.body?.projectName);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  try {
    const sealPath = path.join(env().workspacesDir, project.value, '.sdd-sealed');
    await fs.writeFile(sealPath, 'SEALED', 'utf8');
    res.status(200).json({ message: 'Proyecto sellado con éxito' });
  } catch {
    res.status(500).json({ error: 'Error al sellar' });
  }
});

workspaceRouter.delete('/seal/:projectName', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  try {
    project = ProjectName.from(req.params.projectName);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  try {
    await fs.unlink(path.join(env().workspacesDir, project.value, '.sdd-sealed'));
  } catch {}
  res.status(200).json({ message: 'Candado deshecho (o inexistente)' });
});

workspaceRouter.post('/artifact', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  let parsed: z.infer<typeof SaveArtifactSchema>;
  try {
    parsed = SaveArtifactSchema.parse(req.body);
  } catch (err) {
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
    resolved = ResolvedArtifactPath.from(env().workspacesDir, project, parsed.relativePath);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  try {
    const { saveArtifactUseCase } = getUseCasesForProject(project);
    await saveArtifactUseCase.execute(resolved.relativePath, parsed.content);
    res.status(200).json({ message: 'Artefacto guardado con éxito' });
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: 'Error del servidor', details: e.message });
  }
});

workspaceRouter.get('/artifact', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  let resolved: ResolvedArtifactPath;
  try {
    project = ProjectName.from(req.query.projectName);
    resolved = ResolvedArtifactPath.from(env().workspacesDir, project, req.query.relativePath);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  try {
    const { readArtifactUseCase } = getUseCasesForProject(project);
    const content = await readArtifactUseCase.execute(resolved.relativePath);
    if (content === null) {
      res.status(404).json({ error: 'Artefacto no encontrado' });
      return;
    }
    res.status(200).send(content);
  } catch {
    res.status(500).json({ error: 'Error interno leyendo' });
  }
});

workspaceRouter.post('/download-ticket', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  try {
    project = ProjectName.from(req.body?.projectName);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  try {
    await fs.access(path.join(env().workspacesDir, project.value));
  } catch {
    res.status(404).json({ error: 'Proyecto no encontrado' });
    return;
  }
  const user = (req as any).user;
  const ticket = getTicketStore().issue({ projectName: project.value, username: user.username });
  res.status(200).json({ ticket, expiresInSeconds: 30 });
});

workspaceRouter.get('/download/:projectName', async (req: Request, res: Response): Promise<void> => {
  let project: ProjectName;
  try {
    project = ProjectName.from(req.params.projectName);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }
  const ticket = req.query.ticket as string | undefined;
  if (!ticket) {
    res.status(401).json({ error: 'Ticket de descarga requerido' });
    return;
  }
  try {
    getTicketStore().consume(ticket, project.value);
  } catch (e) {
    res.status(401).json({ error: (e as Error).message });
    return;
  }

  const projectPath = path.join(env().workspacesDir, project.value);
  try {
    await fs.access(projectPath);
  } catch {
    res.status(404).json({ error: 'Proyecto no encontrado' });
    return;
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename=${project.value}-sdd-architecture.zip`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', () => { if (!res.headersSent) res.status(500).end(); });
  archive.pipe(res);
  archive.directory(projectPath, false);
  await archive.finalize();
});

workspaceRouter.get('/ai-status', (_req: Request, res: Response): void => {
  const keys = env().aiKeys;
  res.status(200).json({
    serverHasKey: {
      gemini: !!keys.gemini,
      openai: !!keys.openai,
      anthropic: !!keys.anthropic
    }
  });
});

let activeAiModel = 'gemini-1.5-flash';

workspaceRouter.post('/ai-draft', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, provider, systemPrompt, userPrompt } = req.body ?? {};
    const aiProvider = provider || 'gemini';
    const serverKeys = env().aiKeys;
    const envKey =
      aiProvider === 'gemini' ? serverKeys.gemini :
      aiProvider === 'openai' ? serverKeys.openai :
      aiProvider === 'anthropic' ? serverKeys.anthropic : undefined;

    const finalApiKey = envKey || apiKey;
    if (!finalApiKey) {
      res.status(400).json({ error: `La llave de API del proveedor ${String(aiProvider).toUpperCase()} es obligatoria.` });
      return;
    }
    const cleanedKey = String(finalApiKey).trim();

    if (aiProvider === 'openai') {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cleanedKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
        })
      });
      const data = await r.json();
      if (!r.ok) { res.status(r.status).json(data); return; }
      res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
      return;
    }

    if (aiProvider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': cleanedKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-latest',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });
      const data = await r.json();
      if (!r.ok) { res.status(r.status).json(data); return; }
      res.status(200).json({ text: data.content?.[0]?.text || '' });
      return;
    }

    const callGenerate = async (model: string) =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanedKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Sistema: ${systemPrompt}\nRequerimiento: ${userPrompt}` }] }]
        })
      });

    let response = await callGenerate(activeAiModel);
    if (response.status === 404) {
      const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanedKey}`);
      if (listReq.ok) {
        const listData = await listReq.json();
        const fallback = (listData.models || []).find((m: any) =>
          m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'));
        if (fallback) {
          activeAiModel = fallback.name.replace('models/', '');
          response = await callGenerate(activeAiModel);
        }
      }
    }
    const textData = await response.text();
    let data;
    try { data = JSON.parse(textData); } catch { data = { error: { message: 'Respuesta no parseable de Gemini' } }; }
    if (!response.ok) { res.status(response.status).json(data); return; }
    res.status(200).json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: 'Fallo en proxy de IA', details: e.message });
  }
});
