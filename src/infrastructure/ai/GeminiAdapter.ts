import { AiProvider, AiGenerateRequest, AiGenerateResult, AiProviderError } from '../../domain/ports/AiProvider.js';

const DEFAULT_MODEL = 'gemini-1.5-flash';
const GENERATE_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
const LIST_MODELS_URL = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

export class GeminiAdapter implements AiProvider {
  readonly name = 'gemini';
  private activeModel = DEFAULT_MODEL;

  async generate({ systemPrompt, userPrompt, apiKey }: AiGenerateRequest): Promise<AiGenerateResult> {
    let response = await this.callGenerate(this.activeModel, apiKey, systemPrompt, userPrompt);
    if (response.status === 404) {
      const fallback = await this.discoverFallback(apiKey);
      if (fallback) {
        this.activeModel = fallback;
        response = await this.callGenerate(fallback, apiKey, systemPrompt, userPrompt);
      }
    }
    const rawText = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { error: { message: 'Respuesta no parseable de Gemini' } };
    }
    if (!response.ok) {
      throw new AiProviderError('Gemini rechazó la petición', response.status, parsed);
    }
    return { text: parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
  }

  private callGenerate(model: string, apiKey: string, systemPrompt: string, userPrompt: string): Promise<Response> {
    return fetch(GENERATE_URL(model, apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Sistema: ${systemPrompt}\nRequerimiento: ${userPrompt}` }] }]
      })
    });
  }

  private async discoverFallback(apiKey: string): Promise<string | null> {
    const res = await fetch(LIST_MODELS_URL(apiKey));
    if (!res.ok) return null;
    const data: any = await res.json();
    const candidate = (data?.models ?? []).find((m: any) =>
      typeof m.name === 'string' &&
      m.name.includes('gemini') &&
      m.supportedGenerationMethods?.includes('generateContent')
    );
    if (!candidate) return null;
    return candidate.name.replace('models/', '');
  }
}
