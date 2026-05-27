import crypto from 'crypto';

export interface TicketClaims {
  projectName: string;
  username: string;
}

interface StoredTicket {
  claims: TicketClaims;
  expiresAt: number;
}

export interface DownloadTicketStoreOptions {
  ttlMs: number;
  secret: string;
}

export class DownloadTicketStore {
  private readonly tickets = new Map<string, StoredTicket>();

  constructor(private readonly options: DownloadTicketStoreOptions) {
    if (!options.secret || options.secret.length < 16) {
      throw new Error('DownloadTicketStore requiere un secreto de al menos 16 caracteres');
    }
  }

  issue(claims: TicketClaims): string {
    const id = crypto.randomBytes(18).toString('base64url');
    const expiresAt = Date.now() + this.options.ttlMs;
    const signature = this.sign(id, claims, expiresAt);
    this.tickets.set(id, { claims, expiresAt });
    return `${id}.${expiresAt}.${signature}`;
  }

  consume(token: string, expectedProject: string): TicketClaims {
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error('Ticket inválido');
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Ticket inválido');
    }
    const [id, expiresAtRaw, signature] = parts;
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt)) {
      throw new Error('Ticket inválido');
    }

    const stored = this.tickets.get(id);
    if (!stored) {
      throw new Error('Ticket inválido o consumido');
    }
    const expectedSig = this.sign(id, stored.claims, stored.expiresAt);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('Ticket inválido');
    }
    if (stored.expiresAt !== expiresAt) {
      throw new Error('Ticket inválido');
    }

    this.tickets.delete(id);

    if (Date.now() > stored.expiresAt) {
      throw new Error('Ticket expirado');
    }
    if (stored.claims.projectName !== expectedProject) {
      throw new Error('Ticket emitido para otro proyecto');
    }
    return stored.claims;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [id, t] of this.tickets) {
      if (t.expiresAt <= now) this.tickets.delete(id);
    }
  }

  size(): number {
    return this.tickets.size;
  }

  private sign(id: string, claims: TicketClaims, expiresAt: number): string {
    return crypto
      .createHmac('sha256', this.options.secret)
      .update(`${id}.${claims.projectName}.${claims.username}.${expiresAt}`)
      .digest('base64url');
  }
}
