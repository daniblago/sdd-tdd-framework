# ADR-004: Endurecimiento de Seguridad — Fase 1 del Refactor

**Estado**: Aceptado
**Fecha**: 2026-05-27
**Decisores**: Daniel Felipe Blandón Gómez

## Contexto

El diagnóstico arquitectónico previo al refactor identificó tres riesgos críticos en la capa de
infraestructura que invalidaban la promesa del README (*"elimina deuda técnica y ejecución
controlada"*):

1. `JWT_SECRET` hardcodeado y duplicado en `AuthRouter.ts` y `WorkspaceRouter.ts`, con un fallback
   literal `'sdd_super_secret_local_key'` aplicado silenciosamente si la variable de entorno
   faltaba.
2. Credenciales por defecto (`admin/architect123`, `dev/dev123`) almacenadas en `users.json` en
   **texto plano** y comparadas con `===`, sin hashing.
3. Token JWT aceptado por **query string** (`?token=...`) para descargar el ZIP del proyecto, lo
   que filtraba la sesión a logs de proxies, historial del navegador y referers.

Adicionalmente, la validación de path traversal estaba dispersa: el regex `/^[a-zA-Z0-9_-]+$/` se
repetía 6 veces en `WorkspaceRouter` y el chequeo de `relativePath.includes('..')` no normalizaba
con `path.resolve`, dejando huecos ante secuencias URL-encoded.

## Decisiones

### 1. Configuración por entorno con validación al boot

Se introduce `src/infrastructure/config/env.ts` que carga `.env` con `dotenv` y valida con Zod.
**Falla al arrancar en `NODE_ENV=production` si falta `JWT_SECRET`** (o si es < 32 caracteres).
En desarrollo genera un secreto efímero en memoria y emite un warning. Centraliza también `PORT`,
`WORKSPACES_DIR`, `BCRYPT_COST` y las API keys de IA. Se publica `.env.example` como referencia y
se ajusta `.gitignore` para permitir solo `.env.example`.

### 2. Hash de contraseñas con bcryptjs

Se define el puerto `domain/security/PasswordHasher.ts` y el adaptador
`infrastructure/security/BcryptHasher.ts` (bcryptjs, cost configurable 10-14, por defecto 12).
Se elige **bcryptjs** sobre `bcrypt`/`argon2` por compatibilidad con Windows (sin binding nativo
y sin `node-gyp`).

Se introduce el caso de uso `LoginUseCase` (testeable con repositorio en memoria) y el
adaptador `JsonUserRepository`, que al sembrar `users.json` por primera vez **hashea los usuarios
por defecto antes de persistirlos**. El script `npm run users:migrate` migra cualquier `users.json`
preexistente con texto plano a hashes bcrypt, escribiendo `users.json.bak` antes de modificar y
siendo idempotente en ejecuciones posteriores.

### 3. Tickets de descarga de un solo uso (HMAC-SHA256)

Se reemplaza el patrón `GET /download/:project?token=<JWT>` por un flujo de dos pasos:

1. `POST /api/workspace/download-ticket` (con `Bearer` JWT) → emite un ticket firmado con HMAC
   y TTL de 30s.
2. `GET /api/workspace/download/:project?ticket=<ticket>` → consume el ticket. El servidor lo
   marca como usado antes de iniciar el stream del ZIP, garantizando **uso único**.

`DownloadTicketStore` mantiene el registro en memoria con cleanup periódico de tickets caducados.
El JWT principal **nunca** viaja en query string.

### 4. Value Object `ProjectPath` para validación centralizada

`domain/ProjectPath.ts` expone `ProjectName.from()` (regex única, longitud 1-100) y
`ResolvedArtifactPath.from()` que:
- Rechaza paths absolutos (POSIX y Windows).
- Rechaza segmentos `..` (cross-platform: divide por `/` y `\`).
- Rechaza secuencias URL-encoded (`%2e`, `%2f`, `%5c`).
- Normaliza con `path.resolve` y verifica que el resultado quede dentro del `projectRoot`.
- Rechaza null bytes.

Toda la validación de rutas del `WorkspaceRouter` pasa ahora por este Value Object.

## Consecuencias

* **Positivas**:
  - Tres vulnerabilidades críticas eliminadas; deja de ser viable arrancar producción con secreto
    por defecto, comprometer contraseñas via dump del filesystem, o robar el JWT vía logs.
  - 8 archivos de tests nuevos, 112 tests verdes, cobertura 87% statements / 89% lines (por encima
    del umbral declarado de 80%).
  - Cada componente nuevo desarrollado en estricto ciclo TDD (Red → Green → Refactor).
  - Configuración centralizada (un solo `env()`); secretos rotados con un solo cambio.

* **Negativas / deuda asumida**:
  - `WorkspaceRouter` sigue siendo monolítico (~370 líneas) — split en `ProjectRouter`,
    `ArtifactRouter`, `AiRouter` queda para la Fase 2 del refactor.
  - Tickets de descarga viven en memoria (no soportan multi-instancia). Aceptable para uso local;
    si se despliega tras un balanceador, mover a Redis.
  - `LocalFileSystemAdapter` confía en que el caller validó el path. La frontera está en el router,
    no en el adapter — anotar si se reutiliza el use case fuera de HTTP.

## Alternativas consideradas

- **argon2** (más moderno que bcrypt): descartado por requerir compilación nativa, frágil en
  Windows.
- **JWT corto de un solo uso para descarga** (en lugar de ticket HMAC): rechazado porque seguía
  metiendo el JWT en la URL. El ticket HMAC desacopla completamente la identidad del recurso.
- **Romper el God Router en esta misma fase**: descartado por alcance. Se hizo refactor
  *quirúrgico* sobre lo crítico; el split arquitectónico es Fase 2.
