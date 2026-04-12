Como Arquitecto Docente (SpecAgent) IA, procedo a redactar y expandir la fase "Flujos (Workflows)" para el proyecto `[ResidentAPP]`, integrando de manera asertiva y con la exactitud de un ingeniero Senior el conocimiento acumulado de las fases previas (Constitución, Glosario, Especificación Funcional Detallada, Arquitectura C4, Datos/Estado, y Roles y Acceso).

---

# Fase 7 - Flujos (Workflows) del Proyecto [ResidentAPP]

## 1. Propósito y Alcance

Este documento establece la "Estrategia de Flujos (Workflows)" para el proyecto `[ResidentAPP]`, definiendo las secuencias de interacciones clave entre los usuarios, el sistema y los servicios externos para lograr las `funcionalidades` esenciales. Su propósito es ilustrar, de manera precisa y ejecutable, cómo los `Criterios de Aceptación` (Fase 3) se materializan a través de la `Arquitectura Limpia` (Fase 1), cómo los `Contenedores` y `Componentes` (Fase 4) colaboran, cómo los `Roles y Acceso` (Fase 6) son aplicados en cada paso, y cómo los `Datos / Estado` (Fase 5) son gestionados.

**Alcance:**
*   Representar gráficamente, mediante diagramas de secuencia, los flujos principales del sistema.
*   Describir detalladamente los pasos de cada flujo, identificando actores, sistemas y componentes involucrados.
*   Demostrar la aplicación de la `Regla de la Dependencia` y los `Principios SOLID` en la orquestación de las capas.
*   Visualizar la integración de los mecanismos de `Autenticación` y `Autorización` en el flujo de cada `Caso de Uso`.
*   Ilustrar cómo se accede y se modifica el `Estado` de los `Datos` en el contexto de las operaciones de negocio.
*   Servir como una guía fundamental para los equipos de desarrollo para la implementación del comportamiento dinámico del sistema.

## 2. Contexto y Alineación Arquitectónica

La fase de "Flujos (Workflows)" es una vista dinámica de la arquitectura del `[ResidentAPP]`, mostrando la ejecución de las `reglas de negocio` a través de la infraestructura diseñada. Se adhiere estrictamente a los fundamentos establecidos:

### 2.1. Adhesión a la Arquitectura Limpia y TDD

*   **Orquestación de Capas:** Cada flujo detallará cómo los `Controladores` (`Adaptadores de Interfaz`) reciben solicitudes, cómo los `Casos de Uso` (`Application Business Rules`) orquestan la lógica de negocio, cómo interactúan con las `Entidades` (`Core Business Rules`), y cómo los `Adaptadores de Interfaz` gestionan la comunicación con los `Frameworks y Drivers` (bases de datos, servicios externos).
*   **Regla de la Dependencia:** Los diagramas de secuencia reflejarán que las dependencias fluyen siempre hacia adentro, manteniendo el núcleo de negocio desacoplado de los detalles externos, facilitando la `Mantenibilidad` y `Testabilidad`.
*   **Desarrollo Guiado por Pruebas (TDD):** Los flujos sirven como una "pre-especificación" para el desarrollo `TDD`. Cada interacción y punto de decisión en el flujo es un candidato para `Pruebas Unitarias` (para `Entidades` y `Casos de Uso`) y `Pruebas de Integración` (para `Adaptadores` y `Frameworks y Drivers`), asegurando que el comportamiento descrito sea rigurosamente probado.

### 2.2. Integración con Fases Previas

*   **Glosario (Fase 2):** Todos los términos (ej. `Residente`, `Unidad Privada`, `Estado de Cuenta`, `PQRS`, `Amenidad`) se usarán consistentemente en la descripción de los flujos.
*   **Especificación Funcional Detallada (Fase 3):** Los flujos son la implementación detallada de las `Funcionalidades` y los `Criterios de Aceptación` en `Gherkin`. Los `escenarios` de éxito y fallo de Gherkin se mapearán directamente a los caminos principales y alternativos de los flujos.
*   **Arquitectura C4 (Fase 4):** Los `Contenedores` (Web App, Mobile App, API, Database, Reporting Service, Notification Service) y `Componentes` (Controllers, Use Cases, Repositories) identificados en los diagramas C4 formarán los participantes principales en los diagramas de secuencia, proporcionando una vista dinámica de su colaboración.
*   **Datos / Estado (Fase 5):** Los flujos mostrarán explícitamente cuándo y cómo se accede o se modifica la información en la `Base de Datos Transaccional Primaria` (PostgreSQL) o el `Almacén de Documentos` (S3/Blob Storage) a través de los `Puertos` y `Adaptadores de Interfaz` definidos.
*   **Roles y Acceso (Fase 6):** Los puntos de `Autenticación` y `Autorización` se marcarán en los flujos, demostrando cómo los `Roles` y las políticas de acceso basado en recursos (`Unidad Privada`) garantizan la `Seguridad` del sistema.

