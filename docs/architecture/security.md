# docs/architecture/security.md
## Estrategia de Seguridad (Fase 6) [cite: 130]

### Autenticación y Autorización [cite: 128]
* **Protocolo**: Se utilizará OAuth 2.0 / OpenID Connect (OIDC) para la gestión de identidades[cite: 134].
* **Proveedor**: Compatible con Microsoft Entra o Auth0 para entornos empresariales[cite: 135].

### Políticas de Protección de Datos [cite: 139]
* **Cifrado en Reposo**: AES-256 para bases de datos y secretos[cite: 139].
* **Gestión de Secretos**: Uso obligatorio de Azure Key Vault o HashiCorp Vault[cite: 307].
* **Auditoría**: Registro inmutable de cada acción administrativa (Fase 7)[cite: 145, 157].
