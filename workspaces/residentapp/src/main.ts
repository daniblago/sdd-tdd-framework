Como Arquitecto Docente (SpecAgent) IA, procedo a redactar y expandir la fase "Agente Dev" para el proyecto `[ResidentAPP]`, integrando de manera asertiva y con la exactitud de un ingeniero Senior el conocimiento acumulado de las fases previas (Constitución, Glosario, Especificación Funcional Detallada, Arquitectura C4, Datos/Estado, Roles y Acceso, Flujos y Blueprint TS).

---

# Fase 10 - Agente Dev: Guía de Desarrollo para [ResidentAPP]

## 1. Propósito y Alcance

Este documento establece la "Guía de Desarrollo (Agente Dev)" para el proyecto `[ResidentAPP]`, detallando las prácticas, procesos y responsabilidades que cada ingeniero de software (`Agente Dev`) debe adoptar para construir el sistema. Su propósito es traducir el `Blueprint Técnico del Sistema` (Fase 8) y el `Backlog TDD` (Fase 9) en directrices operativas que aseguren la adhesión estricta a la `Arquitectura Limpia` (Fase 1), la metodología `Desarrollo Guiado por Pruebas (TDD)` (Fase 1), y los `Atributos de Calidad` (Fase 1) definidos para el `[ResidentAPP]`.

**Alcance:**
*   Delinear el proceso de desarrollo día a día centrado en `TDD` y el `Ciclo Red-Green-Refactor`.
*   Proporcionar guías de implementación concretas para cada capa de la `Arquitectura Limpia` utilizando el `stack` tecnológico (`Blueprint TS`).
*   Detallar la estrategia de `pruebas unitarias`, `integración` y `componente` desde la perspectiva del desarrollador.
*   Establecer estándares de `Calidad del Código`, `convenciones de nombrado`, y procesos de `Revisión de Código`.
*   Definir la estrategia de `control de versiones` (`Gitflow`) y `gestión de ramas`.
*   Especificar la configuración del `entorno de desarrollo local`.
*   Servir como el manual operativo fundamental para todos los desarrolladores del `[ResidentAPP]`, garantizando consistencia, eficiencia y alta calidad en la entrega de software.

## 2. Contexto y Alineación Arquitectónica

La fase "Agente Dev" es el crisol donde toda la planificación y el diseño de las fases anteriores se convierten en código ejecutable. Representa la culminación práctica de la visión arquitectónica, asegurando que cada línea de código contribuya a un sistema coherente y robusto.

### 2.1. Adhesión al Desarrollo Guiado por Pruebas (TDD) y Arquitectura Limpia

*   **TDD Obligatorio (Fase 1 - Constitución, Fase 9 - Backlog TDD):** La práctica del `Desarrollo Guiado por Pruebas (TDD)` es la piedra angular del trabajo diario. Cada tarea del `Backlog TDD` debe ser abordada mediante el `Ciclo Red-Green-Refactor`, siendo la prueba fallida el punto de partida ineludible.
*   **Arquitectura Limpia Aplicada (Fase 1 - Constitución, Fase 4 - Arquitectura C4):** Los desarrolladores implementarán el sistema siguiendo la `Regla de la Dependencia`, asegurando que el código fluya de las capas externas a las internas. Se enfatizará la construcción de `Entidades` y `Casos de Uso` (`Core Business Rules`, `Application Business Rules`) de forma independiente de los `Adaptadores de Interfaz` y `Frameworks y Drivers`.
*   **Principios SOLID y Separación de Preocupaciones (Fase 1 - Constitución):** Cada `Agente Dev` deberá aplicar `Principios SOLID` y `Separación de Preocupaciones` en el diseño de clases y módulos, utilizando `Inyección de Dependencias (DI)` para reducir el acoplamiento y mejorar la `Testabilidad`.

### 2.2. Integración con Fases Precedentes

