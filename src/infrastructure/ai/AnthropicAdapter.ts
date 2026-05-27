import { AiProvider, AiGenerateRequest, AiGenerateResult, AiProviderError } from '../../domain/ports/AiProvider.js';

const ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS = 4096;

export class AnthropicAdapter implements AiProvider {
  readonly name = 'anthropic';

  async generate({ systemPrompt, userPrompt, apiKey }: AiGenerateRequest): Promise<AiGenerateResult> {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });
    const data: any = await res.json();
    if (!res.ok) {
      throw new AiProviderError('Anthropic rechazó la petición', res.status, data);
    }
    return { text: data?.content?.[0]?.text ?? '' };
  }
}
