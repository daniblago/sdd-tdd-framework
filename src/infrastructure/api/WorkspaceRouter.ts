import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import archiver from 'archiver';
import jwt from 'jsonwebtoken';
import { SaveArtifactUseCase } from '../../application/usecases/SaveArtifactUseCase.js';
import { ReadArtifactUseCase } from '../../application/usecases/ReadArtifactUseCase.js';
import { LocalFileSystemAdapter } from '../filesystem/LocalFileSystemAdapter.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export const workspaceRouter = Router();

const DEFAULT_WORKSPACES_DIR = path.join(process.cwd(), 'workspaces');
const JWT_SECRET = process.env.JWT_SECRET || 'sdd_super_secret_local_key';

const ensureWorkspacesDir = async () => {
   try { await fs.mkdir(DEFAULT_WORKSPACES_DIR, { recursive: true }); } catch (e) {}
}
ensureWorkspacesDir();

const getUseCasesForProject = (projectName: string) => {
  const projectRoot = path.join(DEFAULT_WORKSPACES_DIR, projectName);
  const fsAdapter = new LocalFileSystemAdapter(projectRoot);
  return {
    saveArtifactUseCase: new SaveArtifactUseCase(fsAdapter),
    readArtifactUseCase: new ReadArtifactUseCase(fsAdapter)
  };
};

const SaveArtifactSchema = z.object({
  projectName: z.string().min(1, 'El projectName es requerido').regex(/^[a-zA-Z0-9_-]+$/, 'Hack Prevented: Nombres de proyecto inválidos.'),
  relativePath: z.string().min(1, 'El relativePath es requerido').refine(val => !val.includes('..'), { message: 'Hack Prevented: Path Traversal detectado.'}),
  content: z.string()
});

// Middleware JWT
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : req.query.token as string;
  if (!token) {
     res.status(401).json({ error: 'Falta Token de Acceso' });
     return;
  }
  try {
     const decoded = jwt.verify(token, JWT_SECRET) as any;
     (req as any).user = decoded;
     next();
  } catch(e) {
     res.status(401).json({ error: 'Token Inválido o Expirado' });
  }
};

const architectOnly = (req: Request, res: Response, next: NextFunction): void => {
   if ((req as any).user?.role !== 'ARCHITECT') {
      res.status(403).json({ error: 'OWASP 403: Acción bloqueada. No posees rol ARCHITECT.' });
      return;
   }
   next();
};

workspaceRouter.get('/projects', authMiddleware, async (req: Request, res: Response): Promise<void> => {
   try {
     const entries = await fs.readdir(DEFAULT_WORKSPACES_DIR, { withFileTypes: true });
     const projects = entries.filter(e => e.isDirectory()).map(e => e.name);
     res.status(200).json({ projects });
   } catch(err) {
     res.status(500).json({ error: 'Error leyendo proyectos' });
   }
});

workspaceRouter.post('/projects', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
   try {
     const { projectName } = req.body;
     if (!projectName) { res.status(400).json({ error: 'projectName requerido' }); return; }
     if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) { res.status(400).json({ error: 'Protección Path Traversal' }); return; }
     const targetPath = path.join(DEFAULT_WORKSPACES_DIR, projectName);
     await fs.mkdir(targetPath, { recursive: true });
     res.status(200).json({ message: 'OK', project: projectName });
   } catch(err) {
     res.status(500).json({ error: 'Error creando proyecto' });
   }
});

// -- Sistema de Sellado (Bóveda) -- //
workspaceRouter.get('/seal', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
     const projectName = req.query.projectName as string;
     if(!projectName || !/^[a-zA-Z0-9_-]+$/.test(projectName)) { res.status(400).json({error: 'projectName faltante o inválido'}); return; }
     const sealPath = path.join(DEFAULT_WORKSPACES_DIR, projectName, '.sdd-sealed');
     try {
        await fs.access(sealPath);
        res.status(200).json({ isSealed: true });
     } catch {
        res.status(200).json({ isSealed: false });
     }
  } catch(e) {
     res.status(500).json({ error: 'Error leyendo sellado' });
  }
});

workspaceRouter.post('/seal', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  try {
     const { projectName } = req.body;
     if(!projectName || !/^[a-zA-Z0-9_-]+$/.test(projectName)) { res.status(400).json({error: 'projectName faltante o inválido'}); return; }
     const sealPath = path.join(DEFAULT_WORKSPACES_DIR, projectName, '.sdd-sealed');
     await fs.writeFile(sealPath, 'SEALED', 'utf8');
     res.status(200).json({ message: 'Proyecto sellado con éxito' });
  } catch(e) {
     res.status(500).json({ error: 'Error al sellar' });
  }
});

