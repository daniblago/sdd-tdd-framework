import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: { username: string; role: string };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Falta token de acceso (header Authorization: Bearer ...)' });
    return;
  }
  try {
    const decoded = jwt.verify(header.slice(7), env().jwtSecret) as { username: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function architectOnly(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ARCHITECT') {
    res.status(403).json({ error: 'Acción restringida al rol ARCHITECT' });
    return;
  }
  next();
}
