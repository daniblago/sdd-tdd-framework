import { describe, it, expect } from 'vitest';
import { AiProviderFactory } from './AiProviderFactory.js';

describe('AiProviderFactory', () => {
  const factory = new AiProviderFactory();

  it('resuelve openai/anthropic/gemini', () => {
    expect(factory.get('openai').name).toBe('openai');
    expect(factory.get('anthropic').name).toBe('anthropic');
    expect(factory.get('gemini').name).toBe('gemini');
  });

  it('por defecto resuelve gemini', () => {
    expect(factory.get(undefined).name).toBe('gemini');
    expect(factory.get('').name).toBe('gemini');
  });

  it('rechaza nombres desconocidos', () => {
    expect(() => factory.get('llama')).toThrow(/proveedor/i);
  });

  it('cachea instancias por nombre (mismo objeto en llamadas sucesivas)', () => {
    const a = factory.get('openai');
    const b = factory.get('openai');
    expect(a).toBe(b);
  });
});