## 3. Categorías de Flujos Clave

Los flujos se agruparán según los `Módulos Funcionales Principales` (Fase 3) para mantener la coherencia y facilitar la navegación.

### 3.1. Flujos de Gestión de Usuarios y Acceso
*   Inicio de Sesión de Usuario (Autenticación y Generación de Token)
*   Registro de Nuevo Residente
*   Asociación de Residente a Unidad Privada

### 3.2. Flujos de Gestión Financiera
*   **Consulta de Estado de Cuenta del Residente (Ejemplo Detallado)**
*   Pago de Expensa Común / Cuota Extraordinaria
*   Generación de Paz y Salvo

### 3.3. Flujos de Gestión de Amenidades
*   **Reserva de Amenidad (Ejemplo Detallado)**
*   Consulta de Disponibilidad de Amenidades

### 3.4. Flujos de Gestión de Comunicaciones
*   Envío de PQRS por Residente
*   Publicación de Comunicado por Administrador

## 4. Flujos Detallados con Diagramas de Secuencia (PlantUML)

A continuación, se detallan dos flujos clave, ilustrando las interacciones con un alto nivel de precisión ingenieril y la integración de todos los conocimientos acumulados.

### 4.1. Flujo 1: Consulta de Estado de Cuenta del Residente

**Descripción:**
Este flujo describe cómo un `Residente` o `Copropietario` autenticado consulta el `Estado de Cuenta` de una de sus `Unidades Privadas` a través de la `ResidentAPP Mobile App`. Se valida la `Autenticación` y la `Autorización` basada en la asociación del usuario con la `Unidad Privada`. La información se recupera de la `Base de Datos Transaccional Primaria` (PostgreSQL) y se ofrece la opción de generar un PDF a través del `Servicio de Reporting`. Este flujo aborda los `Criterios de Aceptación` de la `Especificación Funcional Detallada` (Fase 3) para la consulta de estado de cuenta.

**Actores / Roles:** `Residente / Copropietario` (Fase 6).
**Contenedores Involucrados:** `ResidentAPP Mobile App`, `ResidentAPP API`, `Base de Datos`, `Servicio de Reporting` (Fase 4).
**Componentes Clave (en ResidentAPP API):** `AccountController`, `AccountUseCase`, `AccountRepository Port/Adapter`, `ResidentRepository Port/Adapter`, `ReportingServiceClient` (Fase 4).
**Datos Involucrados:** `Residente`, `UnidadPrivada`, `EstadoDeCuenta`, `MovimientoFinanciero` (lectura) (Fase 5).

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Sequence.puml

hide footbox

skinparam sequenceMessageAlign center
skinparam defaultTextAlignment center
skinparam handwritten true

title Flujo: Consulta de Estado de Cuenta del Residente

actor "Residente/Copropietario" as Residente
participant "ResidentAPP Mobile App" as MobileApp
box "ResidentAPP API" #LightBlue
    participant "AccountController" as Controller
    participant "AuthorizationService" as AuthZService
    participant "AccountUseCase" as UseCase
    participant "ResidentRepositoryPort" as ResRepoPort
    participant "AccountRepositoryPort" as AccRepoPort
    participant "ReportingServiceClient" as ReportClient
end box
database "Base de Datos (PostgreSQL)" as DB
participant "Servicio de Reporting" as ReportingService

