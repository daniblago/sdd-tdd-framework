import { Router, Request, Response } from 'express';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Credenciales incompletas' });
    return;
  }

  // Bóveda de usuarios In-Memory respaldada por Variables de Entorno (.env)
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'architect123';
  const DEV_USER = process.env.DEV_USER || 'dev';
  const DEV_PASS = process.env.DEV_PASS || 'dev123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.status(200).json({ status: 'ok', user: { username: ADMIN_USER, role: 'ARCHITECT' } });
    return;
  }

  if (username === DEV_USER && password === DEV_PASS) {
    res.status(200).json({ status: 'ok', user: { username: DEV_USER, role: 'DEVELOPER' } });
    return;
  }

  res.status(401).json({ error: 'Credenciales Inválidas' });
});
