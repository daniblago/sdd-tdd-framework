---

# Fase 4 - Arquitectura C4 del Proyecto [ResidentAPP]

## 1. Propósito y Alcance

Este documento establece la "Arquitectura C4" para el proyecto `[ResidentAPP]`, cuyo objetivo es proporcionar una visión clara, concisa y jerárquica de la estructura del sistema a diferentes niveles de abstracción. Utilizando el `Modelo C4`, se busca facilitar la comunicación efectiva sobre el diseño arquitectónico entre todos los `Stakeholders`, desde los usuarios de negocio hasta los equipos de desarrollo e infraestructura.

**Alcance:**
*   Documentar visualmente la arquitectura del `[ResidentAPP]` utilizando los cuatro niveles de abstracción del `Modelo C4`: Contexto, Contenedores, Componentes y Código (selectivo).
*   Asegurar la alineación de la representación visual con la `Arquitectura Limpia` y los `Principios Fundamentales` establecidos en la `Constitución de Arquitectura` (Fase 1).
*   Servir como una fuente de verdad visual que complemente la `Especificación Funcional Detallada` (Fase 3) y el `Glosario` (Fase 2).
*   Establecer una base comprensible para el diseño, desarrollo, implementación y operación del sistema, reforzando la `Mantenibilidad`, `Flexibilidad` y `Escalabilidad`.

## 2. Contexto y Alineación Arquitectónica

La documentación de la arquitectura a través del `Modelo C4` se integra de forma intrínseca con las fases previas del proyecto `[ResidentAPP]`:

*   **Alineación con la Constitución de Arquitectura (Fase 1):** Los diagramas C4 reflejarán directamente la aplicación de la `Arquitectura Limpia` y sus `Reglas de Dependencia`. Se visualizará cómo los `Principios SOLID` y la `Separación de Preocupaciones` se manifiestan en la estructura de los `Contenedores` y `Componentes`. La `Independencia de Frameworks/Tecnologías`, `UI`, `Bases de Datos` y `Agentes Externos` será evidente en la forma en que las capas internas (representadas por `Componentes` de negocio) se mantienen aisladas de los detalles de infraestructura.
*   **Fundamento en el Glosario (Fase 2):** Todos los términos clave utilizados en los diagramas (ej. `Residente`, `Unidad Privada`, `Administrador`, `API`, `Base de Datos`) se basan en las definiciones unificadas del `Glosario`, garantizando una comprensión común y eliminando ambigüedades.
*   **Soporte a la Especificación Funcional Detallada (Fase 3):** Los diagramas C4 proporcionarán el contexto estructural para las `Funcionalidades` y `Criterios de Aceptación` definidos, mostrando dónde residen e interactúan los elementos que implementan, por ejemplo, la "Consulta de Estado de Cuenta del Residente".

El `Modelo C4` actuará como un puente visual entre la conceptualización de alto nivel y el detalle de implementación, facilitando la adopción del `Desarrollo Guiado por Pruebas (TDD)` al proporcionar un mapa claro de los límites y responsabilidades del sistema.

## 3. Metodología C4 Model: Principios y Niveles

El `Modelo C4` es una técnica para modelar la arquitectura de sistemas de software basada en una serie de diagramas de vistas anidadas (contexto, contenedores, componentes y código).

### 3.1. Nivel 1: Diagrama de Contexto del Sistema (System Context Diagram)

*   **Propósito:** Mostrar cómo el `[ResidentAPP]` se encaja en el ecosistema de TI de un complejo residencial, identificando a los usuarios principales y otros sistemas con los que interactúa. Es la vista de más alto nivel, ideal para todos los `Stakeholders`.
*   **Elementos clave:**
    *   **Personas:** Usuarios humanos que interactúan con el sistema.
    *   **Sistemas de Software:** Otros sistemas (internos o externos) que interactúan con el sistema en cuestión.
    *   **Sistema en Foco:** El `[ResidentAPP]` como una única "caja".