== 1. Autenticación y Solicitud ==
Residente -> MobileApp : 1. Acceder a "Estado de Cuenta" de UP "Apt 101"
MobileApp -> Controller : 1.1. GET /api/v1/accounts/unit/{unitId}/statement \n <<JWT con ID de Residente>>
activate Controller
Controller -> Controller : 1.1.1. **Validar JWT (Autenticación)**
alt JWT Válido
    Controller -> AuthZService : 1.1.2. Verificar rol y permisos (RBAC)
    activate AuthZService
    AuthZService --> Controller : 1.1.2.1. Permiso 'financial:account_statement:read_own' concedido
    deactivate AuthZService
    Controller -> UseCase : 1.1.3. ConsultarEstadoDeCuentaDeResidente(residenteId, unitId)
    activate UseCase
    UseCase -> ResRepoPort : 1.1.3.1. Buscar Residente por ID
    activate ResRepoPort
    ResRepoPort -> DB : 1.1.3.1.1. SELECT * FROM residentes WHERE id = residenteId
    activate DB
    DB --> ResRepoPort : 1.1.3.1.2. Retorna Entidad Residente
    deactivate DB
    deactivate ResRepoPort
    UseCase -> UseCase : 1.1.3.2. **Verificar asociación Residente-Unidad Privada (Autorización basada en recurso)**
    alt Residente Asociado a unitId
        UseCase -> AccRepoPort : 1.1.3.3. Buscar Estado de Cuenta por unitId
        activate AccRepoPort
        AccRepoPort -> DB : 1.1.3.3.1. SELECT * FROM estados_cuenta WHERE unidadPrivadaId = unitId \n JOIN movimientos_financieros
        activate DB
        DB --> AccRepoPort : 1.1.3.3.2. Retorna Entidad EstadoDeCuenta
        deactivate DB
        deactivate AccRepoPort
        UseCase --> Controller : 1.1.3.4. Retorna EstadoDeCuenta (Entidad Dominio)
        deactivate UseCase
        Controller -> MobileApp : 1.1.4. HTTP 200 OK \n <<EstadoDeCuentaDTO>>
        deactivate Controller
        MobileApp -> Residente : 1.2. Mostrar Estado de Cuenta y pagos recientes
    else Residente NO Asociado a unitId
        UseCase --> Controller : 1.1.3.5. Excepción: Acceso No Autorizado
        deactivate UseCase
        Controller -> MobileApp : 1.1.5. HTTP 403 Forbidden \n "Acceso no autorizado"
        deactivate Controller
        MobileApp -> Residente : 1.3. Mostrar mensaje de error (Fase 3: Criterio Gherkin de acceso no autorizado)
    end
else JWT Inválido o Expirado
    Controller -> MobileApp : 1.1.2. HTTP 401 Unauthorized
    deactivate Controller
    MobileApp -> Residente : 1.3. Pedir al usuario que se autentique de nuevo
end

