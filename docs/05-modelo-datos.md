# 05. Modelo de Datos y Contratos de Integración

Este documento define el formato de persistencia local y las firmas de los contratos JSON manejados por el framework.

## Persistencia del Sistema de Archivos Local

El adaptador `LocalFileSystemAdapter` persiste los artefactos en directorios aislados para cada proyecto dentro de la carpeta `workspaces/`. Los archivos se guardan en formato de texto plano (`utf-8`).

## Contratos de la API (OpenAPI)

El router de la API (`WorkspaceRouter.ts`) expone endpoints protegidos para la interacción con los artefactos:

* **Guardar Artefacto (`POST /api/workspace/artifact`):**
  ```json
  {
    "projectName": "string",
    "relativePath": "string",
    "content": "string"
  }
  ```

* **Leer Artefacto (`GET /api/workspace/artifact?projectName=XYZ&relativePath=abc.md`):**
  Retorna directamente el contenido textual del archivo.

Para ver el contrato OpenAPI completo, consulte [api-core.yaml](file:///c:/sdd-tdd-framework/contracts/api-core.yaml).
