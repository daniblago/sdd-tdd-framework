SDD-TDD Framework

Framework de ingeniería de software de alto rendimiento basado en los paradigmas Spec-Driven Development (SDD) y Test-Driven Development (TDD).

🚀 Filosofía

"Si los planos son sólidos, la construcción es ejecución controlada". Este framework elimina el Vibe Coding y la deuda técnica mediante una ruta de trabajo estricta de 10 fases, asegurando que cada línea de código tenga una razón de ser funcional y técnica.

📂 Ruta de Trabajo de 10 Fases

Fase 1: Constitución: Definición de leyes de gobernanza y arquitectura.

Fase 2: Glosario de Dominio: Lenguaje ubicuo para evitar ambigüedad.

Fase 3: Especificación Funcional: Fuente de verdad en spec.md.

Fase 4: Arquitectura de Alto Nivel: Diagramas C4 y registros ADR.

Fase 5: Modelo de Datos y Contratos: Diseño de esquemas y APIs.

Fase 6: Seguridad y RBAC: Matriz de roles y políticas de acceso.

Fase 7: Workflows Operativos: Modelado de estados de negocio.

Fase 8: Plan Técnico: Definición de stack y módulos.

Fase 9: Desglose de Tareas: Backlog orientado a TDD (tasks.md).

Fase 10: Construcción: Ciclo Red-Green-Refactor asistido por IA.

### 🔄 Cómo usar estas fases (No es Cascada)

El framework no te obliga a ejecutar las 10 fases de forma secuencial todos los días. Se divide en dos mundos de trabajo:

* **🌍 Mundo 1: El Macro-Ciclo (Fases 1 a 8 - Diseño y Arquitectura):** Se ejecuta al inicio del proyecto o cuando hay cambios estructurales (ej. definir una nueva funcionalidad, entidad o regla de negocio). Es planificación, no se hace a diario.
* **🔄 Mundo 2: El Micro-Ciclo (Fases 9 y 10 - Ejecución y TDD):** Es el bucle iterativo ágil donde el desarrollador vive el 90% del tiempo. Tomas la especificación del Macro-Ciclo, la divides en tareas (Fase 9) y aplicas pruebas y código (Fase 10) repetidamente.

> **Regla Inquebrantable:** NUNCA pases al Micro-Ciclo (Escribir Código) sin tener validado el Macro-Ciclo (Especificación de Diseño).

🛠️ Stack Tecnológico

Lenguaje: TypeScript (NodeNext)

Testing: Vitest (con umbral de cobertura del 80%)

Documentación: Markdown + Mermaid (Diagrams as Code)

💻 Comandos Rápidos

Instalación

```bash
npm install
cp .env.example .env   # editar y rellenar JWT_SECRET
```

Levantar API + UI

```bash
npm run dev
```

Ejecutar Tests (TDD)

```bash
npm test
```

Generar Cobertura

```bash
npm run test:coverage
```

Migrar `users.json` con contraseñas en texto plano a hashes bcrypt (idempotente, crea `.bak`)

```bash
npm run users:migrate
```

Validar que el código y el contrato OpenAPI no han driftado (CI lo corre en cada PR)

```bash
npm run spec:check
```

📐 SDD Enforcement

La promesa del [AGENT.md](AGENT.md) y de la [spec](specs/001-framework-core/spec.md) — *"el código es reflejo exacto de la spec"* — ahora se enforces:

* **`contracts/api-core.yaml`** es la única fuente de verdad del contrato HTTP (OpenAPI 3.0.3, 13 paths).
* **`npm run spec:check`** compara la lista de endpoints del OpenAPI contra los que el código realmente registra en Express. Si sobra o falta alguno en cualquier dirección, falla con un reporte tipo:

  ```
  ✗ SPEC DRIFT DETECTADO
    Spec declara 12 endpoints; código implementa 13.
    En spec pero NO en código (1): GET /api/workspace/fake
    En código pero NO en spec (1): GET /api/workspace/seal
  ```
* **`.github/workflows/ci.yml`** corre el chequeo (más tsc + tests con cobertura ≥ 80%) en cada push/PR a `main`. Sin spec actualizada, no hay merge.

Ver [ADR-006](docs/adr/ADR-006-sdd-enforcement.md) para los detalles arquitectónicos.

🔐 Seguridad

El framework aplica las siguientes garantías (ver [ADR-004](docs/adr/ADR-004-seguridad-fase-1.md) y [CHANGELOG](CHANGELOG.md)):

* **Configuración por entorno con validación al boot.** `JWT_SECRET` es **obligatorio** en `NODE_ENV=production` (mínimo 32 caracteres). En desarrollo se genera un secreto efímero en memoria con warning. Toda la config vive en [src/infrastructure/config/env.ts](src/infrastructure/config/env.ts) y se valida con Zod.
* **Contraseñas con bcrypt** (cost configurable 10–14, default 12). Los usuarios por defecto se hashean al sembrar `users.json`. Si tu `users.json` venía con texto plano, corre `npm run users:migrate` una vez.
* **Descargas con ticket de un solo uso.** El JWT no viaja en query string. Se solicita primero un ticket HMAC-SHA256 (TTL 30s) vía `POST /api/workspace/download-ticket`, y luego se navega a `GET /api/workspace/download/:project?ticket=...`. El ticket caduca en 30s y solo es válido una vez.
* **Anti path traversal centralizado.** Los Value Objects `ProjectName` y `ResolvedArtifactPath` en [src/domain/ProjectPath.ts](src/domain/ProjectPath.ts) rechazan `..`, paths absolutos (POSIX y Windows), secuencias URL-encoded y null bytes. Cross-platform.
* **RBAC.** `architectOnly` middleware bloquea operaciones de escritura para el rol `DEVELOPER`.

> ⚠️ **Antes de exponer este entorno**, cambia las contraseñas por defecto (`admin/architect123`, `dev/dev123`) editando `users.json` o usando el script de migración con tus propios usuarios.

🧪 Cobertura actual

```
Statements   : 91.43%
Branches     : 83.09%
Functions    : 98.55%
Lines        : 93.58%
176 tests / 29 archivos
```

🏗️ Arquitectura

```
src/
  domain/
    ports/                     # AiProvider, ProjectRepository, ProjectArchiver, FileSystemPort
    security/                  # PasswordHasher, UserRepository
    ProjectPath.ts             # Value Object anti-traversal
    ProjectTemplates.ts        # 10 plantillas de fase (readonly)
    Specification.ts / Task.ts
  application/usecases/        # 1 caso de uso por operación de usuario
  infrastructure/
    ai/                        # OpenAi, Anthropic, Gemini adapters + Factory
    api/                       # ProjectRouter, ArtifactRouter, DownloadRouter, AiRouter
      middleware/              # authMiddleware + architectOnly
      WorkspaceRouter.ts       # composer thin que monta los 4 sub-routers
    config/env.ts              # Zod-validated env loader
    filesystem/                # LocalFileSystemAdapter, LocalProjectRepository, ArchiverProjectArchiver
    security/                  # BcryptHasher, JsonUserRepository, DownloadTicketStore
```

Decisiones arquitectónicas registradas en [docs/adr/](docs/adr/).

🤖 Uso con Agentes de IA

Este repositorio incluye un archivo AGENT.md diseñado para actuar como el system prompt definitivo, obligando a la IA a seguir el protocolo de avance por fases sin improvisar.

Autor: Daniel Blandón

Licencia: MIT