*   **Enfoque en [ResidentAPP]:** Definirá quiénes son los usuarios (`Residente`, `Copropietario`, `Administrador de PH`, `Revisor Fiscal`) y qué otros sistemas son necesarios para su operación (ej. `Pasarela de Pagos`, `Sistema de Notificaciones Externo`, `Sistema de Contabilidad de PH`).

### 3.2. Nivel 2: Diagrama de Contenedores (Container Diagram)

*   **Propósito:** Descomponer el sistema en foco en sus principales bloques de construcción desplegables, o "Contenedores". Un `Contenedor` es una aplicación, un almacén de datos, un microservicio o un servicio externo que se ejecuta en su propio proceso. Es una vista para equipos técnicos y no técnicos.
*   **Elementos clave:**
    *   **Aplicaciones Web/Móviles:** La `UI` principal.
    *   **APIs / Servicios:** Componentes backend que exponen funcionalidades.
    *   **Bases de Datos:** Donde se persiste la información.
    *   **Filas de Mensajes:** Para comunicación asíncrona.
*   **Enfoque en [ResidentAPP]:** Identificará las aplicaciones (`Web App Admin`, `Mobile App Residente`), la `API` central, los almacenes de datos (`Base de Datos Relacional`, `Base de Datos de Documentos`) y cualquier servicio de `Integración` o `Mensajería` que se considere una unidad desplegable independiente. Aquí se visualizarán las decisiones de tecnología de alto nivel (ej. "RESTful API", "Base de datos PostgreSQL").

### 3.3. Nivel 3: Diagrama de Componentes (Component Diagram)

*   **Propósito:** Descomponer un `Contenedor` específico en los `Componentes` que lo forman. Un `Componente` es una agrupación lógica de código dentro de un `Contenedor`, con una `única responsabilidad bien definida` y una `interfaz bien definida`. Es una vista dirigida principalmente a los equipos de desarrollo.
*   **Elementos clave:**
    *   **Componentes:** Agrupaciones de clases que trabajan juntas para implementar una funcionalidad (ej. "Gestión de Usuarios", "Módulo de Pagos").
    *   **Interfaces:** Los `Puertos` que exponen los `Componentes`.
*   **Alineación con Arquitectura Limpia en [ResidentAPP]:** Este nivel es crucial para visualizar la `Arquitectura Limpia`. Los `Componentes` dentro de la `API` del `[ResidentAPP]` se mapearán directamente a las capas:
    *   **Dominio/Entidades:** `Componentes` que representan las `Entidades` y sus `reglas de negocio` (`Residente`, `UnidadPrivada`, `EstadoDeCuenta`).
    *   **Casos de Uso:** `Componentes` que implementan los `Casos de Uso` (`ConsultarEstadoDeCuentaDeResidente`, `ReservarAmenidad`).
    *   **Adaptadores de Interfaz:** `Componentes` que implementan `Controladores` (API REST), `Presentadores`, y `Gateways` (interfaces de `Repositorio`).
    *   **Infraestructura/Frameworks y Drivers:** `Componentes` que implementan los `Frameworks y Drivers` (ej. repositorios de base de datos concretos, adaptadores de servicios externos). La `Regla de Dependencia` (las flechas apuntando hacia adentro) será explícitamente representada.

### 3.4. Nivel 4: Diagrama de Código (Code Diagram)

*   **Propósito:** Mostrar los detalles de implementación dentro de un `Componente` específico. Esto puede incluir clases, interfaces y métodos. Es la vista de más bajo nivel, dirigida exclusivamente a los desarrolladores para entender la estructura interna del código.
*   **Elementos clave:** Diagramas de Clases UML, diagramas de secuencia.
*   **Enfoque en [ResidentAPP]:** Este nivel se aplicará selectivamente a los `Componentes` más complejos o críticos para detallar la estructura interna de clases, cómo se implementa un `Caso de Uso` específico con sus `Entidades` y `Puertos`, y cómo se maneja la `Inyección de Dependencias (DI)`. No se documentará cada `Componente` a este nivel para evitar la sobrecarga de información, sino aquellos que requieran una comprensión profunda.

## 4. Aplicación del Modelo C4 al Proyecto [ResidentAPP]

