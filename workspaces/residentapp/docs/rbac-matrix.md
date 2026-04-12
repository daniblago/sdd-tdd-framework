Como Arquitecto Docente (SpecAgent) IA, procedo a redactar y expandir la fase "Roles y Acceso" para el proyecto `[ResidentAPP]`, integrando de manera asertiva y con la exactitud de un ingeniero Senior el conocimiento acumulado de las fases previas (Constitución, Glosario, Especificación Funcional Detallada, Arquitectura C4 y Datos/Estado).

---

# Fase 6 - Roles y Acceso del Proyecto [ResidentAPP]

## 1. Propósito y Alcance

Este documento establece la "Estrategia de Roles y Acceso" para el proyecto `[ResidentAPP]`, definiendo formalmente los actores del sistema, sus roles asociados y las políticas de autorización que dictan qué funcionalidades y recursos pueden acceder. Su propósito es garantizar un control de acceso robusto, granular y seguro, en estricta alineación con el atributo de calidad `Seguridad` establecido en la `Constitución de Arquitectura` (Fase 1) y los `Requisitos No Funcionales` detallados en la `Especificación Funcional Detallada` (Fase 3).

**Alcance:**
*   Identificar y definir los roles principales del sistema, incluyendo sus responsabilidades y privilegios.
*   Establecer el modelo de autorización (control de acceso) que regirá las interacciones con las `Funcionalidades` y `Entidades de Dominio` del `[ResidentAPP]`.
*   Describir los mecanismos de `Autenticación` de usuarios.
*   Delinear los principios de seguridad que guiarán la implementación de la gestión de acceso.
*   Especificar consideraciones técnicas para la implementación, persistencia y auditoría de la seguridad.
*   Servir como referencia para el diseño y desarrollo de las políticas de seguridad en cada `Caso de Uso` y `Componente` del sistema.

## 2. Contexto y Alineación Arquitectónica

La estrategia de roles y acceso es un pilar fundamental de la `Seguridad` del `[ResidentAPP]`, permeando todas las capas de la `Arquitectura Limpia` y siendo esencial para el cumplimiento de los `Criterios de Aceptación` relacionados con el acceso.

### 2.1. Alineación con la Arquitectura Limpia y Principios SOLID

*   **Separación de Preocupaciones (SoC):** La lógica de autenticación y autorización se implementará de manera que esté claramente separada de la `lógica de negocio` principal. Los `Casos de Uso` (`Use Cases`) invocarán servicios de autorización que determinarán si un usuario tiene permiso para ejecutar una operación, sin que los `Casos de Uso` contengan directamente la lógica de decisión de acceso.
*   **Principio de Inversión de Dependencias (DIP):** Los `Casos de Uso` dependerán de abstracciones (`Puertos`) para los servicios de autorización (ej. `AuthorizationServicePort`), y los `Adaptadores de Interfaz` (`Interface Adapters`) contendrán las implementaciones concretas que interactúan con el mecanismo de autorización subyacente (ej. `JwtAuthorizationServiceAdapter`). Esto garantiza la `Independencia de Frameworks/Tecnologías` para la lógica de negocio central.
*   **Testabilidad como Primera Clase:** La clara separación y la `Inyección de Dependencias (DI)` facilitarán la `Testeabilidad` de los `Casos de Uso` y las políticas de autorización de forma independiente, en línea con la metodología `TDD` y el `Ciclo Red-Green-Refactor`.

### 2.2. Coherencia con Fases Previas