== 2. Generación Opcional de PDF ==
Residente -> MobileApp : 2. Solicitar descarga de PDF
MobileApp -> Controller : 2.1. GET /api/v1/accounts/unit/{unitId}/statement/pdf \n <<JWT con ID de Residente>>
activate Controller
Controller -> Controller : 2.1.1. **Validar JWT (Autenticación y Autorización)**
Controller -> UseCase : 2.1.2. GenerarEstadoDeCuentaPdf(residenteId, unitId)
activate UseCase
UseCase -> ReportClient : 2.1.2.1. Solicitar PDF de Estado de Cuenta
activate ReportClient
ReportClient -> ReportingService : 2.1.2.1.1. Generar PDF (unitId)
activate ReportingService
ReportingService -> DB : 2.1.2.1.1.1. Leer datos para reporte
activate DB
DB --> ReportingService : 2.1.2.1.1.2. Datos financieros
deactivate DB
ReportingService --> ReportClient : 2.1.2.1.2. Retorna URL de PDF (ej. S3/Blob)
deactivate ReportingService
deactivate ReportClient
UseCase --> Controller : 2.1.2.2. Retorna URL de descarga
deactivate UseCase
Controller -> MobileApp : 2.1.3. HTTP 200 OK \n <<{ "pdfUrl": "..." }>>
deactivate Controller
MobileApp -> Residente : 2.2. Ofrecer descarga del PDF
@enduml
```

**Análisis del Flujo:**

*   **Autenticación y Autorización (Fase 6):** En el paso 1.1.1, se valida el `JWT` (Autenticación), y en 1.1.2, se verifica el rol (`Residente/Copropietario`) para un permiso general (RBAC). El paso crítico de `Autorización` basada en recursos ocurre en 1.1.3.2 dentro del `AccountUseCase`, donde se confirma que el `residenteId` autenticado está asociado a la `unidadPrivadaId` solicitada. Esto cumple con los `Criterios de Aceptación` de seguridad.
*   **Arquitectura Limpia (Fase 1, 4):**
    *   `MobileApp` y `ReportingService` son `Frameworks y Drivers`.
    *   `AccountController` es un `Adaptador de Interfaz`, recibiendo la solicitud HTTP y convirtiéndola en una llamada al `Caso de Uso`.
    *   `AccountUseCase` es la `Capa de Casos de Uso`, orquestando la lógica y haciendo las verificaciones de autorización de negocio.
    *   `ResidentRepositoryPort` y `AccountRepositoryPort` son los `Puertos` (interfaces `Gateways`) que el `UseCase` utiliza, siguiendo el `DIP` (Fase 1, 5).
    *   La `Base de Datos` (PostgreSQL) es un `Framework y Driver`, accedida a través de las implementaciones de los `Adapters` (no explícitos en este nivel de detalle en el diagrama de secuencia, pero representados por la flecha de los Ports a la DB).
*   **Datos / Estado (Fase 5):** Los repositorios (`ResidentRepositoryPort`, `AccountRepositoryPort`) son responsables de interactuar con la `Base de Datos` para recuperar las `Entidades` de `Residente` y `EstadoDeCuenta` y sus `Movimientos Financieros`.
*   **Testabilidad (Fase 1):** El `AccountUseCase` puede ser probado aisladamente, "mockeando" los `ResidentRepositoryPort` y `AccountRepositoryPort`, y el `ReportingServiceClient`, verificando toda la lógica de negocio y autorización interna sin dependencias reales de infraestructura.

### 4.2. Flujo 2: Reserva de Amenidad por Residente

**Descripción:**
Este flujo detalla cómo un `Residente` o `Copropietario` autenticado realiza la reserva de una `Amenidad / Área Social` a través de la `ResidentAPP Mobile App`. El sistema verifica la disponibilidad, las reglas de reserva y las restricciones de acceso. Una vez confirmada la reserva, se persiste la información y se envía una notificación.

**Actores / Roles:** `Residente / Copropietario` (Fase 6).
**Contenedores Involucrados:** `ResidentAPP Mobile App`, `ResidentAPP API`, `Base de Datos`, `Servicio de Notificaciones` (Fase 4).
**Componentes Clave (en ResidentAPP API):** `AmenityController`, `AuthorizationService`, `AmenityReservationUseCase`, `AmenityRepository Port`, `ResidentRepository Port`, `NotificationServiceClient` (Fase 4).
**Datos Involucrados:** `Residente`, `UnidadPrivada`, `Amenidad`, `Reserva` (lectura y escritura) (Fase 5).

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Sequence.puml

hide footbox

skinparam sequenceMessageAlign center
skinparam defaultTextAlignment center
skinparam handwritten true

title Flujo: Reserva de Amenidad por Residente

actor "Residente/Copropietario" as Residente
participant "ResidentAPP Mobile App" as MobileApp
box "ResidentAPP API" #LightBlue
    participant "AmenityController" as AmenityController
    participant "AuthorizationService" as AuthZService
    participant "AmenityReservationUseCase" as AmenityUseCase
    participant "AmenityRepositoryPort" as AmenityRepoPort
    participant "ResidentRepositoryPort" as ResRepoPort
    participant "NotificationServiceClient" as NotifClient
end box
database "Base de Datos (PostgreSQL)" as DB
participant "Servicio de Notificaciones" as NotificationService

== 1. Autenticación y Solicitud de Reserva ==
Residente -> MobileApp : 1. Seleccionar Amenidad "Piscina", Fecha/Hora
MobileApp -> AmenityController : 1.1. POST /api/v1/amenities/{amenityId}/reserve \n <<JWT con ID de Residente, Detalles de Reserva>>
activate AmenityController
AmenityController -> AmenityController : 1.1.1. **Validar JWT (Autenticación)**
alt JWT Válido
    AmenityController -> AuthZService : 1.1.2. Verificar rol y permisos (RBAC)
    activate AuthZService
    AuthZService --> AmenityController : 1.1.2.1. Permiso 'amenity:reserve' concedido
    deactivate AuthZService
    AmenityController -> AmenityUseCase : 1.1.3. ReservarAmenidad(residenteId, amenityId, fecha, horaInicio, horaFin)
    activate AmenityUseCase
    AmenityUseCase -> ResRepoPort : 1.1.3.1. Buscar Residente por ID
    activate ResRepoPort
    ResRepoPort -> DB : 1.1.3.1.1. SELECT * FROM residentes WHERE id = residenteId
    activate DB
    DB --> ResRepoPort : 1.1.3.1.2. Retorna Entidad Residente
    deactivate DB
    deactivate ResRepoPort

    AmenityUseCase -> AmenityRepoPort : 1.1.3.2. Buscar Amenidad por ID
    activate AmenityRepoPort
    AmenityRepoPort -> DB : 1.1.3.2.1. SELECT * FROM amenidades WHERE id = amenityId
    activate DB
    DB --> AmenityRepoPort : 1.1.3.2.2. Retorna Entidad Amenidad
    deactivate DB
    deactivate AmenityRepoPort

    AmenityUseCase -> AmenityUseCase : 1.1.3.3. **Validar Reglas de Negocio (Disponibilidad, Aforo, Restricciones)**
    alt Reserva Válida
        AmenityUseCase -> AmenityRepoPort : 1.1.3.4. Crear y Guardar Entidad Reserva
        activate AmenityRepoPort
        AmenityRepoPort -> DB : 1.1.3.4.1. INSERT INTO reservas (residenteId, amenityId, ...) VALUES (...)
        activate DB
        DB --> AmenityRepoPort : 1.1.3.4.2. Retorna Entidad Reserva Creada
        deactivate DB
        deactivate AmenityRepoPort

        AmenityUseCase -> NotifClient : 1.1.3.5. Enviar Notificación de Confirmación (al Residente)
        activate NotifClient
        NotifClient -> NotificationService : 1.1.3.5.1. Enviar Email/SMS (reservaConfirmadaEvent)
        activate NotificationService
        NotificationService --> NotifClient : 1.1.3.5.2. Confirmación de envío
        deactivate NotificationService
        deactivate NotifClient

        AmenityUseCase --> AmenityController : 1.1.3.6. Retorna Reserva Creada (Entidad Dominio)
        deactivate AmenityUseCase
        AmenityController -> MobileApp : 1.1.4. HTTP 201 Created \n <<ReservaDTO>>
        deactivate AmenityController
        MobileApp -> Residente : 1.2. Mostrar confirmación de reserva
    else Reserva Inválida (no disponible, aforo, etc.)
        AmenityUseCase --> AmenityController : 1.1.3.4. Excepción: Reglas de Reserva Violadas
        deactivate AmenityUseCase
        AmenityController -> MobileApp : 1.1.5. HTTP 400 Bad Request \n "Amenidad no disponible"
        deactivate AmenityController
        MobileApp -> Residente : 1.3. Mostrar mensaje de error
    end
else JWT Inválido o Expirado
    AmenityController -> MobileApp : 1.1.2. HTTP 401 Unauthorized
    deactivate AmenityController
    MobileApp -> Residente : 1.3. Pedir al usuario que se autentique de nuevo
end
@enduml
```