*   **`Blueprint Técnico del Sistema` (Fase 8):** Este documento es la guía principal para la elección de `lenguajes de programación` (`TypeScript 5.x`), `frameworks` (`NestJS 10.x`, `React 18.x`, `React Native`), `bases de datos` (`PostgreSQL`, `Amazon S3`, `Redis`) y `herramientas` (`pnpm`, `Vitest`, `Prisma ORM`). Los `Agentes Dev` deberán configurar sus entornos y escribir código utilizando el `stack` tecnológico especificado.
*   **`Backlog TDD` (Fase 9):** Cada ítem de este backlog es una tarea "TDD Ready" que servirá como el punto de partida para el desarrollo. Los `Criterios de Aceptación` en `Gherkin` (Fase 3) asociados a cada ítem son la especificación ejecutable de lo que se debe construir y probar.
*   **`Flujos (Workflows)` (Fase 7):** Los `diagramas de secuencia` detallados guiarán a los desarrolladores en la implementación de las interacciones entre los `Componentes` del sistema, asegurando que el comportamiento dinámico se alinee con el diseño.
*   **`Roles y Acceso` (Fase 6):** Las políticas de `Autenticación` y `Autorización` (`RBAC`, `Resource-Based`) se implementarán en las capas correspondientes (`Adaptadores de Interfaz` y `Casos de Uso`), utilizando las librerías (`Spring Security`, `JWT`) y patrones definidos para garantizar la `Seguridad` (Fase 1, 3).
*   **`Datos / Estado` (Fase 5):** Los `Agentes Dev` construirán los `Adaptadores de Repositorio` que implementan los `Puertos` de la `Capa de Casos de Uso`, utilizando `Prisma ORM` para `PostgreSQL` y los `SDKs` (`AWS SDK v3`) para `Amazon S3` o `ioredis` para `Redis`, manteniendo la `Independencia de Bases de Datos`.
*   **`Arquitectura C4` (Fase 4):** Los `diagramas de componentes` servirán como mapa para entender las responsabilidades de cada `Componente` y sus límites dentro de un `Contenedor` como la `ResidentAPP API`.

## 3. El Proceso de Desarrollo del Agente Dev: El Ciclo de Vida del Código

La jornada de un `Agente Dev` en el proyecto `[ResidentAPP]` se guía por un proceso iterativo y disciplinado, profundamente arraigado en `TDD`.

### 3.1. Práctica Obligatoria: TDD y el Ciclo Red-Green-Refactor

Cada tarea de desarrollo, ya sea una nueva `funcionalidad` o una `corrección de error`, debe seguir este ciclo riguroso:

1.  **ROJO (RED): Escribir una prueba que falla.**
    *   **Objetivo:** Capturar un requisito o un comportamiento no implementado. La prueba debe ser atómica y fallar por una sola razón.
    *   **Guía:** Basarse directamente en los `Criterios de Aceptación` en `Gherkin` del `Backlog TDD` o en una pequeña porción de ellos. Para `Entidades` y `Casos de Uso`, se escribe una `prueba unitaria`. Para `Adaptadores`, una `prueba de integración`.
    *   **Tecnologías:** `Vitest` (para pruebas unitarias y mocks de dependencias), `React Testing Library`.
    *   **Prohibido:** Escribir código de producción antes de tener una prueba que falle.

2.  **VERDE (GREEN): Escribir el mínimo código de producción para que la prueba pase.**
    *   **Objetivo:** Hacer que la prueba `ROJA` y todas las pruebas existentes pasen (`VERDE`).
    *   **Guía:** Escribir solo lo necesario, sin preocuparse inicialmente por el diseño elegante, la duplicación o la optimización. El objetivo es pasar la prueba lo más rápido posible.
    *   **Tecnologías:** `TypeScript 5.x`, `NestJS`, `React`, `React Native`.

3.  **REFACTORIZAR (REFACTOR): Mejorar el diseño del código.**
    *   **Objetivo:** Mejorar la estructura, legibilidad, mantenibilidad y rendimiento del código de producción (y de las pruebas, si aplica) sin cambiar su comportamiento observable.
    *   **Guía:** Eliminar duplicación, aplicar `Principios SOLID` y patrones de `Código Limpio`.
    *   **Red de Seguridad:** Todas las `pruebas unitarias` y `de integración` existentes deben seguir pasando (`VERDE`) después de la refactorización. Si alguna prueba falla, la refactorización introdujo un error y debe ser deshecha o corregida.
    *   **Herramientas:** `VS Code` con refactorización automática de TypeScript, `ESLint` (con `@typescript-eslint`), `Prettier`.