*   **Glosario (Fase 2):** Los términos `Residente`, `Copropietario`, `Administrador de PH`, `Revisor Fiscal` (definidos como `Personas` en C4), `Unidad Privada (UP)`, `Expensa Común`, `Amenidad`, `PQRS`, `Comunicado` serán directamente utilizados para definir los sujetos y objetos del control de acceso.
*   **Especificación Funcional Detallada (Fase 3):** Los `Criterios de Aceptación` en `Gherkin` que implican restricciones de acceso (ej., "Residente intenta consultar el estado de cuenta de una Unidad Privada a la que no está asociado") son la base funcional de las políticas de autorización.
*   **Arquitectura C4 (Fase 4):** Los roles definidos en el `Diagrama de Contexto` y los `Contenedores` (`ResidentAPP API`, `Web App Admin`, `Mobile App Residente`) que implementarán estos mecanismos, son el marco estructural. La `ResidentAPP API` será el punto central para la validación de tokens y la aplicación de políticas de autorización.
*   **Datos / Estado (Fase 5):** Los datos de usuarios, roles y permisos se persistirán en la `Base de Datos Transaccional Primaria (PostgreSQL)`, y la información sensible será gestionada con `Cifrado de Datos` y `Auditoría de Datos`.

## 3. Definición de Roles del Sistema

Los roles en el `[ResidentAPP]` se han diseñado para reflejar las responsabilidades funcionales y administrativas de los `Stakeholders` dentro de una `Propiedad Horizontal` (PH), tal como se identificaron en el `Glosario` y el `Diagrama de Contexto C4`.

### 3.1. Rol: Residente / Copropietario

*   **Descripción:** Representa a una persona que habita o posee una o varias `Unidades Privadas` (UP) dentro de la `PH`. Un `Copropietario` tiene derechos y responsabilidades adicionales sobre la gestión del `PH`.
*   **Privilegios Clave (Ejemplos):**
    *   **Acceso a sus UP:** Visualizar información de las `Unidades Privadas` a las que está asociado.
    *   **Consulta Financiera:** Acceder al `Estado de Cuenta` y el historial de pagos de *sus* `Unidades Privadas`.
    *   **Gestión de Amenidades:** Consultar disponibilidad y realizar `Reservas` de `Amenidades / Áreas Sociales`.
    *   **Comunicaciones:** Recibir y visualizar `Circulares / Comunicados`, y enviar `PQRS` para *sus* `Unidades Privadas`.
    *   **Documentación:** Acceder a documentos generales (`RNC`, actas de `Asamblea General`).
    *   **Pago:** Iniciar pagos de `Expensas Comunes` y `Cuotas Extraordinarias` a través de la `Pasarela de Pagos`.
*   **Restricciones:** Estrictamente limitado a la información y acciones relacionadas con sus `Unidades Privadas`. No puede acceder a la información de otras UP, ni realizar acciones administrativas.

### 3.2. Rol: Administrador de PH

*   **Descripción:** Representa a la persona o entidad encargada de la gestión operativa y administrativa del `PH`. Es el usuario con los mayores privilegios operativos.
*   **Privilegios Clave (Ejemplos):**
    *   **Gestión de Residentes y UP:** Crear, editar, asociar/desasociar `Residentes` y `Unidades Privadas`.
    *   **Gestión Financiera:** Acceder y generar `Estados de Cuenta` para *todas* las `Unidades Privadas`, registrar `Movimientos Financieros`, emitir `Paz y Salvo`.
    *   **Gestión de Amenidades:** Configurar `Amenidades`, gestionar `Reservas` (aprobar, cancelar).
    *   **Comunicaciones:** Publicar `Circulares / Comunicados`, gestionar `PQRS` (asignar, responder, cerrar).
    *   **Documentación:** Cargar y gestionar documentos del `PH` (`RNC`, actas, etc.).
    *   **Integración:** Iniciar sincronización de datos con el `Sistema de Contabilidad PH`.
*   **Restricciones:** Acceso generalmente irrestricto dentro del ámbito de gestión de la `PH`, con posibles limitaciones sobre acciones críticas (ej. eliminación masiva de datos) que podrían requerir un rol de "Superadministrador" o múltiples aprobaciones.

### 3.3. Rol: Revisor Fiscal