**Análisis del Flujo:**

*   **Autenticación y Autorización (Fase 6):** La `Autenticación` del `JWT` se realiza en 1.1.1 en el `AmenityController`. El `AuthorizationService` (1.1.2) verifica el `rol` del usuario. La `Autorización` a nivel de reglas de negocio (ej. ¿Puede este residente reservar esta amenidad? ¿Tiene deudas pendientes que lo impiden?) es parte de la `Validación de Reglas de Negocio` en 1.1.3.3 dentro del `AmenityReservationUseCase`.
*   **Arquitectura Limpia (Fase 1, 4):**
    *   `MobileApp` y `NotificationService` son `Frameworks y Drivers`.
    *   `AmenityController` es un `Adaptador de Interfaz`.
    *   `AmenityReservationUseCase` es la `Capa de Casos de Uso`, conteniendo la `lógica de negocio` de reserva.
    *   `AmenityRepositoryPort` y `ResidentRepositoryPort` son `Puertos` (interfaces `Gateways`) para persistencia, usando `DIP`.
    *   `NotificationServiceClient` es un `Adaptador de Interfaz` para el `Servicio de Notificaciones`.
*   **Datos / Estado (Fase 5):** Los repositorios (`AmenityRepoPort`, `ResRepoPort`) acceden a la `Base de Datos` (PostgreSQL) para leer `Amenidad` y `Residente`, y para escribir la nueva `Entidad Reserva`. La `Estrategia de Caching` (Fase 5) podría aplicarse a la consulta de `Amenidades` si son datos de lectura frecuente.
*   **Atributos de Calidad (Fase 1, 3):**
    *   **Seguridad:** Verificación de autenticación/autorización robusta.
    *   **Confiabilidad:** Manejo de excepciones para reservas inválidas.
    *   **Rendimiento:** El flujo es lineal, con validaciones en la capa de `UseCase` para evitar operaciones innecesarias en la base de datos. La notificación es asíncrona (a través de un cliente a un servicio externo), no bloqueando la respuesta al usuario.
