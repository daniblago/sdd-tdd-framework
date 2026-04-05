# Constitución del Proyecto: Framework SDD+TDD
[cite_start]Este documento define los principios obligatorios de gobernanza, calidad y arquitectura[cite: 49, 50].

## [cite_start]1. Principios Arquitectónicos [cite: 50]
* [cite_start]**Separación de Responsabilidades:** El código debe seguir una arquitectura limpia (Clean Architecture), separando lógica de negocio de la infraestructura[cite: 50].
* [cite_start]**Source of Truth:** La especificación (`spec.md`) es la única fuente de verdad funcional[cite: 27].
* [cite_start]**Decisiones Documentadas:** Toda decisión crítica debe generar un registro ADR (Architecture Decision Record)[cite: 54, 94].

## [cite_start]2. Políticas de Calidad (TDD) [cite: 52]
* [cite_start]**Test-First:** No se escribe código de producción sin una prueba previa que falle (Ciclo Red-Green-Refactor)[cite: 32, 205].
* [cite_start]**Cobertura Mínima:** Se exige un umbral de cobertura del 80% en lógica de negocio[cite: 211].
* [cite_start]**Verificabilidad:** Toda unidad de trabajo debe ser testeable en aislamiento[cite: 221].

## [cite_start]3. Reglas de Seguridad y Gobernanza [cite: 51]
* [cite_start]**RBAC:** El acceso a recursos debe estar regido por una matriz de roles y permisos definida antes de la implementación[cite: 136, 137].
* [cite_start]**Protección de Datos:** Cifrado obligatorio para datos sensibles y gestión de secretos mediante bóvedas seguras[cite: 139, 307].

## [cite_start]4. Protocolo de Avance [cite: 215]
* [cite_start]No se diseña solución técnica sin alcance funcional validado[cite: 216].
* [cite_start]No se hace merge sin revisión por pares (Code Review) y todas las pruebas pasando[cite: 224].