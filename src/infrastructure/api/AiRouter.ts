import { Router, Request, Response } from 'express';
import { authMiddleware, architectOnly } from './middleware/authMiddleware.js';
import type { AiProviderFactory } from '../ai/AiProviderFactory.js';
import type { DraftWithAiUseCase } from '../../application/usecases/DraftWithAiUseCase.js';
import { AiProviderError } from '../../domain/ports/AiProvider.js';
import type { AppEnv } from '../config/env.js';

export interface AiRouterDeps {
  env: Pick<AppEnv, 'aiKeys'>;
  factory: AiProviderFactory;
  buildUseCase: (providerName: string) => DraftWithAiUseCase;
}

export function createAiRouter(deps: AiRouterDeps): Router {
  const router = Router();

  router.get('/ai-status', (_req: Request, res: Response) => {
    const k = deps.env.aiKeys;
    res.status(200).json({
      serverHasKey: { gemini: !!k.gemini, openai: !!k.openai, anthropic: !!k.anthropic }
    });
  });

  router.post('/ai-draft', authMiddleware, architectOnly, async (req: Request, res: Response) => {
    try {
      const { apiKey, provider, systemPrompt, userPrompt } = req.body ?? {};
      const providerName = typeof provider === 'string' && provider.length > 0 ? provider : 'gemini';

      let serverKey: string | undefined;
      if (providerName === 'gemini') serverKey = deps.env.aiKeys.gemini;
      else if (providerName === 'openai') serverKey = deps.env.aiKeys.openai;
      else if (providerName === 'anthropic') serverKey = deps.env.aiKeys.anthropic;

      const finalKey = serverKey || apiKey;
      if (!finalKey) {
        res.status(400).json({ error: `La llave de API del proveedor ${providerName.toUpperCase()} es obligatoria.` });
        return;
      }

      const useCase = deps.buildUseCase(providerName);
      const out = await useCase.execute({
        systemPrompt: String(systemPrompt ?? ''),
        userPrompt: String(userPrompt ?? ''),
        apiKey: String(finalKey)
      });
      res.status(200).json({ text: out.text });
    } catch (err) {
      if (err instanceof AiProviderError) {
        res.status(err.upstreamStatus).json(err.upstreamBody ?? { error: err.message });
        return;
      }
      res.status(500).json({ error: 'Fallo en proxy de IA', details: (err as Error).message });
    }
  });

  return router;
}