workspaceRouter.delete('/seal/:projectName', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  try {
     const projectName = req.params.projectName as string;
     if(!projectName || !/^[a-zA-Z0-9_-]+$/.test(projectName)) { res.status(400).json({error: 'projectName faltante o inválido'}); return; }
     const sealPath = path.join(DEFAULT_WORKSPACES_DIR, projectName, '.sdd-sealed');
     await fs.unlink(sealPath);
     res.status(200).json({ message: 'Candado removido' });
  } catch(e) {
     res.status(200).json({ message: 'Candado deshecho (o inexistente)' });
  }
});

workspaceRouter.post('/artifact', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = SaveArtifactSchema.parse(req.body);
    const { saveArtifactUseCase } = getUseCasesForProject(parsed.projectName);
    await saveArtifactUseCase.execute(parsed.relativePath, parsed.content);

    res.status(200).json({ message: 'Artefacto guardado con éxito' });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
       res.status(400).json({ error: 'Validación fallida LFI interceptado', details: err.issues });
       return;
    }
    const e = err as Error;
    res.status(500).json({ error: 'Error del servidor', details: e.message });
  }
});

workspaceRouter.get('/download/:projectName', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
     const projectName = req.params.projectName as string;
     if(!projectName || !/^[a-zA-Z0-9_-]+$/.test(projectName)) { res.status(400).json({error: 'projectName faltante o inválido'}); return; }
     const projectPath = path.join(DEFAULT_WORKSPACES_DIR, projectName);

     try {
       await fs.access(projectPath);
     } catch (err) {
       res.status(404).json({ error: 'Proyecto no encontrado' });
       return;
     }

     res.setHeader('Content-Type', 'application/zip');
     res.setHeader('Content-Disposition', `attachment; filename=${projectName}-sdd-architecture.zip`);

     const archive = archiver('zip', { zlib: { level: 9 } });

     archive.on('error', function(err) {
       if (!res.headersSent) res.status(500).end();
     });

     archive.pipe(res);
     archive.directory(projectPath, false);
     await archive.finalize();

  } catch(e) {
     if (!res.headersSent) res.status(500).json({ error: 'Error interno generando ZIP' });
  }
});

workspaceRouter.get('/artifact', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const relativePath = req.query.relativePath as string;
    const projectName = req.query.projectName as string;
    if (!relativePath || !projectName) {
      res.status(400).json({ error: 'Faltan parámetros relativePath o projectName' });
      return;
    }
    if(!/^[a-zA-Z0-9_-]+$/.test(projectName) || relativePath.includes('..')) { res.status(400).json({error: 'Validación LFI fallida'}); return; }

    const { readArtifactUseCase } = getUseCasesForProject(projectName);
    const content = await readArtifactUseCase.execute(relativePath);
    if (content === null) {
      res.status(404).json({ error: 'Artefacto no encontrado' });
      return;
    }
    res.status(200).send(content);
  } catch (err: any) {
    res.status(500).json({ error: 'Error interno leyendo' });
  }
});

let activeAiModel = 'gemini-1.5-flash';

// AI Status no necesita token
workspaceRouter.get('/ai-status', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ serverHasKey: !!process.env.GEMINI_API_KEY });
});

workspaceRouter.post('/ai-draft', authMiddleware, architectOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, systemPrompt, userPrompt } = req.body;
    
    const finalApiKey = process.env.GEMINI_API_KEY || apiKey;
    if (!finalApiKey) {
       res.status(400).json({ error: 'La llave de API de Gemini es obligatoria.' });
       return;
    }

    const cleanedKey = finalApiKey.trim();
    
    const callGenerate = async (model: string) => {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanedKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Sistema: ${systemPrompt}\nRequerimiento: ${userPrompt}` }] }]
        })
      });
    };

    let response = await callGenerate(activeAiModel);

    if (response.status === 404) {
      const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanedKey}`);
      if (listReq.ok) {
         const listData = await listReq.json();
         const validFallback = (listData.models || []).find((m: any) => 
           m.name.includes("gemini") && m.supportedGenerationMethods?.includes("generateContent")
         );
         if (validFallback) {
            activeAiModel = validFallback.name.replace('models/', '');
            response = await callGenerate(activeAiModel);
         }
      }
    }

    const textData = await response.text();
    let data;
    try { data = JSON.parse(textData); } catch(e) { data = { error: { message: "Error in-parseable de Gemini: " + textData.substring(0, 100) } }; }
    
    if (!response.ok) {
       res.status(response.status).json(data);
       return;
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text: outputText });
  } catch (err: any) {
    res.status(500).json({ error: 'Fallo fatal en proxy remoto', details: err.message });
  }
});
