import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DownloadTicketStore } from './DownloadTicket.js';

describe('DownloadTicketStore', () => {
  let store: DownloadTicketStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new DownloadTicketStore({ ttlMs: 30_000, secret: 'test-secret-32-chars-long-yes-yes' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emite un ticket válido para un proyecto y usuario', () => {
    const ticket = store.issue({ projectName: 'residentapp', username: 'admin' });
    expect(typeof ticket).toBe('string');
    expect(ticket.length).toBeGreaterThan(20);
  });

  it('consume un ticket válido y devuelve el contexto', () => {
    const ticket = store.issue({ projectName: 'residentapp', username: 'admin' });
    const claims = store.consume(ticket, 'residentapp');
    expect(claims).toEqual({ projectName: 'residentapp', username: 'admin' });
  });

  it('rechaza un ticket consumido dos veces (one-time use)', () => {
    const ticket = store.issue({ projectName: 'residentapp', username: 'admin' });
    store.consume(ticket, 'residentapp');
    expect(() => store.consume(ticket, 'residentapp')).toThrow(/inválido|consumido/i);
  });

  it('rechaza un ticket caducado', () => {
    const ticket = store.issue({ projectName: 'residentapp', username: 'admin' });
    vi.advanceTimersByTime(31_000);
    expect(() => store.consume(ticket, 'residentapp')).toThrow(/expirado/i);
  });

  it('rechaza un ticket emitido para otro proyecto', () => {
    const ticket = store.issue({ projectName: 'residentapp', username: 'admin' });
    expect(() => store.consume(ticket, 'otro-proyecto')).toThrow(/proyecto/i);
  });

  it('rechaza un ticket alterado', () => {
    const ticket = store.issue({ projectName: 'residentapp', username: 'admin' });
    const tampered = ticket.slice(0, -2) + 'xx';
    expect(() => store.consume(tampered, 'residentapp')).toThrow(/inválido/i);
  });

  it('rechaza un ticket completamente falso', () => {
    expect(() => store.consume('garbage', 'residentapp')).toThrow(/inválido/i);
    expect(() => store.consume('', 'residentapp')).toThrow(/inválido/i);
  });

  it('emite tickets distintos para invocaciones idénticas', () => {
    const a = store.issue({ projectName: 'residentapp', username: 'admin' });
    const b = store.issue({ projectName: 'residentapp', username: 'admin' });
    expect(a).not.toBe(b);
  });

  it('cleanup elimina tickets caducados', () => {
    store.issue({ projectName: 'residentapp', username: 'admin' });
    store.issue({ projectName: 'residentapp', username: 'admin' });
    vi.advanceTimersByTime(31_000);
    expect(store.size()).toBe(2);
    store.cleanup();
    expect(store.size()).toBe(0);
  });
});
