#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';
import { ContractExtractor } from '../src/contract/ContractExtractor.js';
import { RouterIntrospector } from '../src/contract/RouterIntrospector.js';
import { SpecChecker } from '../src/contract/SpecChecker.js';
import { authRouter } from '../src/infrastructure/api/AuthRouter.js';
import { createWorkspaceRouter, resetWorkspaceForTests } from '../src/infrastructure/api/WorkspaceRouter.js';
import { resetEnvForTests } from '../src/infrastructure/config/env.js';

const CONTRACT_PATH = path.join(process.cwd(), 'contracts', 'api-core.yaml');

async function main(): Promise<void> {
  // Carga del contrato
  const yamlSource = await fs.readFile(CONTRACT_PATH, 'utf8');
  const specEndpoints = new ContractExtractor().fromYaml(yamlSource);

  // Composición real del servidor — sin escuchar puerto
  const e = process.env as Record<string, string | undefined>;
  if (!e.JWT_SECRET) e.JWT_SECRET = 'spec-check-only-secret-32-chars-yes';
  resetEnvForTests();
  resetWorkspaceForTests();

  const rootRouter = express.Router();
  rootRouter.get('/', (_q, r) => r.json({ ok: true }));

  const codeEndpoints = new RouterIntrospector().fromMounts([
    { mount: '', router: rootRouter },
    { mount: '/api/auth', router: authRouter },
    { mount: '/api/workspace', router: createWorkspaceRouter() }
  ]);

  const result = new SpecChecker().compare(specEndpoints, codeEndpoints);
  console.log(SpecChecker.format(result));
  if (!result.ok) process.exit(1);
}

main().catch(err => {
  console.error('[spec-check] ERROR:', err.message);
  process.exit(1);
});
