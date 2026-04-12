import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { SaveArtifactUseCase } from '../../application/usecases/SaveArtifactUseCase.js';
import { ReadArtifactUseCase } from '../../application/usecases/ReadArtifactUseCase.js';
import { LocalFileSystemAdapter } from '../filesystem/LocalFileSystemAdapter.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export const workspaceRouter = Router();

const DEFAULT_WORKSPACES_DIR = path.join(process.cwd(), 'workspaces');

// Ensure base dir exists
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
  projectName: z.string().min(1, 'El projectName es requerido'),
  relativePath: z.string().min(1, 'El relativePath es requerido'),
  content: z.string()
});

workspaceRouter.get('/projects', async (req: Request, res: Response): Promise<void> => {
   try {
     const entries = await fs.readdir(DEFAULT_WORKSPACES_DIR, { withFileTypes: true });
     const projects = entries.filter(e => e.isDirectory()).map(e => e.name);
     res.status(200).json({ projects });
   } catch(err) {
     res.status(500).json({ error: 'Error leyendo proyectos' });
   }
});

workspaceRouter.post('/projects', async (req: Request, res: Response): Promise<void> => {
   try {
     const { projectName } = req.body;
     if (!projectName) { res.status(400).json({ error: 'projectName requerido' }); return; }
     const targetPath = path.join(DEFAULT_WORKSPACES_DIR, projectName);
     await fs.mkdir(targetPath, { recursive: true });
     res.status(200).json({ message: 'OK', project: projectName });
   } catch(err) {
     res.status(500).json({ error: 'Error creando proyecto' });
   }
});

workspaceRouter.post('/artifact', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = SaveArtifactSchema.parse(req.body);
    const { saveArtifactUseCase } = getUseCasesForProject(parsed.projectName);
    await saveArtifactUseCase.execute(parsed.relativePath, parsed.content);
    res.status(200).json({ message: 'Artefacto guardado', path: parsed.relativePath });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validación fallida', details: err.issues });
    } else {
      res.status(500).json({ error: 'Error interno guardando' });
    }
  }
});

workspaceRouter.get('/artifact', async (req: Request, res: Response): Promise<void> => {
  try {
    const relativePath = req.query.relativePath as string;
    const projectName = req.query.projectName as string;
    if (!relativePath || !projectName) {
      res.status(400).json({ error: 'Faltan parámetros relativePath o projectName' });
      return;
    }
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

/**
 * Endpoint Proxy para evadir bloqueos de CORS, Firewall y AdBlocks de los navegadores.
 * Despacha de forma segura la llamada al API de Google Gemini vía Node.js nativo (fetch).
 */
let activeAiModel = 'gemini-1.5-flash';

workspaceRouter.post('/ai-draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, systemPrompt, userPrompt } = req.body;
    
    if (!apiKey) {
       res.status(400).json({ error: 'La llave de API de Gemini es obligatoria.' });
       return;
    }

    const cleanedKey = apiKey.trim();
    
    // Helper funct para llamar generateContent
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

    // Auto-negociación: Si Google nos bloquea el modelo por región/deprecación (404), listamos los modelos
    if (response.status === 404) {
      console.log(`[Proxy] El modelo ${activeAiModel} fue averiado (404). Negociando el mejor modelo de reemplazo...`);
      const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanedKey}`);
      
      if (listReq.ok) {
         const listData = await listReq.json();
         const availableModels = listData.models || [];
         
         const validFallback = availableModels.find((m: any) => 
           m.name.includes("gemini") && 
           m.supportedGenerationMethods?.includes("generateContent")
         );
         
         if (validFallback) {
            activeAiModel = validFallback.name.replace('models/', '');
            console.log(`[Proxy] Fallback Exitoso. Motor IA actualizado permanentemente a: ${activeAiModel}`);
            response = await callGenerate(activeAiModel);
         }
      }
    }

    const textData = await response.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch(e) {
      data = { error: { message: "Error in-parseable de Gemini: " + textData.substring(0, 100) } };
    }
    
    if (!response.ok) {
       res.status(response.status).json(data);
       return;
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text: outputText });
  } catch (err: any) {
    console.error('[Error en AI Proxy Node]:', err);
    res.status(500).json({ error: 'Fallo fatal en proxy remoto', details: err.message });
  }
});
