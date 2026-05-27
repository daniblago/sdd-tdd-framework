import { Router, Request, Response } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { BcryptHasher } from '../security/BcryptHasher.js';
import { JsonUserRepository } from '../security/JsonUserRepository.js';
import { LoginUseCase } from '../../application/usecases/LoginUseCase.js';

let loginUseCaseSingleton: LoginUseCase | null = null;
function getLoginUseCase(): LoginUseCase {
  if (loginUseCaseSingleton) return loginUseCaseSingleton;
  const hasher = new BcryptHasher(env().bcryptCost);
  const repo = new JsonUserRepository(path.join(process.cwd(), 'users.json'), hasher);
  loginUseCaseSingleton = new LoginUseCase(repo, hasher);
  return loginUseCaseSingleton;
}

export function resetAuthForTests(): void {
  loginUseCaseSingleton = null;
}

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    res.status(400).json({ error: 'Credenciales incompletas' });
    return;
  }

  const result = await getLoginUseCase().execute(username, password);
  if (result.outcome === 'invalid_credentials') {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const token = jwt.sign(
    { username: result.user.username, role: result.user.role },
    env().jwtSecret,
    { expiresIn: '8h' }
  );
  res.status(200).json({ status: 'ok', token, user: result.user });
});
