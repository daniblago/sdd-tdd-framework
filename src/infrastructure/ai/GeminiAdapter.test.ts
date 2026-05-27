import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeminiAdapter } from './GeminiAdapter.js';

describe('GeminiAdapter', () => {
  beforeEach(() => { vi.unstubAllGlobals(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('name = gemini', () => {
    expect(new GeminiAdapter().name).toBe('gemini');
  });

  it('llama al endpoint generateContent con el modelo por defecto', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200,
      text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'hola Gemini' }] } }] })
    } as any);
    vi.stubGlobal('fetch', fetchMock);

    const out = await new GeminiAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'AIza' });
    expect(out.text).toBe('hola Gemini');
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('gemini-1.5-flash:generateContent');
    expect(String(url)).toContain('key=AIza');
  });

  it('cuando el modelo default da 404, lista modelos y reintenta con un fallback compatible', async () => {
    const calls: string[] = [];
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      calls.push(url);
      if (url.includes(':generateContent') && url.includes('gemini-1.5-flash:')) {
        return { ok: false, status: 404, text: async () => '{}' };
      }
      if (url.includes('/v1beta/models?key=')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            models: [
              { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] }
            ]
          })
        };
      }
      if (url.includes('gemini-2.0-flash:generateContent')) {
        return { ok: true, status: 200, text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'fallback ok' }] } }] }) };
      }
      throw new Error('Unexpected url ' + url);
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = new GeminiAdapter();
    const out = await adapter.generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'AIza' });
    expect(out.text).toBe('fallback ok');
    expect(calls.some(c => c.includes('gemini-1.5-flash'))).toBe(true);
    expect(calls.some(c => c.includes('/v1beta/models'))).toBe(true);
    expect(calls.some(c => c.includes('gemini-2.0-flash'))).toBe(true);
  });

  it('recuerda el modelo descubierto entre llamadas (cache per instancia)', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 404, text: async () => '{}' }) // 1st default fails
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ models: [{ name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] }] }) })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'first' }] } }] }) })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'second' }] } }] }) });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = new GeminiAdapter();
    await adapter.generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'k' });
    await adapter.generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'k' });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(String(fetchMock.mock.calls[3][0])).toContain('gemini-2.0-flash:generateContent');
  });

  it('lanza AiProviderError si tras el fallback la respuesta sigue mal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => '{"error":"boom"}' } as any));
    await expect(new GeminiAdapter().generate({ systemPrompt: 's', userPrompt: 'u', apiKey: 'k' }))
      .rejects.toMatchObject({ name: 'AiProviderError', upstreamStatus: 500 });
  });
});