A continuación, se presenta una conceptualización de los diagramas C4 para el `[ResidentAPP]`.

### 4.1. Nivel 1: Diagrama de Contexto del Sistema [ResidentAPP]

Este diagrama de alto nivel ilustra el `[ResidentAPP]` como una unidad, interactuando con sus usuarios y sistemas externos.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

skinparam Ls "SystemContext"

title Diagrama de Contexto del Sistema para ResidentAPP

Person(residente, "Residente/Copropietario", "Usuario de Unidad Privada, Tenedor o Propietario de apartamento/local")
Person(administrador, "Administrador de PH", "Gestiona la propiedad horizontal, usuarios, finanzas y comunicaciones")
Person(revisor_fiscal, "Revisor Fiscal", "Audita la transparencia contable y cumplimiento legal")

System(resident_app, "ResidentAPP", "Sistema de gestión integral para Propiedades Horizontales (PH)")

System_Ext(payment_gateway, "Pasarela de Pagos", "Sistema externo para procesar transacciones financieras")
System_Ext(notification_service, "Servicio de Notificaciones", "Sistema externo para envío de emails y SMS")
System_Ext(accounting_system, "Sistema de Contabilidad PH", "Sistema externo para gestión contable y financiera de la PH")


Rel(residente, resident_app, "Consulta Estados de Cuenta, realiza reservas, envía PQRS, recibe comunicados")
Rel(administrador, resident_app, "Gestiona Residentes, Unidades Privadas, Expensas Comunes, Amenidades, PQRS, Comunicados")
Rel(revisor_fiscal, resident_app, "Consulta reportes financieros y auditorías")

Rel(resident_app, payment_gateway, "Realiza pagos de Expensas Comunes y Cuotas Extraordinarias", "HTTPS/API")
Rel(resident_app, notification_service, "Envía notificaciones sobre pagos, reservas, PQRS y comunicados", "HTTPS/API")
Rel(resident_app, accounting_system, "Sincroniza datos financieros (Expensas, Pagos, Saldos)", "HTTPS/API/Batch")

@enduml
```

**Descripción:**
El `[ResidentAPP]` es el núcleo central que interactúa con tres tipos de usuarios (`Residente/Copropietario`, `Administrador de PH`, `Revisor Fiscal`) y tres `Sistemas Externos` cruciales: una `Pasarela de Pagos` para transacciones, un `Servicio de Notificaciones` para comunicaciones (`Circulares / Comunicados`, `PQRS`), y un `Sistema de Contabilidad PH` para la gestión financiera avanzada, reforzando la `Independencia de Agentes Externos`.

### 4.2. Nivel 2: Diagrama de Contenedores del Sistema [ResidentAPP]

Este diagrama descompone el `[ResidentAPP]` en sus principales `Contenedores` desplegables, mostrando sus responsabilidades y cómo interactúan.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

skinparam Ls "Container"

title Diagrama de Contenedores del Sistema ResidentAPP

Person(residente, "Residente/Copropietario", "Usuario de Unidad Privada, Tenedor o Propietario de apartamento/local")
Person(administrador, "Administrador de PH", "Gestiona la propiedad horizontal, usuarios, finanzas y comunicaciones")
Person(revisor_fiscal, "Revisor Fiscal", "Audita la transparencia contable y cumplimiento legal")

System_Ext(payment_gateway, "Pasarela de Pagos", "Sistema externo para procesar transacciones financieras")
System_Ext(notification_service, "Servicio de Notificaciones", "Sistema externo para envío de emails y SMS")
System_Ext(accounting_system, "Sistema de Contabilidad PH", "Sistema externo para gestión contable y financiera de la PH")

Container(web_app_admin, "ResidentAPP Web Portal", "Aplicación Web (SPA: React 18.x / TypeScript)", "Proporciona interfaz de gestión para Administradores y Revisor Fiscal.")
Container(mobile_app_residente, "ResidentAPP Mobile App", "Aplicación Móvil (React Native / TypeScript)", "Proporciona interfaz para Residentes y Copropietarios.")
Container(api_gateway, "ResidentAPP API", "API RESTful (NestJS / TypeScript)", "API central que expone la lógica de negocio a las aplicaciones cliente.")
Container(database, "Base de Datos", "PostgreSQL", "Almacena todos los datos transaccionales de la PH (Residentes, UP, finanzas, reservas, etc.).")
Container(document_storage, "Almacén de Documentos", "Amazon S3 / Azure Blob Storage", "Almacena documentos como RNC, actas, comunicados en formatos PDF.")
Container(reporting_service, "Servicio de Reporting", "Microservicio (NestJS / TypeScript)", "Genera reportes complejos (ej. Estados de Cuenta PDF, informes de gestión).")

Rel(residente, mobile_app_residente, "Utiliza", "HTTPS")
Rel(mobile_app_residente, api_gateway, "Consumo de API", "JSON/HTTPS")

Rel(administrador, web_app_admin, "Utiliza", "HTTPS")
Rel(revisor_fiscal, web_app_admin, "Utiliza", "HTTPS")
Rel(web_app_admin, api_gateway, "Consumo de API", "JSON/HTTPS")

Rel(api_gateway, database, "Lee/Escribe datos", "Prisma ORM")
Rel(api_gateway, document_storage, "Almacena/Recupera documentos", "SDK/API")
Rel(api_gateway, payment_gateway, "Procesa pagos", "HTTPS/API")
Rel(api_gateway, notification_service, "Envía notificaciones", "HTTPS/API")
Rel(api_gateway, reporting_service, "Solicita generación de reportes", "tRPC/HTTPS")

Rel(reporting_service, database, "Lee datos para reportes", "Prisma ORM")
Rel(reporting_service, document_storage, "Guarda reportes generados (ej. PDFs)", "SDK/API")

Rel_R(api_gateway, accounting_system, "Sincronización de datos (push/pull)", "HTTPS/API/Batch")

@enduml
```

