# ADR-006: SDD Enforcement — el contrato es ejecutable

**Estado**: Aceptado
**Fecha**: 2026-05-27
**Decisores**: Daniel Felipe Blandón Gómez

## Contexto

El [AGENT.md](../../AGENT.md) declara como **regla inquebrantable**: *"Si la
especificación (spec.md) cambia, debes actualizar las pruebas y luego el código.
El código siempre es un reflejo exacto de la especificación"*. La spec previa lo
reforzaba en §3: *"Drift de Contrato: el CI debe fallar si el código no coincide
con la spec"*.

Antes de esta fase nada hacía cumplir esa promesa:
- `specs/001-framework-core/spec.md` tenía 15 líneas placeholder.
- `contracts/api-core.yaml` declaraba **un** endpoint (`/specs`) que **nunca
  existió** en el código (era un stub del scaffolding original).
- El código exponía 13 endpoints reales (Auth + 4 sub-routers de Workspace +
  health check) sin trazabilidad a la spec.

Resultado práctico: la spec era decorativa. Cualquier endpoint nuevo aparecía
en el código sin pasar por documentación y nadie se enteraba.

## Decisiones

### 1. La spec real es el OpenAPI

- [`contracts/api-core.yaml`](../../contracts/api-core.yaml) reescrito como
  OpenAPI 3.0.3 completo: 13 paths, security schemes (bearerAuth), schemas
  reutilizables (ProjectName, requests, responses), tags por dominio, status
  codes esperados (incluye el 409 nuevo de Fase 2 y el 401 del flujo de ticket).
- [`specs/001-framework-core/spec.md`](../../specs/001-framework-core/spec.md)
  reescrito como spec ejecutiva orientada a contratos: roles, reglas
  transversales (auth, path traversal, descarga), enumeración de endpoints
  con sus restricciones de rol, criterios de aceptación verificables.
- Decisión deliberada del estilo: spec técnica orientada a contratos antes que
  Gherkin. El drift-check automático contrasta endpoints, no escenarios, y los
  Gherkin BDD no ayudan ahí.

### 2. Tres piezas extractoras + 1 script CLI

Todo en [src/contract/](../../src/contract/), con tests TDD:

- **`ContractExtractor`** — lee `api-core.yaml`, devuelve la lista canonical
  `"METHOD path"`. Solo cuenta verbos HTTP (ignora `parameters`, `summary`,
  etc. al nivel de path).
- **`RouterIntrospector`** — camina la stack interna de los `Router` de Express
  y devuelve la misma lista canonical. Normaliza los parámetros de Express
  (`:projectName`) a OpenAPI (`{projectName}`) antes de comparar. Recibe los
  *mounts* explícitamente (`[{ mount: '/api/workspace', router: ... }]`) en
  lugar de tratar de adivinarlos: Express 5 no expone el regexp del mount path
  para sub-routers, y "el composer ya conoce sus mounts" es la fuente honesta.
- **`SpecChecker`** — compara las dos listas y devuelve
  `{ ok, missingInCode, missingInSpec, totalSpec, totalCode }`. Tiene un
  formateador estático que produce un reporte humano legible.
- **`scripts/spec-check.ts`** (`npm run spec:check`) — orquesta los tres,
  compone la app Express real (sin escuchar puerto) y termina con `exit(1)` si
  hay drift en cualquier dirección.

### 3. CI bloqueante en `.github/workflows/ci.yml`

Tres jobs en orden: `tsc --noEmit` → `npm run test:coverage` → `npm run spec:check`.
Cualquiera que falle bloquea el merge. El umbral de cobertura (80%) ya estaba en
`vitest.config.ts`; ahora se aplica en CI también.

## Consecuencias

* **Positivas**:
  - Imposible mergear código que diverge de la spec — el CI falla con un reporte
    accionable: qué endpoint sobra/falta y de qué lado.
  - El AGENT.md deja de mentir; el "código es reflejo exacto de la spec" ahora
    se enforces.
  - 17 tests nuevos cubren los tres componentes del extractor.
  - `npm run spec:check` corre en < 1s — cero fricción en local antes de un commit.

* **Negativas / deuda asumida**:
  - El validador compara *existencia* de endpoints, no *forma* de la
    request/response. Un endpoint puede coincidir en `METHOD path` y aún así
    devolver schema distinto del declarado. Para Fase 4 podría agregarse
    validación de shapes con `openapi-validator` o ajv contra los schemas del
    yaml.
  - La extracción de mounts es explícita (lista hardcodeada en
    `scripts/spec-check.ts`). Si alguien añade un tercer router top-level y
    olvida registrarlo aquí, el drift no se detecta. Mitigación: el reviewer
    nota el endpoint nuevo en el diff del PR. Solución a largo plazo: una
    registry única que el server y el script consuman.

## Alternativas consideradas

- **Spec en Gherkin con un step runner**. Descartado: los scenarios funcionan
  para BDD humano pero no son accionables para drift-check sin un parser
  específico.
- **Inferir los mounts de Express por introspección del regex**. Funcionaba en
  Express 4 pero Express 5 dejó de exponer el `regexp` de los sub-routers — la
  introspección devolvía cadena vacía. La lista explícita es la opción honesta.
- **Validar también que cada endpoint tenga al menos un test de integración**.
  Descartado en esta fase: requiere convención y/o etiquetado en los `it(...)`.
  Candidato para Fase 4 si se ve necesario.
