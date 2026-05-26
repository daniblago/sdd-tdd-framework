# Spec-002: Gestión de Usuarios

## 1. Visión y Objetivos
* **Propósito**: Permitir el registro y verificación de identidades en el sistema.

## 2. Reglas de Negocio Clave
* **Regla 1 (Creación):** Todo usuario debe ser creado obligatoriamente con un correo electrónico. No se permiten correos vacíos.
* **Regla 2 (Estado Inicial):** Al crearse, un usuario nace con el estado `unverified` (no verificado) por defecto.
* **Regla 3 (Verificación):** El sistema debe proveer un mecanismo (método `verify`) para cambiar el estado del usuario a verificado (`verified = true`).

> **Nota del Framework:** Esta especificación es la única fuente de verdad. El código en `src/domain/User.ts` debe reflejar exactamente estas reglas.