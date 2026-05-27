import { AiProvider, AiGenerateRequest, AiGenerateResult, AiProviderError } from '../../domain/ports/AiProvider.js';

const OPENAI_MODEL = 'gpt-4o';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAiAdapter implements AiProvider {
  readonly name = 'openai';

  async generate({ systemPrompt, userPrompt, apiKey }: AiGenerateRequest): Promise<AiGenerateResult> {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const data: any = await res.json();
    if (!res.ok) {
      throw new AiProviderError('OpenAI rechazó la petición', res.status, data);
    }
    return { text: data?.choices?.[0]?.message?.content ?? '' };
  }
}
