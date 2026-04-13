import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

const USERS_FILE = path.join(process.cwd(), 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'sdd_super_secret_local_key';

const DEFAULT_USERS = [
  { username: 'admin', password: 'architect123', role: 'ARCHITECT' },
  { username: 'dev', password: 'dev123', role: 'DEVELOPER' }
];

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf8');
      return DEFAULT_USERS;
    }
    return DEFAULT_USERS; 
  }
}

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Credenciales incompletas' });
    return;
  }

  const users = await loadUsers();
  
  const userMatch = users.find((u: any) => u.username === username && u.password === password);

  if (userMatch) {
    const token = jwt.sign({ username: userMatch.username, role: userMatch.role }, JWT_SECRET, { expiresIn: '8h' });
    res.status(200).json({ status: 'ok', token, user: { username: userMatch.username, role: userMatch.role } });
    return;
  }

  res.status(401).json({ error: 'Credenciales Inválidas' });
});