**Descripción:**
El `[ResidentAPP]` se compone de:
*   **Interfaces de Usuario:** `ResidentAPP Web Portal` (para administradores y revisores) y `ResidentAPP Mobile App` (para residentes). Estas son `Frameworks y Drivers` en la `Arquitectura Limpia`.
*   **Backend Central:** `ResidentAPP API`, una `API RESTful` que encapsula la `lógica de negocio` y coordina todas las operaciones, funcionando como el principal `Adaptador de Interfaz` y `Caso de Uso` orquestador.
*   **Almacenamiento de Datos:** `Base de Datos` (PostgreSQL) para datos estructurados y `Almacén de Documentos` (Amazon S3 / Azure Blob Storage) para archivos, ambas son `Frameworks y Drivers`.
*   **Servicio de Reporting:** Un microservicio dedicado para la generación de informes complejos, desacoplando esta funcionalidad de la `API` principal y mejorando la `Escalabilidad` y `Rendimiento`.
Las interacciones con `Sistemas Externos` (`Pasarela de Pagos`, `Servicio de Notificaciones`, `Sistema de Contabilidad PH`) son gestionadas principalmente por la `ResidentAPP API`, manteniendo la `Independencia de Agentes Externos`.

### 4.3. Nivel 3: Diagrama de Componentes para un Contenedor (Ejemplo: ResidentAPP API)

Este diagrama detalla los `Componentes` internos de la `ResidentAPP API`, mostrando cómo la `Arquitectura Limpia` se aplica dentro de este `Contenedor`. Nos centraremos en los `Componentes` relevantes para la "Consulta de Estado de Cuenta del Residente" (Fase 3).

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

skinparam Ls "Component"

title Diagrama de Componentes: ResidentAPP API (Foco en Estado de Cuenta)