### 3.2. De Backlog TDD a Implementación: Guía Operacional

El `Agente Dev` abordará los ítems del `Backlog TDD` de la siguiente manera:

1.  **Selección del Ítem:** Elegir el siguiente ítem de alta prioridad, asegurándose de que esté "TDD Ready".
2.  **Comprensión del Ítem:**
    *   Revisar la descripción del ítem, los `Criterios de Aceptación` en `Gherkin`.
    *   Identificar las `Entidades` y `Casos de Uso` involucrados (Fase 3, 5).
    *   Consultar los `Flujos (Workflows)` (Fase 7) para entender las interacciones dinámicas.
    *   Localizar los `Contenedores` y `Componentes` (`Arquitectura C4`, Fase 4) que serán afectados o creados.
3.  **Desarrollo `de Adentro Hacia Afuera`:**
    *   **Priorizar Dominio y Aplicación:** Comenzar con las `Capas de Entidades` y `Casos de Uso`. Escribir `pruebas unitarias` para la lógica de negocio central, asegurando su independencia de frameworks y detalles externos.
    *   **Construir Adaptadores:** Una vez que la lógica de negocio esté probada, implementar los `Adaptadores de Interfaz` (controladores, repositorios) que conectan el dominio con la infraestructura, utilizando `pruebas de integración` para verificar su funcionamiento.
    *   **Detalles Externos:** Finalmente, abordar los `Frameworks y Drivers` (UI, configuración DB), que dependerán de los `Adaptadores`.

## 4. Guías de Implementación por Capa (Arquitectura Limpia en Acción)

El `Agente Dev` debe comprender y aplicar las directrices específicas para cada capa de la `Arquitectura Limpia`, utilizando el `Blueprint TS` como referencia tecnológica.

### 4.1. Capa de Entidades (Dominio / Core Business Rules)

*   **Responsabilidad (SRP):** Contener las reglas de negocio más generales y estables (`PH`, `UnidadPrivada`, `Residente`, `EstadoDeCuenta`, `Amenidad`, `Reserva`). Son clases `TypeScript` puras que encapsulan datos y comportamiento.
*   **Independencia:** **Absoluta independencia** de frameworks, bases de datos, UI y servicios externos. Estas clases NO deben tener decoradores de `NestJS`, dependencias de `Prisma`, o lógica específica de `HTTP`.
*   **Comportamiento (Rich Domain Models):** Las `Entidades` deben tener métodos que encapsulen su lógica de negocio (ej. `EstadoDeCuenta.calcularSaldo()`, `Residente.tieneAcceso(unidadId)`).
*   **Testeabilidad:** 100% de `pruebas unitarias` para la lógica de las `Entidades`, sin mocks o dependencias complejas.
*   **Tecnologías:** `TypeScript 5.x` (clases puras), `Decimal.js` para monetarios (evita problemas de precisión de punto flotante), `crypto.randomUUID()` o `uuid` para IDs.

### 4.2. Capa de Casos de Uso (Lógica de Aplicación / Application Business Rules)

*   **Responsabilidad:** Orquestar el flujo de datos para funcionalidades específicas (ej. `ConsultarEstadoDeCuentaDeResidenteUseCase`, `ReservarAmenidadUseCase`). Actúan como "Interactors" o "Services".
*   **Interacción:** Interactúan con las `Entidades` y con `Puertos` (interfaces) definidos en esta misma capa o en las `Entidades` (ej. `EstadoDeCuentaRepositoryPort`, `ResidentRepositoryPort`).
*   **`DIP` y `DI`:** Dependen de abstracciones (`Puertos`), no de implementaciones concretas. La `Inyección de Dependencias` nativa de `NestJS` se usará para proveer las implementaciones mediante `providers` e `interfaces`/`tokens`.
*   **Transaccionalidad:** Los límites transaccionales de la base de datos se definirán típicamente a nivel de `Caso de Uso`, utilizando `Prisma.$transaction()` para operaciones atómicas.
*   **Seguridad:** Contienen la lógica de `Autorización` granular (basada en recursos/atributos) invocando un `AuthorizationServicePort`, asegurando el cumplimiento de `Roles y Acceso` (Fase 6).
*   **Testeabilidad:** Alta cobertura de `pruebas unitarias` para la lógica de orquestación, usando mocks nativos de `Vitest` (`vi.fn()`, `vi.mock()`) para mockear `Puertos` (repositorios, servicios externos).
*   **Tecnologías:** `TypeScript 5.x` (clases de servicio), `NestJS` (para `DI` con `@Injectable()`).

