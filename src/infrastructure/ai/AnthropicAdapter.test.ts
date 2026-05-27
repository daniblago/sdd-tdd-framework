import { describe, it, expect, afterEach, vi } from 'vitest';
import { AnthropicAdapter } from './AnthropicAdapter.js';

describe('AnthropicAdapter', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('name = anthropic', () => {
    expect(new AnthropicAdapter().name).toBe('anthropic');
  });

  it('llama al endpoint /v1/messages con headers x-api-key y anthropic-version', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ content: [{ text: 'hola Claude' }] })
    } as any);
    vi.stubGlobal('fetch', fetchMock);

    const out = await new AnthropicAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'sk-ant' });
    expect(out.text).toBe('hola Claude');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect((init as any).headers['x-api-key']).toBe('sk-ant');
    expect((init as any).headers['anthropic-version']).toBe('2023-06-01');
    const body = JSON.parse((init as any).body);
    expect(body.system).toBe('s');
    expect(body.messages).toEqual([{ role: 'user', content: 'u' }]);
    expect(body.max_tokens).toBeGreaterThan(0);
  });

  it('lanza AiProviderError si upstream falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 429, json: async () => ({ error: 'rate' })
    } as any));
    await expect(new AnthropicAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'k' }))
      .rejects.toMatchObject({ name: 'AiProviderError', upstreamStatus: 429 });
  });
});
