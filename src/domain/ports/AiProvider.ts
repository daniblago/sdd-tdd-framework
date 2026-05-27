export interface AiGenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
}

export interface AiGenerateResult {
  text: string;
}

export class AiProviderError extends Error {
  constructor(message: string, public readonly upstreamStatus: number, public readonly upstreamBody?: unknown) {
    super(message);
    this.name = 'AiProviderError';
  }
}

export interface AiProvider {
  readonly name: string;
  generate(request: AiGenerateRequest): Promise<AiGenerateResult>;
}
