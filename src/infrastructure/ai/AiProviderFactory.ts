import type { AiProvider } from '../../domain/ports/AiProvider.js';
import { OpenAiAdapter } from './OpenAiAdapter.js';
import { AnthropicAdapter } from './AnthropicAdapter.js';
import { GeminiAdapter } from './GeminiAdapter.js';

const SUPPORTED = ['gemini', 'openai', 'anthropic'] as const;
type Supported = (typeof SUPPORTED)[number];
const DEFAULT_PROVIDER: Supported = 'gemini';

export class AiProviderFactory {
  private readonly cache = new Map<Supported, AiProvider>();

  get(name?: string | null): AiProvider {
    const resolved = (name && name.length > 0 ? name : DEFAULT_PROVIDER) as Supported;
    if (!SUPPORTED.includes(resolved)) {
      throw new Error(`Proveedor de IA no soportado: "${name}"`);
    }
    const cached = this.cache.get(resolved);
    if (cached) return cached;
    const instance = this.build(resolved);
    this.cache.set(resolved, instance);
    return instance;
  }

  private build(name: Supported): AiProvider {
    switch (name) {
      case 'openai': return new OpenAiAdapter();
      case 'anthropic': return new AnthropicAdapter();
      case 'gemini': return new GeminiAdapter();
    }
  }
}