Container_Boundary(api, "ResidentAPP API") {

    Component(account_controller, "AccountController", "REST Controller", "Maneja solicitudes HTTP para Estados de Cuenta y Pagos.")
    Component(account_use_case, "AccountUseCase", "Caso de Uso", "Orquesta la lógica de negocio para consultar y gestionar Estados de Cuenta.")
    Component(financial_entity, "Financial Entities", "Entidades de Dominio", "Representa la lógica y datos de alto nivel de Expensas, Cuotas, Pagos, Estado de Cuenta.")
    Component(resident_entity, "Resident Entities", "Entidades de Dominio", "Representa la lógica y datos de Residente y Unidad Privada.")

    Component(account_repo_port, "AccountRepository Port", "Interface Gateway", "Define el contrato para la persistencia de datos financieros.")
    Component(resident_repo_port, "ResidentRepository Port", "Interface Gateway", "Define el contrato para la persistencia de datos de residentes.")

    Component(account_repo_adapter, "AccountRepository Adapter", "Prisma ORM Implementation", "Implementa AccountRepository Port usando PostgreSQL.")
    Component(resident_repo_adapter, "ResidentRepository Adapter", "Prisma ORM Implementation", "Implementa ResidentRepository Port usando PostgreSQL.")

    Component(reporting_client, "ReportingServiceClient", "API Client", "Cliente para interactuar con el Servicio de Reporting.")

    Rel(account_controller, account_use_case, "Invoca operaciones de Caso de Uso", "HTTP")

    Rel(account_use_case, financial_entity, "Interactúa con", "Métodos de dominio")
    Rel(account_use_case, resident_entity, "Interactúa con", "Métodos de dominio")

    Rel(account_use_case, account_repo_port, "Usa interfaz para persistencia", "DIP")
    Rel(account_use_case, resident_repo_port, "Usa interfaz para persistencia", "DIP")
    Rel(account_use_case, reporting_client, "Solicita generación de PDF")

    Rel(account_repo_adapter, account_repo_port, "Implementa", "Prisma ORM")
    Rel(resident_repo_adapter, resident_repo_port, "Implementa", "Prisma ORM")

}

System_Boundary(external, "Sistemas Externos e Infraestructura") {
    Container_Ext(database, "Base de Datos", "PostgreSQL")
    Container_Ext(reporting_service, "Servicio de Reporting", "Microservicio")
}

Rel(account_repo_adapter, database, "Lee/Escribe datos", "Prisma ORM")
Rel(resident_repo_adapter, database, "Lee/Escribe datos", "Prisma ORM")
Rel(reporting_client, reporting_service, "Invoca API", "tRPC/HTTPS")

