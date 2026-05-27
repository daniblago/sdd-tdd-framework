# ADR-005: Split del WorkspaceRouter y puerto AiProvider — Fase 2 del Refactor

**Estado**: Aceptado
**Fecha**: 2026-05-27
**Decisores**: Daniel Felipe Blandón Gómez

## Contexto

Tras el refactor de seguridad (Fase 1, ADR-004), el `WorkspaceRouter` seguía siendo
un god router de ~370 líneas que mezclaba siete responsabilidades distintas en un solo
archivo:

1. Inicialización de servicios (use cases + adapters + ticket store).
2. Middlewares de auth y RBAC.
3. CRUD de proyectos (`/projects`).
4. Sellado/desellado (`/seal`, `DELETE /seal/:project`).
5. Lectura/escritura de artefactos (`/artifact`).
6. Generación de tickets + descarga de ZIP (`/download-ticket`, `/download/:project`).
7. Proxy multi-proveedor de IA con dispatcher inline (`/ai-status`, `/ai-draft`) que
   además mantenía un `let activeAiModel` mutable a nivel de módulo.

Además, el dispatcher de IA acoplaba el router directamente a `fetch`, a las URLs
concretas de cada proveedor y a sus esquemas de respuesta. Cambiar de proveedor o
añadir un cuarto requería editar el router. Eso violaba la regla de dependencia
de Clean Architecture: la capa de transporte HTTP no debería conocer los detalles
de un servicio externo.

## Decisiones

### 1. Definir puertos en el dominio

Tres nuevos puertos para que la capa de aplicación pueda razonar contra abstracciones
en lugar de adaptadores concretos:

- **`AiProvider`** ([src/domain/ports/AiProvider.ts](../../src/domain/ports/AiProvider.ts)) —
  `generate({ systemPrompt, userPrompt, apiKey }) -> { text }`. Los errores de upstream
  viajan como `AiProviderError` con el código HTTP del proveedor para que el router pueda
  propagarlo.
- **`ProjectRepository`** ([src/domain/ports/ProjectRepository.ts](../../src/domain/ports/ProjectRepository.ts)) —
  `list / exists / create / seal / unseal / isSealed / rootPath`. Abstrae el filesystem
  para que los use cases sean testeables contra fakes en memoria.
- **`ProjectArchiver`** ([src/domain/ports/ProjectArchiver.ts](../../src/domain/ports/ProjectArchiver.ts)) —
  `pack(sourceDir, destination)`. Aísla `archiver` del resto del código.

### 2. Casos de uso explícitos (uno por operación)

Cada acción del usuario es un caso de uso testeable contra fakes de los puertos:

| Caso de uso | Archivo | Dependencias |
|---|---|---|
| `ListProjectsUseCase` | application/usecases/ListProjectsUseCase.ts | ProjectRepository |
| `CreateProjectUseCase` | application/usecases/CreateProjectUseCase.ts | ProjectRepository + FileSystemPort (siembra plantillas) |
| `SealProjectUseCase` / `UnsealProjectUseCase` / `GetProjectSealStatusUseCase` | application/usecases/ProjectSealUseCases.ts | ProjectRepository |
| `PackageProjectUseCase` | application/usecases/PackageProjectUseCase.ts | ProjectRepository + ProjectArchiver |
| `DraftWithAiUseCase` | application/usecases/DraftWithAiUseCase.ts | AiProvider |

Las 10 plantillas de documento (antes inline en el router) viven ahora en
[domain/ProjectTemplates.ts](../../src/domain/ProjectTemplates.ts) como constante
inmutable (`readonly`). Esto permite testear el comportamiento sin acoplarse a los
strings.

### 3. Tres adaptadores de IA + factory

- `OpenAiAdapter` (gpt-4o, chat/completions)
- `AnthropicAdapter` (claude-3-5-sonnet-latest, /v1/messages)
- `GeminiAdapter` (gemini-1.5-flash, generateContent) — encapsula el **fallback dinámico
  de modelo** que antes vivía en un `let activeAiModel` mutable global; ahora es estado
  de la instancia del adapter (se recuerda entre llamadas via cache per-instance).
- `AiProviderFactory` resuelve por nombre (gemini default), valida proveedores soportados,
  cachea instancias.

Los tres adapters usan `global fetch`. Los tests inyectan mocks con `vi.stubGlobal('fetch', ...)`
en lugar de mockear módulos completos. Decisión deliberada: el costo de un puerto `HttpClient`
no se justifica cuando `vi.stubGlobal` permite controlar el comportamiento en cada test.

