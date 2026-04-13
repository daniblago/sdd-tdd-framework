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

npm install


Ejecutar Tests (TDD)

npm test


Generar Cobertura

npm run test:coverage


🤖 Uso con Agentes de IA

Este repositorio incluye un archivo AGENT.md diseñado para actuar como el system prompt definitivo, obligando a la IA a seguir el protocolo de avance por fases sin improvisar.

Autor: Daniel Blandón

Licencia: MIT