@enduml
```

**Descripción:**
Dentro de la `ResidentAPP API`, los `Componentes` se organizan de acuerdo a la `Arquitectura Limpia`:
*   **Entidades de Dominio:** `Financial Entities` y `Resident Entities` son las capas más internas, que contienen las `reglas de negocio` del `[ResidentAPP]`.
*   **Casos de Uso:** `AccountUseCase` es el `Caso de Uso` que orquesta la lógica para consultar estados de cuenta, interactuando con las `Entidades` y definiendo `Puertos` para la persistencia.
*   **Adaptadores de Interfaz:**
    *   `AccountController` actúa como el `Controlador` para las solicitudes REST.
    *   `AccountRepository Port` y `ResidentRepository Port` son las interfaces (`Gateways`) que los `Casos de Uso` utilizan para acceder a la persistencia (cumpliendo `DIP`).
    *   `AccountRepository Adapter` y `ResidentRepository Adapter` son las implementaciones concretas de esos `Gateways`, utilizando `Prisma ORM` para interactuar con la `Base de Datos`.
    *   `ReportingServiceClient` es un adaptador para el `Servicio de Reporting`.
*   **Regla de Dependencia:** Las flechas de dependencia siempre apuntan hacia adentro, desde los `Controladores` hacia los `Casos de Uso` y `Entidades`, y desde las implementaciones de repositorios hacia sus interfaces, asegurando la `Independencia de Bases de Datos` e `Independencia de Frameworks`. La `Testabilidad` de `AccountUseCase` está garantizada, ya que se puede probar sin la necesidad de una base de datos real, mockeando los `Ports`.

### 4.4. Nivel 4: Diagrama de Código (Ejemplo selectivo para el `AccountUseCase`)

Este diagrama, opcional para la mayoría de los `Componentes`, se utiliza aquí para ilustrar en detalle cómo el `AccountUseCase` interactúa con sus `Entidades` y `Puertos` (interfaces) a nivel de clases.

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

skinparam Ls "Class"

title Diagrama de Clases: Detalle del Caso de Uso de Estado de Cuenta

package "Application Layer (Use Cases)" {
    class ConsultarEstadoDeCuentaDeResidenteUseCase {
        - accountRepository: AccountRepositoryPort
        - residentRepository: ResidentRepositoryPort
        - reportingService: ReportingServiceClient
        + execute(query: ConsultaEstadoCuentaQuery): Promise<EstadoCuentaDTO>
    }
}

package "Domain Layer (Entities)" {
    class EstadoCuenta {
        - id: string
        - unidadPrivadaId: string
        - periodo: string
        - saldoActual: Decimal
        - movimientos: MovimientoFinanciero[]
        + calcularSaldo(): Decimal
        + aplicarPago(monto: Decimal): void
    }

    class MovimientoFinanciero {
        - tipo: string (Expensa, Pago, CuotaExtraordinaria)
        - valor: Decimal
        - fecha: Date
        - descripcion: string
    }

    class Residente {
        - id: string
        - nombre: string
        - email: string
        - unidadesAsociadas: UnidadPrivada[]
        + tieneAcceso(unidadId: string): boolean
    }

    class UnidadPrivada {
        - id: string
        - numero: string
        - coeficiente: Decimal
        - propietarioId: string
    }
}

package "Interface Adapters (Ports)" {
    interface AccountRepositoryPort {
        + findByUnidadPrivadaId(unidadId: string): Promise<EstadoCuenta | null>
        + save(estadoCuenta: EstadoCuenta): Promise<void>
    }

    interface ResidentRepositoryPort {
        + findById(residenteId: string): Promise<Residente | null>
    }

    interface ReportingServiceClient {
        + generateEstadoCuentaPdf(estadoCuentaId: string): Promise<Buffer>
    }
}

package "Interface Adapters (DTOs)" {
    class ConsultaEstadoCuentaQuery {
        - residenteId: string
        - unidadPrivadaId: string
    }

    class EstadoCuentaDTO {
        - numeroUnidad: string
        - saldoTotal: number
        - detalleMovimientos: MovimientoDTO[]
        - urlDescargaPDF: string
    }

    class MovimientoDTO {
        - tipo: string
        - valor: number
        - fecha: Date
        - descripcion: string
    }
}

ConsultarEstadoDeCuentaDeResidenteUseCase ..> AccountRepositoryPort : <<uses>>
ConsultarEstadoDeCuentaDeResidenteUseCase ..> ResidentRepositoryPort : <<uses>>
ConsultarEstadoDeCuentaDeResidenteUseCase ..> ReportingServiceClient : <<uses>>

ConsultarEstadoDeCuentaDeResidenteUseCase .right.> EstadoCuentaDTO : <<returns>>
ConsultarEstadoDeCuentaDeResidenteUseCase .right.> ConsultaEstadoCuentaQuery : <<receives>>

EstadoCuenta o-- MovimientoFinanciero : contiene
Residente o-- UnidadPrivada : asociado a

AccountRepositoryPort .right.> EstadoCuenta : <<persists>>
ResidentRepositoryPort .right.> Residente : <<retrieves>>
ReportingServiceClient .right.> EstadoCuenta : <<processes>>

@enduml
```

**Descripción:**
Este diagrama de clases ilustra el detalle del `ConsultarEstadoDeCuentaDeResidenteUseCase`.
*   El `UseCase` recibe un `ConsultaEstadoCuentaQuery` (un `DTO` de entrada), utiliza las interfaces (`Ports`) `AccountRepositoryPort` y `ResidentRepositoryPort` para obtener las `Entidades` de `EstadoCuenta` y `Residente` (cumpliendo `DIP`).
*   Las `Entidades` (`EstadoCuenta`, `MovimientoFinanciero`, `Residente`, `UnidadPrivada`) encapsulan la `lógica de negocio` de dominio, como `calcularSaldo()` o `tieneAcceso()`.
*   Finalmente, el `UseCase` utiliza `ReportingServiceClient` para generar el PDF y retorna un `EstadoCuentaDTO` (un `DTO` de salida), adaptando la información para la capa de presentación.
Esta vista detallada es una representación clara de la `Separación de Preocupaciones` y cómo el `Ciclo Red-Green-Refactor` y las `Pruebas Unitarias` se aplicarían a cada una de estas clases.