*   **Testabilidad (Fase 1):** El `AmenityReservationUseCase` es altamente testeable. Se pueden "mockear" los repositorios y el cliente de notificaciones para probar escenarios de éxito, fracaso por disponibilidad, aforo o cualquier otra regla de negocio sin interactuar con la infraestructura real.

## 5. Principios Generales de Flujo de Trabajo y Buenas Prácticas

La definición y el desarrollo de estos flujos se regirán por las siguientes directrices, asegurando la calidad y la coherencia en el `[ResidentAPP]`:

*   **Claridad y Consistencia:** Todos los flujos se documentarán de manera uniforme, utilizando una terminología consistente basada en el `Glosario` del proyecto.
*   **Autenticación y Autorización en Cada Punto de Acceso:** Se asegurará que cada punto de entrada (`Controller` o `Endpoint`) al `ResidentAPP API` requiera `Autenticación`, y que la `Autorización` a nivel de `Rol` y `Recurso` se aplique de manera granular en los `Casos de Uso`, tal como se detalla en la Fase 6.
*   **Manejo de Errores Consistente:** Los flujos deben incluir caminos para errores esperados y mecanismos de `Manejo de Errores` que proporcionen retroalimentación clara al usuario y registren los detalles para el diagnóstico.
*   **Registro y Trazabilidad:** Cada paso significativo en un flujo debe generar entradas de `logging` que permitan la trazabilidad de las operaciones, esenciales para `Auditoría` y `Mantenibilidad`.
*   **Comunicación Asíncrona:** Para operaciones que no requieren una respuesta inmediata al usuario o que involucran `Sistemas Externos` lentos (ej. envío de notificaciones), se favorecerán patrones asíncronos para mejorar el `Rendimiento` y la `Escalabilidad`.
*   **Idempotencia:** Cuando sea aplicable (ej. reintentos de pago), se diseñarán los flujos para que las operaciones puedan ejecutarse múltiples veces sin causar efectos secundarios no deseados.
*   **Transaccionalidad:** Los límites transaccionales de la base de datos se definirán cuidadosamente, generalmente a nivel del `Caso de Uso`, para garantizar la `Consistencia de Datos`.
*   **Optimización de Rendimiento:** En cada flujo, se buscarán oportunidades para optimizar el `Rendimiento` (ej. uso de `Caché`, paginación de datos, minimización de llamadas a la base de datos).
*   **Validación de Datos (Fase 5):** La validación de la entrada del usuario se realizará en la `Capa de Adaptadores de Interfaz` (Controlador) para la validación básica, y en la `Capa de Casos de Uso` y `Entidades` para las `reglas de negocio` más complejas.

## 6. Conclusión

La fase "Flujos (Workflows)" es crucial para el `[ResidentAPP]`, ya que traduce la visión estática de la arquitectura y los requisitos funcionales en una comprensión clara y dinámica de cómo el sistema opera. Al documentar estos flujos con la precisión de un ingeniero Senior y utilizando herramientas como `PlantUML`, se establece una hoja de ruta inequívoca para el desarrollo, garantizando que el `[ResidentAPP]` sea no solo funcional, sino también seguro, escalable, mantenible y alineado con los principios de `Arquitectura Limpia` y `TDD` en su esencia. Este nivel de detalle es indispensable para asegurar el éxito en la implementación de un sistema tan crítico como una aplicación para la gestión de `Propiedad Horizontal`.

---