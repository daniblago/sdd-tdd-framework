import { Router, Request, Response } from 'express';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Credenciales incompletas' });
    return;
  }

  // Bóveda de usuarios in-memory Hardcodeada
  if (username === 'admin' && password === 'architect123') {
    res.status(200).json({ status: 'ok', user: { username: 'admin', role: 'ARCHITECT' } });
    return;
  }

  if (username === 'dev' && password === 'dev123') {
    res.status(200).json({ status: 'ok', user: { username: 'dev', role: 'DEVELOPER' } });
    return;
  }

  res.status(401).json({ error: 'Credenciales Inválidas' });
});