### 4.3. Capa de Adaptadores de Interfaz (API REST, Repositorios, Presentadores, Mappers)

*   **Responsabilidad:** Convertir datos entre el formato conveniente para las capas externas y el formato de las capas internas (dominio/casos de uso). Manejan la `serialización/deserialización`.
*   **`Controladores/Presentadores` (Backend `NestJS`):**
    *   Reciben `DTOs` de entrada, validan (ej. `class-validator` con `ValidationPipe`), convierten a formatos del `Caso de Uso`.
    *   Invocan `Casos de Uso`.
    *   Convierten las `Entidades` o resultados del `Caso de Uso` a `DTOs` de salida.
    *   Aplican `Autenticación` (`JWT`) y `Autorización` de alto nivel (`RBAC`) con `Guards` de `NestJS` y `Passport.js`.
    *   Tecnologías: `NestJS` (`@Controller`, `@Get`, `@Post`), `@nestjs/passport`, `@nestjs/jwt`, `class-validator`, `class-transformer`.
*   **`Gateways` (Implementaciones de Repositorio - Backend `NestJS`):**
    *   Implementan los `Puertos` definidos en los `Casos de Uso` (ej. `PrismaEstadoDeCuentaRepositoryAdapter` implementa `EstadoDeCuentaRepositoryPort`).
    *   Interactúan con la tecnología de persistencia concreta.
    *   Son responsables de mapear entre `Entidades de Dominio` y modelos de persistencia (`Prisma models`).
    *   Gestionan el `caching` (ej. con `Redis` vía `ioredis`) sin que el `Caso de Uso` lo sepa.
    *   Tecnologías: `Prisma ORM` (para `PostgreSQL`), `AWS SDK v3` (para `S3`), `ioredis`.
*   **`ReportingServiceClient` (Backend `NestJS`):**
    *   Cliente `tRPC` o `HTTP` para comunicarse con el `Servicio de Reporting`. Convierte objetos de dominio en DTOs de transporte.
    *   Tecnologías: `tRPC` (type-safe) o `@nestjs/microservices` con transporte TCP/Redis.
*   **`UI Presenters/ViewModels` (Frontend `React`/`React Native`):**
    *   Adaptan los datos de la `API` (`DTOs`) a la vista, y los datos de la vista a las peticiones de la `API`.
    *   Manejan la lógica de presentación y el estado local de la `UI`.
    *   Tecnologías: `TypeScript`, `React` hooks, `React Query`, `Axios`.
*   **Testeabilidad:** `Pruebas de integración` para `Controladores` (con `@nestjs/testing` y `supertest`) y para `Repositorios` (con `Prisma` y `Testcontainers`), asegurando la interacción correcta con los `Frameworks y Drivers`.

### 4.4. Capa de Frameworks y Drivers (External Details / Infraestructura Concreta)

*   **Responsabilidad:** Contener los detalles de implementación de bajo nivel y la infraestructura técnica. Esta capa no es desarrollada por el `Agente Dev` de forma habitual, sino configurada y gestionada por los equipos de `DevOps` e `Infraestructura como Código (IaC)`. Sin embargo, el `Agente Dev` debe entender cómo su código se integra con ella.
*   **Ejemplos:** Configuración de `NestJS` (`app.module.ts`), la base de datos `PostgreSQL` (esquema, usuarios), `Amazon S3` (buckets, permisos), `Redis` (instancia, configuración), `Kubernetes` (`EKS`) donde se desplegarán los contenedores, `GitHub Actions` para `CI/CD`.
*   **Tecnologías:** `PostgreSQL 15+`, `Amazon RDS`, `Amazon S3`, `Amazon ElastiCache for Redis`, `Amazon SNS`, `Amazon SES`, `Docker`, `Kubernetes`, `Terraform`.
*   **Impacto del Agente Dev:** El `Agente Dev` contribuirá con migraciones de esquema `Prisma Migrate` para `PostgreSQL` (Fase 5) y con la configuración del módulo raíz de `NestJS` y variables de entorno (`.env`, `ConfigModule`).

