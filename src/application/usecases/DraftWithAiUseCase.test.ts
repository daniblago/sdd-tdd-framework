import { describe, it, expect, vi } from 'vitest';
import { DraftWithAiUseCase } from './DraftWithAiUseCase.js';
import type { AiProvider } from '../../domain/ports/AiProvider.js';
import { AiProviderError } from '../../domain/ports/AiProvider.js';

const fakeProvider = (impl: AiProvider['generate']): AiProvider => ({
  name: 'fake',
  generate: impl
});

describe('DraftWithAiUseCase', () => {
  it('delega en el proveedor y devuelve el texto', async () => {
    const provider = fakeProvider(async ({ systemPrompt, userPrompt, apiKey }) => {
      expect(systemPrompt).toBe('sys');
      expect(userPrompt).toBe('usr');
      expect(apiKey).toBe('k');
      return { text: 'borrador' };
    });
    const result = await new DraftWithAiUseCase(provider).execute({ systemPrompt: 'sys', userPrompt: 'usr', apiKey: 'k' });
    expect(result.text).toBe('borrador');
  });

  it('valida que apiKey esté presente', async () => {
    const provider = fakeProvider(vi.fn());
    const uc = new DraftWithAiUseCase(provider);
    await expect(uc.execute({ systemPrompt: 's', userPrompt: 'u', apiKey: '' })).rejects.toThrow(/api key/i);
    await expect(uc.execute({ systemPrompt: 's', userPrompt: 'u', apiKey: '   ' })).rejects.toThrow(/api key/i);
    expect(provider.generate).not.toHaveBeenCalled();
  });

  it('propaga AiProviderError sin envolverlo', async () => {
    const provider = fakeProvider(async () => { throw new AiProviderError('upstream', 401, { error: 'invalid' }); });
    const uc = new DraftWithAiUseCase(provider);
    await expect(uc.execute({ systemPrompt: 's', userPrompt: 'u', apiKey: 'k' })).rejects.toThrowError(AiProviderError);
  });
});
