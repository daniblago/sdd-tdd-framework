import type { AiProvider, AiGenerateRequest, AiGenerateResult } from '../../domain/ports/AiProvider.js';

export class DraftWithAiUseCase {
  constructor(private readonly provider: AiProvider) {}

  async execute(request: AiGenerateRequest): Promise<AiGenerateResult> {
    if (!request.apiKey || request.apiKey.trim() === '') {
      throw new Error('API key requerida');
    }
    return this.provider.generate({
      systemPrompt: request.systemPrompt,
      userPrompt: request.userPrompt,
      apiKey: request.apiKey.trim()
    });
  }
}