## 5. Estrategia de Pruebas a Nivel de Desarrollo

La `Testeabilidad como Primera Clase` (Fase 1) y el `TDD` dictan una estrategia de pruebas por capas, optimizando la velocidad y el alcance de la retroalimentación.

*   **Pirámide de Pruebas:** Se seguirá una pirámide de pruebas, con una base amplia de `pruebas unitarias`, un nivel intermedio de `pruebas de integración` y un ápice más pequeño de `pruebas de aceptación/E2E`.

### 5.1. Pruebas Unitarias (Foco en Dominio y Casos de Uso)

*   **Qué probar:** `Entidades` (reglas de negocio), `Casos de Uso` (lógica de orquestación, validaciones de negocio), `Servicios de Dominio` (si aplican), `Mappers` (transformaciones de datos).
*   **Características:** Rápidas, aisladas, sin dependencias externas (DB, red, etc.). Utilizan `mocks` para aislar la unidad de código bajo prueba.
*   **Cobertura Objetivo:** 100% de cobertura para `Entidades` y `Casos de Uso`.
*   **Tecnologías:**
    *   Backend: `Vitest` (unitarias y mocks).
    *   Frontend: `Vitest`, `React Testing Library`.
*   **Ejemplo (Backend - `AccountUseCase`):**
    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest';
    import { ConsultarEstadoDeCuentaDeResidenteUseCase } from './consultar-estado-cuenta.use-case';
    import { ResidentRepositoryPort } from '../ports/resident-repository.port';
    import { EstadoDeCuentaRepositoryPort } from '../ports/estado-cuenta-repository.port';
    import { Residente } from '../../domain/entities/residente';
    import { UnidadPrivada } from '../../domain/entities/unidad-privada';
    import { EstadoDeCuenta } from '../../domain/entities/estado-de-cuenta';
    import { MovimientoFinanciero } from '../../domain/entities/movimiento-financiero';
    import Decimal from 'decimal.js';

    describe('ConsultarEstadoDeCuentaDeResidenteUseCase', () => {
      let useCase: ConsultarEstadoDeCuentaDeResidenteUseCase;
      let residentRepo: ResidentRepositoryPort;
      let estadoCuentaRepo: EstadoDeCuentaRepositoryPort;

      beforeEach(() => {
        residentRepo = {
          findById: vi.fn(),
          findUnidadesAsociadasByResidenteId: vi.fn(),
        };
        estadoCuentaRepo = {
          findByUnidadPrivadaIdAndPeriodo: vi.fn(),
          save: vi.fn(),
        };
        useCase = new ConsultarEstadoDeCuentaDeResidenteUseCase(residentRepo, estadoCuentaRepo);
      });

      it('should return account statement when resident is associated', async () => {
        // RED: Arrange - Mockear comportamiento de repositorios
        const residenteId = crypto.randomUUID();
        const unitId = crypto.randomUUID();
        const mockResident = new Residente(residenteId, 'John Doe', 'john@example.com');
        mockResident.addUnit(new UnidadPrivada(unitId, 'Apt 101', new Decimal(1), crypto.randomUUID()));

        const mockEstadoDeCuenta = new EstadoDeCuenta(crypto.randomUUID(), unitId, '2023-11', new Decimal(0), new Decimal(500), new Date(), false);
        mockEstadoDeCuenta.addMovimiento(new MovimientoFinanciero(crypto.randomUUID(), mockEstadoDeCuenta.id, 'EXPENSA_COMUN', new Decimal(500), new Date(), 'Nov 2023'));

        vi.mocked(residentRepo.findById).mockResolvedValue(mockResident);
        vi.mocked(estadoCuentaRepo.findByUnidadPrivadaIdAndPeriodo).mockResolvedValue(mockEstadoDeCuenta);

        // When - Ejecutar el caso de uso
        const result = await useCase.execute(residenteId, unitId, '2023-11');

        // Then - Verificar el resultado (GREEN)
        expect(result).not.toBeNull();
        expect(result.saldoTotal.equals(new Decimal(500))).toBe(true);
        // REFACTOR: (clean up, improve naming, etc.)
      });

      it('should throw when resident is not associated to unit', async () => {
        // RED: Arrange
        const residenteId = crypto.randomUUID();
        const unitId = crypto.randomUUID();
        const mockResident = new Residente(residenteId, 'John Doe', 'john@example.com');
        // No asociamos la unidadId al residente

        vi.mocked(residentRepo.findById).mockResolvedValue(mockResident);

        // When / Then - Esperar excepción (GREEN)
        await expect(useCase.execute(residenteId, unitId, '2023-11'))
          .rejects.toThrow('AccesoNoAutorizado');
      });
    });
    ```

### 5.2. Pruebas de Integración (Foco en Adaptadores)

*   **Qué probar:** Interacción entre `Adaptadores de Interfaz` (Repositorios, Controladores) y `Frameworks y Drivers` (Base de Datos, Servicios externos). Verifican el mapeo `ORM`, las consultas `SQL` y la conectividad.
*   **Características:** Más lentas que las unitarias. Se ejecutan con una base de datos real (o una base de datos en memoria/Docker `Testcontainers`). No mockean las dependencias que están siendo integradas.
*   **Tecnologías:**
    *   Backend: `@nestjs/testing`, `supertest`, `Testcontainers` para Node.js (para bases de datos reales en contenedores).
    *   Frontend: `Cypress` o `Playwright` (para interacciones entre componentes UI y API).
*   **Ejemplo (Backend - `AccountRepositoryAdapter`):**
    ```typescript
    import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
    import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
    import { PrismaClient } from '@prisma/client';
    import { PrismaEstadoDeCuentaRepositoryAdapter } from './prisma-estado-cuenta-repository.adapter';

    describe('PrismaEstadoDeCuentaRepositoryAdapter', () => {
      let container: StartedPostgreSqlContainer;
      let prisma: PrismaClient;
      let adapter: PrismaEstadoDeCuentaRepositoryAdapter;

      beforeAll(async () => {
        container = await new PostgreSqlContainer().start();
        prisma = new PrismaClient({
          datasources: { db: { url: container.getConnectionUri() } },
        });
        await prisma.$executeRawUnsafe(`-- apply migrations`);
        adapter = new PrismaEstadoDeCuentaRepositoryAdapter(prisma);
      }, 60_000);

      afterAll(async () => {
        await prisma.$disconnect();
        await container.stop();
      });

      it('should find estado de cuenta by unit id and period', async () => {
        // RED: Arrange - Insertar datos directamente en la DB de prueba (Testcontainers)
        const unitId = crypto.randomUUID();
        const period = '2023-11';
        // ... seed data via prisma.estadoDeCuenta.create(...) ...

        // When - Ejecutar el método del adaptador
        const found = await adapter.findByUnidadPrivadaIdAndPeriodo(unitId, period);

        // Then - Verificar que los datos fueron recuperados y mapeados correctamente (GREEN)
        expect(found).not.toBeNull();
        expect(found!.unidadPrivadaId).toBe(unitId);
        // REFACTOR:
      });
    });
    ```

### 5.3. Pruebas de Componente (Foco en un Microservicio)

*   **Qué probar:** El comportamiento completo de un `Contenedor` (microservicio) de forma aislada, simulando sus dependencias externas (bases de datos, otros microservicios) con `mocks` o `Testcontainers`.
*   **Características:** Verifican que la `API` completa del microservicio funcione como se espera, incluyendo `controladores`, `casos de uso` y `adaptadores`.
*   **Tecnologías:** `@nestjs/testing` (con `Test.createTestingModule()`), `nock` (para simular APIs externas), `Testcontainers`, `supertest`.
*   **Ejemplo (Backend - `ResidentAPP API`):**
    ```typescript
    import { describe, it, expect, beforeAll, afterAll } from 'vitest';
    import { Test, TestingModule } from '@nestjs/testing';
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
    import { AppModule } from '../app.module';

    describe('ResidentAPP API - Component Test', () => {
      let app: INestApplication;
      let container: StartedPostgreSqlContainer;

      beforeAll(async () => {
        container = await new PostgreSqlContainer().start();
        process.env.DATABASE_URL = container.getConnectionUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      }, 60_000);

      afterAll(async () => {
        await app.close();
        await container.stop();
      });

      it('GET /api/v1/accounts/unit/:unitId/statement - should return statement for authorized resident', async () => {
        // RED: Arrange - Preparar la base de datos con Testcontainers, simular JWT
        const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // JWT simulado
        const unitId = '...';

        // When - Realizar una llamada HTTP a la API
        const response = await request(app.getHttpServer())
          .get(`/api/v1/accounts/unit/${unitId}/statement`)
          .set('Authorization', `Bearer ${validJwt}`)
          .expect(200); // GREEN

        expect(response.body.saldoTotal).toBe(500.00);
        // REFACTOR:
      });
    });
    ```

## 6. Calidad del Código y Colaboración

La excelencia técnica en el `[ResidentAPP]` requiere una cultura de `Código Limpio` y colaboración efectiva.

### 6.1. Código Limpio y Estándares (Fase 1 - Constitución, Fase 8 - Blueprint TS)

*   **Legibilidad:** El código debe ser fácil de entender para cualquier miembro del equipo. Se seguirán los principios de `Clean Code` de Robert C. Martin.
*   **Convenciones de Nombramiento:**
    *   **TypeScript (Backend y Frontend):** `camelCase` para variables/métodos, `PascalCase` para clases/interfaces/tipos, `UPPER_SNAKE_CASE` para constantes.
    *   `Puertos` (interfaces): Nombres que terminan en `Port` (ej. `UserRepositoryPort`).
    *   `Adaptadores` (implementaciones): Nombres que terminan en `Adapter` (ej. `PostgresUserRepositoryAdapter`).
    *   `Casos de Uso`: Nombres que terminan en `UseCase` (ej. `CrearResidenteUseCase`).
    *   `DTOs`: Nombres que terminan en `DTO` (ej. `ResidenteDTO`).
*   **Formato de Código:** Se utilizará `Prettier` integrado en el `IDE` y en los pipelines de `CI` para asegurar un estilo consistente en todo el stack TypeScript.
*   **Análisis Estático:** `ESLint` con `@typescript-eslint` se ejecutará en cada `push` para identificar y corregir problemas de `Calidad del Código`, `seguridad` y `deuda técnica` de forma temprana. Opcionalmente, `SonarQube` como capa adicional de análisis.

### 6.2. Revisiones de Código (Peer Reviews)

*   **Obligatorio:** Todo código nuevo o modificado debe pasar por una `revisión de código` por al menos un compañero de equipo antes de ser fusionado a la rama principal.
*   **Foco de la Revisión:**
    *   Adherencia a la `Arquitectura Limpia` y `Principios SOLID`.
    *   Cumplimiento de los `Criterios de Aceptación`.
    *   Cobertura y calidad de las `pruebas unitarias` y `de integración`.
    *   Claridad, legibilidad y `Código Limpio`.
    *   `Seguridad` (manejo de datos sensibles, autorización).
    *   Manejo de errores.
    *   `Rendimiento` potencial.
*   **Herramienta:** `GitHub Pull Requests`.

### 6.3. Estrategia de Ramificación (Gitflow Adaptado)

Para gestionar el flujo de cambios de código, se adoptará un modelo de `Gitflow Adaptado` para garantizar la estabilidad y la colaboración.

*   **`main`:** Rama principal, siempre desplegable en producción. Solo se fusionan ramas `release` o `hotfix` a `main`.
*   **`develop`:** Rama de integración para el desarrollo continuo. Todos los `feature branches` se fusionan a `develop`.
*   **`feature/<nombre-caracteristica>`:** Ramas para el desarrollo de nuevas `funcionalidades` o `historias de usuario`. Son de corta duración y se basan en `develop`.
*   **`release/<version>`:** Ramas para preparar un nuevo lanzamiento. Se crean a partir de `develop`, se realizan pruebas finales y correcciones de bugs, y luego se fusionan a `main` y `develop`.
*   **`hotfix/<nombre-hotfix>`:** Ramas para correcciones urgentes en producción. Se crean a partir de `main`, se implementan y se fusionan a `main` y `develop`.
*   **Política de `Merge`:** `Squash and Merge` para `feature branches` a `develop` para mantener un historial limpio. `Merge Commit` para `release` y `hotfix` a `main`.
*   **Pre-commit Hooks:** Utilizar `hooks` de `Git` para ejecutar `linters`, `formatters` y `pruebas unitarias` localmente antes de `commit`, previniendo errores comunes.

## 7. Entorno de Desarrollo Local y Herramientas

Cada `Agente Dev` debe tener un entorno de desarrollo consistente para asegurar la reproducibilidad y eficiencia.

*   **`IDE` (Fase 8 - Blueprint TS):**
    *   Backend y Frontend: `VS Code` (preferido) con extensiones de `TypeScript`, `NestJS`, `Prisma`, `React`, `ESLint`, `Prettier`. Alternativamente, `WebStorm`.
*   **Control de Versiones (`Git`):** Configurado para usar `GitHub Enterprise`.
*   **Contenerización Local (`Docker Desktop`):**
    *   Todas las dependencias de infraestructura local (PostgreSQL, Redis, WireMock/nock para mocks de terceros) se ejecutarán en `Docker Compose`. Esto permite una replicación fiel del entorno de `producción` y facilita las `pruebas de integración`.
    *   El `backend` (`NestJS`) puede ejecutarse directamente desde el `IDE` con `pnpm run start:dev` o también como un contenedor `Docker`.
*   **Herramientas de `Build` y `Test`:**
    *   **Backend y Frontend:** `pnpm` (comandos para instalar dependencias, ejecutar tests, levantar servidor de desarrollo). Scripts unificados en `package.json`.
*   **Herramientas de Migración de DB (`Prisma Migrate`):** Se ejecutarán con `pnpm prisma migrate dev` para aplicar migraciones de esquema localmente.
*   **Postman/Insomnia:** Para probar los `endpoints` de la `API REST` localmente.

## 8. Integración con CI/CD (Perspectiva del Desarrollador)

El trabajo del `Agente Dev` se integra directamente con los pipelines de `CI/CD` definidos en el `Blueprint TS` (Fase 8).

*   **`Commit` y `Push`:** Cada vez que el `Agente Dev` hace `push` a una rama de desarrollo (`feature`, `develop`, `release`, `hotfix`), `GitHub Actions` se activará automáticamente.
*   **Ejecución de Pipelines de CI:**
    *   Compilación del código.
    *   Ejecución de `pruebas unitarias` y `pruebas de integración`.
    *   Análisis estático de código (`SonarQube`).
    *   Construcción de imágenes `Docker` para el `backend` y otros servicios.
    *   Si el pipeline de `CI` pasa, se notifica al equipo y se puede proceder a la `revisión de código`.
    *   Si el pipeline falla, se notifica al `Agente Dev` para que corrija los errores inmediatamente.
*   **Despliegue Continuo (CD):** Una vez que el código pasa las revisiones y los pipelines de `CI` en `develop`, se activa un `pipeline de CD` para desplegar automáticamente a los entornos `DEV` y `QA`. Los despliegues a `Staging` y `PROD` requerirán aprobación manual.

## 9. Conclusión

La fase "Agente Dev" es la materialización de todos los esfuerzos arquitectónicos y de planificación del proyecto `[ResidentAPP]`. Al dotar a cada ingeniero con directrices claras, herramientas adecuadas y un proceso de desarrollo robusto centrado en `TDD`, garantizamos que el sistema se construirá con la más alta `Calidad del Código`, `Testabilidad` intrínseca y adhesión a la `Arquitectura Limpia`.

Este enfoque no solo minimiza la `Deuda Técnica` y acelera la entrega de valor, sino que también fomenta una cultura de ingeniería de excelencia. Los `Agentes Dev` son los guardianes de la calidad y la coherencia arquitectónica, y este documento les proporciona la hoja de ruta detallada para construir un `[ResidentAPP]` exitoso, `seguro`, `escalable` y `mantenible` a largo plazo.

---