# Changelog

Todos los cambios notables a este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/) y el versionado [SemVer](https://semver.org/).

## [Unreleased] — Fase 2 del refactor: Split del WorkspaceRouter + puerto AiProvider

Ver [ADR-005](docs/adr/ADR-005-split-workspace-router.md) para la justificación completa.

### Added
- `src/domain/ports/AiProvider.ts` — puerto para drafting de IA (+ `AiProviderError`).
- `src/domain/ports/ProjectRepository.ts` — puerto para CRUD + sellado de proyectos.
- `src/domain/ports/ProjectArchiver.ts` — puerto para empaquetado a ZIP.
- `src/domain/ProjectTemplates.ts` — constante `readonly` con las 10 plantillas de doc
  por fase (antes inline en el router).
- `src/infrastructure/filesystem/LocalProjectRepository.ts` — adapter que implementa
  `ProjectRepository` sobre `fs/promises`.
- `src/infrastructure/filesystem/ArchiverProjectArchiver.ts` — adapter sobre `archiver`.
- `src/infrastructure/ai/OpenAiAdapter.ts` — gpt-4o vía chat/completions.
- `src/infrastructure/ai/AnthropicAdapter.ts` — claude-3-5-sonnet-latest vía /v1/messages.
- `src/infrastructure/ai/GeminiAdapter.ts` — gemini-1.5-flash con fallback dinámico
  encapsulado como estado de instancia (antes era un `let` global mutable).
- `src/infrastructure/ai/AiProviderFactory.ts` — resuelve adapter por nombre, cachea.
- `src/application/usecases/ListProjectsUseCase.ts` — lista proyectos ordenados.
- `src/application/usecases/CreateProjectUseCase.ts` — crea + siembra plantillas;
  rechaza recreación de proyecto existente (409).
- `src/application/usecases/ProjectSealUseCases.ts` — `Seal`, `Unseal`,
  `GetProjectSealStatus`.
- `src/application/usecases/PackageProjectUseCase.ts` — orquesta repo + archiver;
  lanza `ProjectNotFoundError` si el proyecto no existe.
- `src/application/usecases/DraftWithAiUseCase.ts` — valida `apiKey` y delega al
  proveedor; propaga `AiProviderError` sin envolverlo.
- `src/infrastructure/api/middleware/authMiddleware.ts` — middlewares extraídos
  (`authMiddleware` + `architectOnly`), con 8 tests propios.
- `src/infrastructure/api/ProjectRouter.ts` — router thin: list/create/seal endpoints.
- `src/infrastructure/api/ArtifactRouter.ts` — router thin: GET/POST /artifact.
- `src/infrastructure/api/DownloadRouter.ts` — router thin: download-ticket + download.
- `src/infrastructure/api/AiRouter.ts` — router thin: ai-status + ai-draft.

### Changed
- `src/infrastructure/api/WorkspaceRouter.ts` — antes 370 líneas de god router; ahora
  un composer thin (~70 líneas) que cablea los adapters → use cases → 4 sub-routers.
  Exporta `createWorkspaceRouter(): Router` (factory) en lugar de un `Router` mutable.
- `src/infrastructure/api/server.ts` — usa la factory `createWorkspaceRouter()`.
- `vitest.config.ts` — quita el patrón `tests/**/*.test.ts` (ya no existe esa carpeta).

### Removed
- `tests/unit/Specification.test.ts` — subconjunto literal de
  `src/domain/Specification.test.ts`. Carpeta `tests/` eliminada.
- `src/domain/User.ts` y `src/domain/User.test.ts` — clase vestigial sin uso real.
- El `let activeAiModel` mutable global del antiguo `WorkspaceRouter` — ahora es
  estado de instancia encapsulado en `GeminiAdapter`.

### Moved
- `tests/unit/SpecManager.test.ts` → `src/application/SpecManager.test.ts` (co-located).
- `tests/unit/TaskManager.test.ts` → `src/application/TaskManager.test.ts` (co-located).

### Tests
- 159 tests pasando (26 archivos), un +42% sobre Fase 1.
- Cobertura: Statements 90.95%, Branches 83.79%, Functions 98.44%, Lines 92.96%.

## [Unreleased] — Fase 1 del refactor: Seguridad y Configuración

Ver [ADR-004](docs/adr/ADR-004-seguridad-fase-1.md) para la justificación completa.

### Added
- `src/infrastructure/config/env.ts` — carga `.env` con `dotenv`, valida con Zod y falla al arrancar
  en producción si falta `JWT_SECRET` (o si es < 32 caracteres).
- `src/domain/security/PasswordHasher.ts` — puerto de hashing.
- `src/infrastructure/security/BcryptHasher.ts` — adaptador `bcryptjs` (cost 10–14, default 12).
- `src/domain/security/UserRepository.ts` — puerto para repositorio de usuarios.
- `src/infrastructure/security/JsonUserRepository.ts` — adapter que siembra `users.json` con
  contraseñas **hasheadas** la primera vez.
- `src/application/usecases/LoginUseCase.ts` — caso de uso testeable de autenticación.
- `src/application/usecases/MigrateUsersUseCase.ts` — caso de uso puro de migración.
- `src/domain/ProjectPath.ts` — Value Objects `ProjectName` y `ResolvedArtifactPath` con
  protección cross-platform contra path traversal (incluye URL-encoded y null bytes).
- `src/infrastructure/security/DownloadTicket.ts` — store de tickets HMAC-SHA256 de un solo uso
  (TTL 30s) para descarga de ZIPs.
- `scripts/migrate-users.ts` — comando `npm run users:migrate` que migra `users.json` con
  contraseñas en texto plano a hashes bcrypt. Idempotente, escribe `users.json.bak` antes de
  modificar.
- `.env.example` — plantilla de variables de entorno.
- Endpoint `POST /api/workspace/download-ticket` — emite ticket de descarga.
- 8 archivos de tests nuevos cubriendo todos los componentes de seguridad.

### Changed
- `src/infrastructure/api/AuthRouter.ts` — refactorizado a thin router que delega en
  `LoginUseCase`. Sin `JWT_SECRET` hardcodeado; sin contraseñas DEFAULT en texto plano. Lee
  configuración desde `env()`.
- `src/infrastructure/api/WorkspaceRouter.ts` — usa `env()`, `ProjectName`/`ResolvedArtifactPath`
  y `DownloadTicketStore`. Validación de path traversal centralizada (un solo lugar, antes seis).
- `src/infrastructure/api/server.ts` — invoca `env()` al boot para fallar temprano si la
  configuración es inválida.
- `sdd-frontend/src/App.jsx` — el botón de descarga ahora pide un ticket primero y solo después
  navega a la URL del ZIP. El JWT ya no viaja en query string.
- `.gitignore` — permite versionar `.env.example`; ignora `users.json.bak`.
- `vitest.config.ts` — excluye `server.ts` (bootstrap puro) del cómputo de cobertura.

### Removed
- `GET /api/workspace/download/:projectName?token=<JWT>` — flujo removido. Usar el flujo de dos
  pasos (`download-ticket` + `download/:project?ticket=`).

### Security
- **CRÍTICO**: `JWT_SECRET` ya no tiene fallback hardcodeado. En producción el server **no
  arranca** sin la variable. En desarrollo se genera un secreto efímero con warning.
- **CRÍTICO**: contraseñas almacenadas con `bcrypt` (cost configurable). El login compara con
  `bcrypt.compare`, defensa en profundidad: una contraseña que aparezca en plano en `users.json`
  ya no autentica.
- **CRÍTICO**: el JWT principal ya no viaja en query string. Las descargas usan tickets
  HMAC-SHA256 de un solo uso con TTL 30s.
- **ALTO**: protección contra path traversal centralizada y robusta — rechaza `..`, paths
  absolutos, secuencias URL-encoded y null bytes en una sola Value Object.

### Tests
- 112 tests pasando (16 archivos).
- Cobertura: Statements 87.36%, Branches 82.15%, Functions 93.18%, Lines 89.24% — por encima del
  umbral declarado de 80%.