### 4. Cuatro routers thin + composer

Cada router es una función `createXxxRouter(deps): Router` que recibe los use cases
y middlewares ya construidos. Cero lógica de negocio, solo: parse → use case → respond.

| Router | Endpoints | Líneas |
|---|---|---|
| `ProjectRouter` | `GET/POST /projects`, `GET/POST /seal`, `DELETE /seal/:project` | ~75 |
| `ArtifactRouter` | `GET/POST /artifact` | ~80 |
| `DownloadRouter` | `POST /download-ticket`, `GET /download/:project` | ~55 |
| `AiRouter` | `GET /ai-status`, `POST /ai-draft` | ~55 |

`WorkspaceRouter.ts` se convierte en un **composition root** thin (~70 líneas) que
instancia los adapters, los inyecta en los use cases, monta los cuatro sub-routers bajo
`/api/workspace/*` y expone una factory `createWorkspaceRouter(): Router`. **El frontend
no se entera del split**: las URLs externas son idénticas a las de la Fase 1.

Los middlewares `authMiddleware` y `architectOnly` viven ahora en
[src/infrastructure/api/middleware/authMiddleware.ts](../../src/infrastructure/api/middleware/authMiddleware.ts),
con sus propios tests (8 casos, incluyendo la regresión de "token en query string").

### 5. Cleanups oportunistas

- Borrado `tests/unit/Specification.test.ts` (era subconjunto literal de
  `src/domain/Specification.test.ts`).
- Borrado `src/domain/User.ts` (clase vestigial de 3 líneas que ningún router usaba;
  el sistema de auth real usa `StoredUserRecord`).
- Movidos `SpecManager.test.ts` y `TaskManager.test.ts` de `tests/unit/` a
  `src/application/` (co-located con su código). Se elimina la carpeta `tests/`.
- `vitest.config.ts` simplificado: ya no necesita el patrón `tests/**/*.test.ts`.

## Consecuencias

* **Positivas**:
  - Un router de 370 líneas pasa a 4 routers de ~60 líneas + un composer de 70.
    Cada handler es trivialmente verificable de un vistazo.
  - El AI dispatcher se puede extender (4to proveedor) sin tocar HTTP. Añadir un adapter,
    registrarlo en la factory, y listo.
  - Los use cases son testeables contra fakes en memoria — sin filesystem ni HTTP.
  - El estado mutable global (`activeAiModel`) deja de existir; ahora es estado de
    instancia del `GeminiAdapter`.
  - Cobertura sube de 87% statements a 91% (lines 89 → 93), funcs 93 → 98.
  - 159 tests pasando (26 archivos), un 42% más que después de Fase 1.

* **Negativas / deuda asumida**:
  - El `CreateProjectUseCase` recibe una factory `(projectRoot: string) => FileSystemPort`.
    Es un patrón razonable pero no es DI puro — el use case sabe cómo se construye el adapter.
    Para Fase 3 podría introducirse un repositorio de plantillas (`ProjectScaffolder`) que
    elimine la dependencia directa al `FileSystemPort` del root del proyecto.
  - El `ArtifactRouter` aún construye sus use cases por request (porque el adapter
    depende del project root, que viene del request). Aceptable mientras los adapters
    sean baratos de instanciar.
  - El cache de instancias de la factory de IA es per-process; en multi-instancia detrás
    de un balanceador cada worker tendría su propio cache. Es irrelevante porque el cache
    solo guarda el modelo Gemini descubierto, y cada worker puede redescubrirlo de forma
    independiente.

## Alternativas consideradas

- **Inyectar `fetch` como dependencia en cada adapter** en lugar de usar `global fetch`.
  Descartado: añade boilerplate sin valor (los tests ya pueden interceptar con
  `vi.stubGlobal`).
- **Reorganizar URLs a `/api/projects`, `/api/artifacts`, `/api/ai`**. Descartado por
  alcance: rompe el frontend y obliga a coordinar despliegue. Mantenemos `/api/workspace/*`
  y agrupamos internamente.
- **Unificar los tres SealUseCases en un `ProjectSealService`**. Descartado: tres use cases
  pequeños son más SRP y los handlers quedan más uniformes (`new SealProjectUseCase(repo).execute(p)`).
- **Mantener un solo `WorkspaceRouter` y solo extraer use cases**. Descartado: deja la god
  class viva y no entrega el beneficio de ergonomía y testabilidad que motiva el split.