*   **Descripción:** Representa al profesional encargado de auditar la transparencia contable y el cumplimiento legal del `PH`. Requiere acceso a información financiera detallada.
*   **Privilegios Clave (Ejemplos):**
    *   **Consulta Financiera Amplia:** Acceder a `Estados de Cuenta`, `Movimientos Financieros` y reportes contables para *todas* las `Unidades Privadas` y el `PH` en general.
    *   **Documentación Financiera:** Acceder a documentos como balances, informes de gastos e ingresos.
    *   **Auditoría:** Consultar logs de auditoría específicos para transacciones financieras o cambios críticos.
*   **Restricciones:** Acceso de sólo lectura a información sensible. No puede modificar datos operativos o de configuración del sistema.

### 3.4. Rol: Sistema / Servicio (Rol Interno)

*   **Descripción:** Representa a procesos automatizados o microservicios internos que necesitan interactuar con ciertos `Componentes` del `ResidentAPP` sin la intervención de un usuario humano.
*   **Privilegios Clave (Ejemplos):**
    *   **Sincronización:** Acceder y modificar datos financieros para `Sincronización de datos` con `Sistemas Externos` (ej., `Sistema de Contabilidad PH`).
    *   **Generación de Reportes:** Acceder a datos para generar `Estados de Cuenta` en PDF (utilizado por el `Servicio de Reporting`).
    *   **Notificaciones:** Enviar notificaciones a `Residentes` (ej., desde el `Servicio de Notificaciones`).
*   **Restricciones:** Privilegios específicos y limitados al ámbito de su funcionalidad automatizada. El acceso se gestionará mediante credenciales de servicio o tokens internos.

## 4. Modelo de Autorización (Control de Acceso)

El `[ResidentAPP]` implementará un modelo de autorización híbrido, combinando el **Control de Acceso Basado en Roles (RBAC)** con un **Control de Acceso Basado en Recursos/Atributos** para asegurar una granularidad adecuada y cumplir con el principio de `Mínimo Privilegio`.

### 4.1. RBAC (Role-Based Access Control)

*   **Principio:** Los permisos se asocian a roles, y los usuarios se asignan a uno o varios roles. Esto simplifica la gestión de permisos a gran escala.
*   **Aplicación:** Los roles definidos en la sección 3 serán la base. Cada `funcionalidad` o `módulo` tendrá un conjunto de permisos requeridos para acceder, y estos permisos se asignarán a los roles.
    *   Ejemplo: El permiso `financial:account_statement:read_all` se asigna al rol `Administrador de PH` y `Revisor Fiscal`.
    *   Ejemplo: El permiso `financial:account_statement:read_own` se asigna al rol `Residente / Copropietario`.

### 4.2. Autorización Basada en Recursos / Atributos (Resource-Based / ABAC Light)

*   **Principio:** Además del rol, se evalúan atributos del usuario (ej. `userId`, `unidadPrivadaId`) y del recurso (`unidadPrivadaId` del `EstadoDeCuenta`) para determinar el acceso.
*   **Aplicación:** Fundamental para la granularidad requerida por el `Residente / Copropietario`.
    *   **Propiedad de Recursos:** Un `Residente` solo puede acceder a su propio `Estado de Cuenta`, sus `Reservas` o enviar `PQRS` asociados a *sus* `Unidades Privadas`. El sistema verificará que el `userId` autenticado esté asociado a la `unidadPrivadaId` del recurso solicitado.
    *   **Asociación de UP:** Las `Unidades Privadas` a las que un `Residente` está asociado se consideran un atributo clave para decisiones de autorización. El `UseCase` o un `Service Layer` intermedio validará esta asociación.

### 4.3. Flujo de Decisión de Autorización

