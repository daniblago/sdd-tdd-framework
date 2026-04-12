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

/**
 * Endpoint Proxy para evadir bloqueos de CORS, Firewall y AdBlocks de los navegadores.
 * Despacha de forma segura la llamada al API de Google Gemini vía Node.js nativo (fetch).
 */
workspaceRouter.post('/ai-draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, systemPrompt, userPrompt } = req.body;
    
    if (!apiKey) {
       res.status(400).json({ error: 'La llave de API de Gemini es obligatoria.' });
       return;
    }

    const cleanedKey = apiKey.trim();
    let initialModel = 'gemini-1.5-flash';
    
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

    let response = await callGenerate(initialModel);

    // Auto-negociación: Si Google nos bloquea el modelo por región/deprecación (404), listamos los modelos
    if (response.status === 404) {
      console.log(`[Proxy] El modelo ${initialModel} fue rechazado por 404. Negociando modelos disponibles...`);
      const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanedKey}`);
      
      if (listReq.ok) {
         const listData = await listReq.json();
         const availableModels = listData.models || [];
         
         const validFallback = availableModels.find((m: any) => 
           m.name.includes("gemini") && 
           m.supportedGenerationMethods?.includes("generateContent")
         );
         
         if (validFallback) {
            const fallbackModelName = validFallback.name.replace('models/', '');
            console.log(`[Proxy] Fallback Inteligente activado. Usando: ${fallbackModelName}`);
            response = await callGenerate(fallbackModelName);
         }
      }
    }

    const data = await response.json();
    if (!response.ok) {
       res.status(response.status).json(data);
       return;
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text: outputText });
  } catch (err: any) {
    console.error('[Error en AI Proxy Node]:', err);
    res.status(500).json({ error: 'Fallo fatal en el servidor proxy conectando con Gemini.' });
  }
});
