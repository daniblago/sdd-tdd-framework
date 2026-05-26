# 04. Arquitectura de Alto Nivel y Blueprint

El core del framework está estructurado utilizando una Arquitectura Hexagonal / Limpia (Clean Architecture) desacoplada en tres capas principales:

1. **Domain (Dominio):** Contiene la lógica central pura del negocio (entidades como `Specification`, `Task`, `User` y puertos como `FileSystemPort`). No tiene dependencias externas.
2. **Application (Aplicación):** Contiene los casos de uso principales (`SaveArtifactUseCase`, `ReadArtifactUseCase`) y gestores de procesos (`SpecManager`, `TaskManager`).
3. **Infrastructure (Infraestructura):** Implementa los adaptadores concretos del sistema (como `LocalFileSystemAdapter` para persistencia en disco) y la API HTTP basada en Express.

## Diagrama de Contenedores (C4 Nivel 2)

Para ver el diagrama interactivo de contenedores y los diagramas detallados, consulte el archivo [context.md](file:///c:/sdd-tdd-framework/docs/architecture/context.md) y [container.md](file:///c:/sdd-tdd-framework/docs/architecture/container.md).

## Decisiones Arquitectónicas (ADRs)

Las decisiones de diseño de este framework se encuentran registradas bajo el formato estándar MADR en la carpeta [adr/](file:///c:/sdd-tdd-framework/docs/adr/):
* **ADR-001:** Estilo Arquitectónico (Arquitectura Limpia).
* **ADR-002:** Estrategia de Integración Externa.
* **ADR-003:** Autenticación y Autorización basada en OAuth2.