1.  **Autenticación:** El usuario presenta credenciales válidas y obtiene un token de acceso (`JWT`).
2.  **Extracción de Rol y Contexto:** El `ResidentAPP API` valida el `JWT` y extrae el `userId`, los `roles` asignados y, si aplica, las `unidadesAsociadas` al usuario.
3.  **Verificación de Permiso General (RBAC):** Se verifica si el `rol` del usuario tiene el permiso general para realizar la acción solicitada (ej. `financial:account_statement:read`). Si no lo tiene, se deniega el acceso.
4.  **Verificación de Acceso a Recurso Específico (Resource-Based):** Si el permiso general es concedido y la operación involucra un recurso específico (ej. `EstadoDeCuenta` de una `UP`), se realiza una verificación adicional.
    *   Para `Residente / Copropietario`: Se comprueba que el usuario autenticado esté asociado a la `Unidad Privada` del recurso. Si el `Administrador de PH` o `Revisor Fiscal` están realizando la acción, esta verificación a nivel de recurso puede ser omitida o se les otorga un "bypass" (ej. `financial:account_statement:read_all` permite ver *cualquier* UP).
5.  **Ejecución / Denegación:** Si todas las verificaciones pasan, se ejecuta el `Caso de Uso`. De lo contrario, se deniega el acceso con un error `403 Forbidden` (`Acceso no autorizado`).

## 5. Mecanismos de Autenticación

El `[ResidentAPP]` implementará un mecanismo de `Autenticación` basado en `OAuth 2.0` para la autorización de la API y `JSON Web Tokens (JWT)` para la representación de la identidad del usuario y sus permisos entre solicitudes.

### 5.1. Autenticación de Usuarios (Web y Móvil)

*   **Proveedor de Identidad:** Se explorará la opción de un servicio de autenticación gestionado (`Auth0`, `Amazon Cognito`, `Azure AD B2C`) para externalizar la complejidad de la gestión de identidades, o una implementación interna robusta si los requisitos lo demandan. En cualquier caso, el mecanismo expuesto a las aplicaciones cliente será `OAuth 2.0`.
*   **Flujo de Autenticación:**
    1.  El usuario (Residente, Administrador, Revisor) accede a la `ResidentAPP Web Portal` o `ResidentAPP Mobile App`.
    2.  Ingresa sus credenciales (usuario/contraseña).
    3.  Las aplicaciones clientes envían las credenciales al `ResidentAPP API` (o al proveedor de identidad).
    4.  Tras la validación exitosa, el `ResidentAPP API` (o proveedor) emite un `JWT` de acceso (y un `refresh token` si aplica).
    5.  El cliente almacena el `JWT` de forma segura (ej. `localStorage` con precauciones de seguridad para Web, `Keychain` o `SecureStorage` para móvil) y lo incluye en cada solicitud subsiguiente a la `ResidentAPP API` en el encabezado `Authorization` (Bearer Token).
*   **Registro de Usuarios:** Los nuevos `Residentes` y `Copropietarios` podrán registrarse a través de la aplicación móvil o web. Los `Administradores` y `Revisores Fiscales` serán gestionados por un módulo de administración específico o aprovisionados externamente.
*   **Recuperación de Contraseña:** Implementación segura de un flujo de recuperación de contraseña (ej. envío de token de un solo uso por correo electrónico).

### 5.2. Autenticación de Servicios (Sistemas/Servicios Internos/Externos)

*   Para el `Rol de Sistema / Servicio`, se utilizarán credenciales de servicio (`client_id`/`client_secret`) o tokens `JWT` específicos emitidos por el propio sistema (o un servicio de IAM interno) con roles y permisos predefinidos, para asegurar la comunicación segura entre microservicios (ej. `ResidentAPP API` con `Servicio de Reporting`).

### 5.3. Políticas de Seguridad de Contraseñas

*   **Complejidad:** Requisitos mínimos de longitud, uso de caracteres especiales, mayúsculas y números.
*   **Almacenamiento:** Las contraseñas nunca se almacenarán en texto plano. Se utilizarán algoritmos de `hashing` robustos con `salting` (ej. BCrypt, Argon2).
*   **Rotación:** Recomendación de cambio periódico de contraseñas.
*   **Bloqueo de Cuentas:** Mecanismos de bloqueo temporal de cuentas tras múltiples intentos fallidos de inicio de sesión para mitigar ataques de fuerza bruta.