## 5. Directrices para la Elaboración y Mantenimiento de Diagramas C4

Para asegurar la utilidad y precisión de los diagramas C4 en el `[ResidentAPP]`, se establecen las siguientes directrices:

*   **Herramientas:** Se recomienda el uso de herramientas de "Diagrams as Code" como `PlantUML` (utilizado en este documento) o `Mermaid` para generar los diagramas. Esto permite versionar los diagramas junto al código fuente y automatizar su generación. Alternativamente, herramientas como `Structurizr` o `draw.io` con la plantilla C4 pueden ser utilizadas.
*   **Control de Versiones:** Todos los archivos de definición de los diagramas C4 deben ser gestionados en el sistema de control de versiones del proyecto (ej. Git), asegurando la trazabilidad y colaboración.
*   **Documento Vivo:** Los diagramas de arquitectura son documentos vivos. Cualquier cambio significativo en la arquitectura del sistema (`Contenedores`, `Componentes`, `Tecnologías`, `Integraciones`) debe reflejarse y validarse en los diagramas C4 correspondientes. Esto es crítico para mantener la `Mantenibilidad` y `Flexibilidad`.
*   **Consistencia con el Código:** Los diagramas deben reflejar el estado actual del código. Se deben realizar revisiones periódicas para asegurar que no haya "deriva arquitectónica" (architectural drift), donde el código diverge de la arquitectura documentada.
*   **Enfoque de "Necesidad de Saber":** Cada nivel de diagrama debe proporcionar solo la información relevante para su audiencia, evitando la sobrecarga. El `Nivel 4` (`Código`) es especialmente sensible y debe usarse de forma esporádica para `Componentes` críticos o complejos.
*   **Glosario Integrado:** Se debe hacer referencia constante a los términos del `Glosario` del proyecto en los diagramas para mantener la consistencia en el lenguaje.

## 6. Impacto y Beneficios de la Arquitectura C4 en [ResidentAPP]

La adopción del `Modelo C4` en el `[ResidentAPP]` aporta beneficios significativos, alineados con los `Atributos de Calidad` y `Principios Fundamentales` del proyecto:

*   **Claridad y Comprensión:** Mejora radicalmente la capacidad de todos los `Stakeholders` (negocio, desarrollo, QA, operaciones) para entender la estructura del sistema, sus límites y cómo sus partes interactúan. Esto impacta positivamente la `Flexibilidad` y `Mantenibilidad`.
*   **Comunicación Efectiva:** Sirve como un lenguaje visual común, reduciendo la ambigüedad y facilitando las discusiones sobre diseño y decisiones arquitectónicas.
*   **Alineación del Equipo:** Asegura que todos los miembros del equipo tienen una visión compartida del sistema y cómo sus contribuciones individuales encajan en el panorama general.
*   **Guía para el Desarrollo:** Proporciona un mapa claro para el desarrollo, facilitando la implementación de la `Arquitectura Limpia` y la aplicación consistente de los `Principios SOLID` y `DIP`. Es una herramienta valiosa para guiar el `TDD` en la construcción de `Componentes` y `Casos de Uso`.
*   **Análisis de Impacto:** Permite a los arquitectos y desarrolladores evaluar el impacto de los cambios propuestos antes de la implementación, mejorando la `Mantenibilidad` y reduciendo el riesgo de `Deuda Técnica`.
*   **Onboarding Simplificado:** Los nuevos miembros del equipo pueden asimilar rápidamente la arquitectura del sistema.

Esta fase de "Arquitectura C4" es un componente esencial para construir un `[ResidentAPP]` robusto, escalable y mantenible, garantizando que el diseño y la implementación se mantengan fieles a la visión arquitectónica original.

---