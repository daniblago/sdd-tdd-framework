# Spec-001: Núcleo del Framework SDD-TDD

**Versión**: 2.0.0
**Estado**: Aceptado
**Última actualización**: 2026-05-27

> Este documento es la **única fuente de verdad** del comportamiento del backend. El
> contrato HTTP detallado vive en [`contracts/api-core.yaml`](../../contracts/api-core.yaml)
> y se valida automáticamente con `npm run spec:check`. Si esta spec cambia, el código
> debe seguirla — no al revés.

---

## 1. Propósito

Persistir artefactos documentales por proyecto SDD a lo largo de 10 fases (Constitución →
Implementación), autenticar por rol, sellar proyectos cuando el diseño está validado, y
orquestar drafting con IA (Gemini, OpenAI, Anthropic).

## 2. Actores

| Rol | Capacidades |
|---|---|
| **ARCHITECT** | Crea proyectos, edita artefactos, sella/desella, descarga ZIP, usa IA |
| **DEVELOPER** | Lee artefactos, lista proyectos, descarga ZIP. **No** puede escribir, sellar ni usar IA |
| **Guest (sin token)** | Acceso solo al health check y `/api/auth/login` |

## 3. Reglas transversales

### 3.1 Autenticación
- JWT firmado con HS256 + secreto en `JWT_SECRET`. TTL 8h.
- **El JWT viaja exclusivamente en el header `Authorization: Bearer <token>`**.
  No se acepta en query string (regresión histórica del flujo de descarga).
- En `NODE_ENV=production` el servidor **no arranca** sin `JWT_SECRET` (mín. 32 chars).
- Contraseñas almacenadas con bcrypt (cost configurable, default 12). Contraseñas en
  texto plano no autentican aunque coincidan literalmente (defensa en profundidad).

### 3.2 Validación de path
Todo `projectName` y `relativePath` que tocan disco se validan con `ProjectName` /
`ResolvedArtifactPath` (Value Objects del dominio). Se rechazan:
- `projectName` fuera de `^[a-zA-Z0-9_-]{1,100}$`
- Segmento `..` en `relativePath` (después de split por `/` y `\`)
- Paths absolutos POSIX (`/etc/passwd`) o Windows (`C:\Windows\...`)
- Secuencias URL-encoded de traversal (`%2e`, `%2f`, `%5c`)
- Null bytes (`\0`)

Toda violación responde HTTP 400 con `{ "error": "Path traversal detectado: ..." }`.

### 3.3 Descarga de ZIP — flujo de dos pasos
1. `POST /api/workspace/download-ticket` con `Authorization: Bearer <jwt>` → emite
   ticket HMAC-SHA256 firmado, TTL 30s.
2. `GET /api/workspace/download/{projectName}?ticket=<ticket>` consume el ticket.
   Tras un uso exitoso el ticket queda invalidado.

Un ticket emitido para el proyecto A no funciona para descargar el proyecto B.

## 4. Endpoints

> El contrato HTTP completo (request/response schemas, status codes) está en
> [`api-core.yaml`](../../contracts/api-core.yaml). Aquí solo se listan para verificación
> contra el código.

### Health (público)
- `GET /` — health check

### Auth (público)
- `POST /api/auth/login` — emite JWT en respuesta a credenciales válidas

### Proyectos (autenticado)
- `GET /api/workspace/projects` — lista proyectos (cualquier rol)
- `POST /api/workspace/projects` — crea proyecto + siembra 10 plantillas
  (**ARCHITECT only**; 409 si ya existe)

### Sellado (autenticado)
- `GET /api/workspace/seal?projectName=<name>` — consulta `{ isSealed }`
- `POST /api/workspace/seal` — sella (**ARCHITECT only**)
- `DELETE /api/workspace/seal/{projectName}` — desella (**ARCHITECT only**, idempotente)

### Artefactos (autenticado)
- `GET /api/workspace/artifact?projectName=&relativePath=` — lee contenido
- `POST /api/workspace/artifact` — escribe contenido (**ARCHITECT only**)

### Descarga (autenticado para ticket, ticket-only para descarga)
- `POST /api/workspace/download-ticket` — emite ticket
- `GET /api/workspace/download/{projectName}?ticket=` — descarga ZIP

### IA (proxy)
- `GET /api/workspace/ai-status` — qué proveedores tienen llave en el servidor (público)
- `POST /api/workspace/ai-draft` — drafting (**ARCHITECT only**;
  proveedor `gemini | openai | anthropic`, default `gemini`)

## 5. Criterios de aceptación

- [ ] Todos los endpoints listados existen en `contracts/api-core.yaml` y en el código.
- [ ] `npm run spec:check` falla si hay drift en cualquier dirección (endpoint en spec
  sin código, endpoint en código sin spec).
- [ ] El servidor rechaza arrancar en producción sin `JWT_SECRET`.
- [ ] La descarga ZIP no acepta el JWT principal en query string.
- [ ] El RBAC se aplica a las operaciones marcadas como **ARCHITECT only**.
- [ ] La validación de path bloquea las cinco categorías de ataque listadas en §3.2.
- [ ] Cobertura ≥ 80% (umbral declarado en `vitest.config.ts`).

## 6. Casos límite

- **Drift de contrato**: `npm run spec:check` falla → CI bloquea el merge. Quien haga
  el cambio debe actualizar `api-core.yaml` y `spec.md` antes de mezclar.
- **Ticket replay**: rechazado con 401 sobre el segundo uso del mismo token.
- **Ticket cross-project**: ticket emitido para A → descarga de B → 401.
- **Conflicto de versiones entre agentes**: aislamiento por proyecto en
  `workspaces/{projectName}/`. Sin lockfile cooperativo; un solo arquitecto editor a
  la vez por proyecto (convención humana).

## 7. Fuera del alcance

- Multi-tenancy (compartir un proyecto entre varios usuarios con permisos diferenciados).
- Streaming de la respuesta de IA.
- Persistencia de tickets de descarga (hoy en memoria — no soporta multi-instancia
  detrás de balanceador).
