import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenAiAdapter } from './OpenAiAdapter.js';
import { AiProviderError } from '../../domain/ports/AiProvider.js';

describe('OpenAiAdapter', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('name = openai', () => {
    expect(new OpenAiAdapter().name).toBe('openai');
  });

  it('llama al endpoint chat/completions con Authorization Bearer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ choices: [{ message: { content: 'hola' } }] })
    } as any);
    vi.stubGlobal('fetch', fetchMock);

    const out = await new OpenAiAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'sk-test' });
    expect(out.text).toBe('hola');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect((init as any).headers.Authorization).toBe('Bearer sk-test');
    const body = JSON.parse((init as any).body);
    expect(body.model).toBe('gpt-4o');
    expect(body.messages).toEqual([
      { role: 'system', content: 's' },
      { role: 'user', content: 'u' }
    ]);
  });

  it('lanza AiProviderError con status del upstream cuando no es ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 401,
      json: async () => ({ error: 'invalid' })
    } as any));
    await expect(new OpenAiAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'bad' }))
      .rejects.toMatchObject({ name: 'AiProviderError', upstreamStatus: 401 });
  });

  it('devuelve text="" si la respuesta no trae content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ choices: [] })
    } as any));
    const out = await new OpenAiAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'k' });
    expect(out.text).toBe('');
  });
});
