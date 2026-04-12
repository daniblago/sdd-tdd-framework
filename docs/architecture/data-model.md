# docs/architecture/data-model.md
## Modelo de Datos (Fase 5)

### Entidades Principales
* **Specification**: Almacena el ID, versión y contenido de la spec[cite: 235].
* **Task**: Vinculada a una spec, con estado (Pendiente, En Progreso, Verificada)[cite: 237].
* **ADR**: Registro de decisiones vinculadas a componentes[cite: 245].

### Estrategia de Persistencia
* Se utilizará un sistema de archivos versionado (Git) como base de datos de auditoría[cite: 57, 320].