## 6. Principios de Seguridad Aplicados

Para la fase de Roles y Acceso, se adhieren estrictamente los siguientes principios de seguridad:

*   **Principio del Mínimo Privilegio (Principle of Least Privilege):** Cada usuario, rol o servicio solo debe tener los permisos mínimos necesarios para realizar sus funciones. Esto reduce la superficie de ataque en caso de compromiso.
*   **Separación de Deberes (Separation of Duties):** Ningún rol individual debe tener todos los permisos necesarios para completar una transacción crítica de principio a fin, evitando fraudes o errores malintencionados. (Ej. El `Administrador de PH` puede registrar gastos, pero el `Revisor Fiscal` los audita y no puede modificarlos).
*   **Defensa en Profundidad (Defense in Depth):** Implementar múltiples capas de seguridad para el control de acceso. La autenticación ocurre en la frontera de la API (`Adaptadores de Interfaz`), y la autorización granular ocurre en el `Caso de Uso` o capas adyacentes a la lógica de negocio.
*   **Seguridad por Diseño (Security by Design):** La seguridad no es una característica añadida al final, sino que se integra desde las etapas iniciales de diseño de cada `funcionalidad` y `Caso de Uso`.
*   **Contexto de Seguridad:** Cada solicitud a la `ResidentAPP API` debe llevar un contexto de seguridad (usuario autenticado, roles, permisos) que pueda ser fácilmente accedido y validado por las capas internas.

## 7. Consideraciones Técnicas e Implementación

La implementación de los roles y el acceso se centrará principalmente en el `Contenedor ResidentAPP API`, extendiendo sus `Componentes` y `Puertos` según la `Arquitectura Limpia`.

### 7.1. Capa de Implementación y Orquestación

*   **Adaptadores de Interfaz (API Gateway / Controllers):** Los `REST Controllers` serán responsables de validar el `JWT` de entrada y asegurar que el usuario esté autenticado. Pueden aplicar políticas de autorización de alto nivel (ej. solo `Administrador de PH` puede acceder a `/admin/*`).
*   **Casos de Uso (Business Logic):** La autorización granular, especialmente la basada en recursos (`owner/association`), se realizará dentro o justo antes de la ejecución del `Caso de Uso`. Los `Casos de Uso` recibirán el contexto de seguridad del usuario y utilizarán servicios de autorización (`AuthorizationServicePort`) para tomar decisiones.
*   **Entidades de Dominio:** Las `Entidades` deben permanecer agnósticas a la seguridad. Cualquier lógica de negocio que dependa de los permisos del usuario se encapsulará en los `Casos de Uso` o servicios de dominio.

### 7.2. Persistencia de Usuarios, Roles y Permisos

*   **Base de Datos (PostgreSQL):** Se diseñará un esquema de base de datos relacional en `PostgreSQL` para almacenar la información de usuarios, roles y sus asociaciones con `Unidades Privadas` y permisos.
    *   `users` table: ID, email, password_hash, status, etc.
    *   `roles` table: ID, name (e.g., "ADMIN", "RESIDENT", "FISCAL_REVIEWER").
    *   `user_roles` join table: userId, roleId.
    *   `user_unit_associations` join table: userId, unitId (para el control de acceso basado en recursos).
    *   `permissions` table: ID, name (e.g., "READ_ACCOUNT_STATEMENT", "CREATE_RESERVATION").
    *   `role_permissions` join table: roleId, permissionId.
*   **Puertos y Adaptadores de Repositorio:** Se definirán `UserRepositoryPort`, `RoleRepositoryPort`, `PermissionRepositoryPort` en la capa de `Casos de Uso` o `Entidades`. Las implementaciones (`PostgresUserRepositoryAdapter`, etc.) en la capa de `Frameworks y Drivers` interactuarán con `PostgreSQL` a través de un `ORM` para persistir y recuperar estos datos.

