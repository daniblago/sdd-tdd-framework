# 07. Workflows Operativos de Negocio

Este documento describe el flujo operativo de aprobación y sellado de especificaciones en el framework.

## Flujo de Aprobación de Especificación y Sellado

El ciclo de vida de un diseño técnico (plano arquitectónico) culmina con su sellado formal antes del desarrollo:

```mermaid
stateDiagram-v2
    [*] --> BORRADOR : Crear Proyecto
    BORRADOR --> EN_REVISION : Completar Documentos (01 al 09)
    EN_REVISION --> APROBADO : Aprobado por ARCHITECT
    EN_REVISION --> BORRADOR : Solicitar Cambios
    APROBADO --> SELLADO : Pulsar "Validar Documento y Avanzar Fase" (Fase 10)
    SELLADO --> [*] : Iniciar Ciclo TDD local
```

Para más detalles, consulte el archivo [aprobacion-especificacion.md](file:///c:/sdd-tdd-framework/docs/workflows/aprobacion-especificacion.md).