### 7.3. Gestión de Tokens JWT

*   **Generación y Firma:** El `ResidentAPP API` (o un microservicio de autenticación dedicado) será responsable de generar `JWTs` firmados con una clave secreta (o par de claves asimétricas) para asegurar su integridad y autenticidad. Los `JWTs` incluirán `claims` como `userId`, `roles`, y posiblemente un listado de `unidadPrivadaIds` a las que el usuario está asociado, para optimizar las verificaciones de autorización a nivel de recurso.
*   **Validación y Revocación:** Cada solicitud a la `API` que contenga un `JWT` será validada:
    *   Verificación de firma.
    *   Verificación de expiración (`exp`).
    *   Posiblemente, verificación de revocación (para tokens de alto privilegio o en caso de compromiso, usando listas negras o un mecanismo de caché distribuida como `Redis` para almacenar `JWTs` inválidos).

### 7.4. Auditoría de Seguridad y Logging

*   Todas las acciones relacionadas con la `Autenticación` (intentos de inicio de sesión exitosos/fallidos, cambios de contraseña) y la `Autorización` (denegaciones de acceso, acciones críticas) deben ser registradas en un sistema de `logging` centralizado con información relevante (marca de tiempo, `userId`, IP, acción intentada, resultado). Esto es esencial para el atributo de `Seguridad` y cumplimiento normativo.

## 8. Directrices para el Desarrollo Seguro

Para asegurar la implementación efectiva de esta estrategia de roles y acceso, se establecen las siguientes directrices obligatorias:

*   **`TDD` para la Seguridad:** Cada política de autorización, cada flujo de autenticación y cada manejo de errores de seguridad debe ser precedido por `Pruebas Unitarias` y `Pruebas de Integración` que demuestren su correcto funcionamiento y sus casos límite (ej. intentar acceso no autorizado con diferentes roles). Esto es crítico para la `Testabilidad`.
*   **Validación de Entrada y Sanitización:** Toda entrada de usuario (especialmente credenciales y parámetros de autorización) debe ser rigurosamente validada y sanitizada para prevenir ataques como `Inyección SQL`, `Cross-Site Scripting (XSS)` y `Path Traversal`.
*   **Protección contra Ataques Comunes:** Implementar defensas contra `CSRF` (Cross-Site Request Forgery) en aplicaciones web, `Clickjacking`, y otros ataques web conocidos.
*   **Uso de Librerías de Seguridad Estándar:** No "reinventar la rueda". Utilizar librerías y frameworks de seguridad maduros y bien auditados (ej., Spring Security en Java, ASP.NET Core Identity en .NET).
*   **Revisiones de Código de Seguridad:** Realizar revisiones de código específicas enfocadas en la seguridad, prestando atención a la correcta aplicación de los principios de acceso y el manejo de datos sensibles.
*   **Manejo de Errores de Seguridad:** Las respuestas a fallos de autenticación o autorización deben ser genéricas (ej. `401 Unauthorized`, `403 Forbidden`) para no revelar información sensible sobre la lógica interna del sistema o la existencia de usuarios/recursos.

## 9. Conclusión

La fase "Roles y Acceso" es crítica para la integridad y protección del `[ResidentAPP]`. Al establecer roles claros, un modelo de autorización robusto y mecanismos de autenticación seguros, se construye una base sólida que permite a la `lógica de negocio` operar con confianza, sabiendo que el acceso a los datos y las `funcionalidades` está estrictamente controlado. La adherencia a los principios de seguridad, junto con el `Desarrollo Guiado por Pruebas (TDD)` y la `Arquitectura Limpia`, garantizará que el `[ResidentAPP]` no solo sea funcional, sino también intrínsecamente seguro y mantenible.

---