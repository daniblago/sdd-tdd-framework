---

# Fase 5 - Datos / Estado del Proyecto [ResidentAPP]

## 1. Propósito y Alcance

Este documento establece la "Estrategia de Datos y Estado" para el proyecto `[ResidentAPP]`, definiendo los principios rectores, las tecnologías de persistencia, el modelo de datos lógico subyacente y los patrones de acceso a datos. Su propósito es asegurar que la gestión, almacenamiento y recuperación de la información sean robustos, seguros, eficientes y, fundamentalmente, estén alineados con la `Arquitectura Limpia` y los `Principios Fundamentales` del proyecto, en particular la `Independencia de Bases de Datos`.

**Alcance:**
*   Definir la estrategia de persistencia de datos primaria y secundaria.
*   Establecer el modelo de datos lógico a partir de las `Entidades de Dominio` del proyecto.
*   Detallar los patrones de interacción entre las capas de `Casos de Uso` y los mecanismos de persistencia a través de los `Puertos` y `Adaptadores de Interfaz`.
*   Especificar consideraciones clave en cuanto a `Seguridad`, `Rendimiento`, `Escalabilidad`, `Confiabilidad` y `Mantenibilidad` del acceso y almacenamiento de datos.
*   Servir como guía para el diseño de esquemas de bases de datos, la implementación de repositorios y la gestión del ciclo de vida de los datos.

## 2. Contexto y Alineación Arquitectónica

La fase de "Datos / Estado" es intrínseca a la implementación de la `Arquitectura Limpia` del `[ResidentAPP]`. Se adhiere estrictamente a la `Regla de la Dependencia`, asegurando que el núcleo de la `lógica de negocio` (las `Entidades` y `Casos de Uso`) permanezca completamente independiente de los detalles de cómo se persisten los datos.

### 2.1. Independencia de Bases de Datos y DIP

El principio de `Independencia de Bases de Datos`, un pilar de nuestra `Constitución de Arquitectura`, es el eje central de esta fase. La `Capa de Casos de Uso` y las `Entidades` no tendrán conocimiento directo de la infraestructura de persistencia. En su lugar, interactuarán con abstracciones (`Puertos` o `Gateways`) definidas en sus propias capas (o capas más internas). Esto se logra mediante el `Dependency Inversion Principle (DIP)` y la `Inyección de Dependencias (DI)`.

### 2.2. Testabilidad como Primera Clase

La estrategia de datos refuerza la `Testabilidad como Primera Clase`. Los `Casos de Uso` podrán ser probados de forma unitaria y aislada, sin la necesidad de una base de datos real, mediante el uso de implementaciones simuladas (`mocks` o `stubs`) de los `Puertos` de repositorio. Esto es fundamental para el `Desarrollo Guiado por Pruebas (TDD)` y el `Ciclo Red-Green-Refactor`.

### 2.3. Alineación con C4 y Especificación Funcional

*   **Modelo C4 (Fase 4):** Los `Contenedores` de `Base de Datos` (PostgreSQL) y `Almacén de Documentos` (Amazon S3 / Azure Blob Storage) definidos en el diagrama de contenedores se confirman como las tecnologías de persistencia. Los `Componentes` como `AccountRepository Adapter` y `ResidentRepository Adapter` son las implementaciones concretas de los `Puertos` que se describen en esta fase.
*   **Especificación Funcional Detallada (Fase 3):** Las `Funcionalidades` y los `Criterios de Aceptación` (Gherkin) delinean los requisitos de datos. Por ejemplo, la "Consulta de Estado de Cuenta del Residente" implica la persistencia y recuperación de `EstadoDeCuenta`, `MovimientoFinanciero`, `Residente` y `UnidadPrivada`.

## 3. Estrategia de Persistencia de Datos

El `[ResidentAPP]` adoptará un enfoque de persistencia políglota para optimizar el almacenamiento según el tipo y uso de los datos.

### 3.1. Base de Datos Transaccional Primaria (Relacional)

*   **Tecnología:** `PostgreSQL`.
*   **Propósito:** Almacenar todos los datos transaccionales y estructurados del `[ResidentAPP]`, incluyendo información de `Residentes`, `Unidades Privadas`, `Expensas Comunes`, `Cuotas Extraordinarias`, `Movimientos Financieros`, `Amenidades`, `Reservas`, `PQRS`, `Circulares / Comunicados` y datos de configuración del sistema.
*   **Justificación:** `PostgreSQL` ofrece robustez, madurez, capacidades ACID, un ecosistema rico para `ORM` (como `Prisma`) y alta `Confiabilidad` para la integridad de datos críticos. Su soporte para JSONB también proporciona flexibilidad para datos semi-estructurados si fuera necesario en el futuro, sin comprometer la estructura relacional principal.
*   **Patrón de Acceso:** Se utilizará `Prisma ORM` para mapear las `Entidades de Dominio` a la base de datos relacional, lo que simplifica la interacción con type-safety completo y mantiene la `Mantenibilidad` del código de acceso a datos.

### 3.2. Almacén de Documentos (No Relacional / Objetos)

*   **Tecnología:** Amazon S3 o Azure Blob Storage.
*   **Propósito:** Almacenar documentos no estructurados o semi-estructurados de gran volumen, como `RNC` (Reglamento de Copropiedad), actas de `Asamblea General`, `Circulares / Comunicados` en formato PDF, imágenes de perfiles de usuarios o amenidades, y reportes generados (ej. `Estados de Cuenta` en PDF).
*   **Justificación:** Estos servicios ofrecen alta `Escalabilidad`, `Confiabilidad` y `Rendimiento` para el almacenamiento de objetos, desacoplando el almacenamiento de archivos del rendimiento de la base de datos transaccional y reduciendo costos operativos.
*   **Patrón de Acceso:** Se interactuará directamente con el SDK/API del proveedor de la nube, a través de `Adaptadores de Interfaz` específicos que implementen `Puertos` para la gestión de documentos.

### 3.3. Estrategia de Caching (Optimización de Rendimiento)

*   **Propósito:** Mejorar el `Rendimiento` de las operaciones de lectura frecuentes y reducir la carga sobre la base de datos primaria.
*   **Tecnología (propuesta):** Redis (para caché distribuida).
*   **Justificación:** `Redis` proporciona una caché en memoria de baja latencia, ideal para datos que no cambian con frecuencia pero son consultados masivamente (ej. configuración del `PH`, listas de `Amenidades` disponibles, detalles de `Unidades Privadas` menos críticos).
*   **Patrón de Acceso:** La gestión de la caché se realizará en la `Capa de Adaptadores de Interfaz` (Repositorio), con `Casos de Uso` interactuando siempre con los `Puertos` de repositorio sin conocimiento de la caché subyacente.

## 4. Modelo de Datos Lógico (Entidades de Dominio)

Las `Entidades` son el corazón de la `Arquitectura Limpia` y representan las `reglas de negocio` del `[ResidentAPP]`. Son clases puras de dominio TypeScript que encapsulan datos y comportamiento, y son completamente agnósticas a los detalles de persistencia. El modelo de datos lógico se deriva directamente de estas `Entidades` y sus relaciones.

A continuación, se presentan las `Entidades` principales, basadas en el `Glosario` y la `Especificación Funcional`, que formarán la base de nuestro esquema de persistencia:

### 4.1. Entidades Clave y sus Relaciones (Ejemplos)

*   **`PH (Propiedad Horizontal)`**: Representa el complejo residencial.
    *   *Atributos:* `id` (UUID), `nombre`, `direccion`, `nit`, `reglamentoCopropiedadUrl` (referencia a S3/Blob).
    *   *Relaciones:* Contiene múltiples `UnidadPrivada`, `Amenidad`, `Comunicado`.

*   **`UnidadPrivada (UP)`**: Un apartamento, casa o local dentro del `PH`.
    *   *Atributos:* `id` (UUID), `numero`, `coeficienteCopropiedad`, `area`, `tipo` (apartamento, oficina), `phId`.
    *   *Relaciones:* Asociada a `PH`, puede tener múltiples `Residentes` (a través de una tabla intermedia), tiene un `EstadoDeCuenta`.

*   **`Residente`**: Persona que habita o es `Copropietario` de una `Unidad Privada`.
    *   *Atributos:* `id` (UUID), `nombre`, `apellido`, `email`, `telefono`, `tipoUsuario` (Copropietario, Tenedor), `fechaRegistro`.
    *   *Relaciones:* Puede estar asociado a múltiples `UnidadPrivada`. Realiza `PQRS`, `Reservas`.

*   **`EstadoDeCuenta (EC)`**: Registro financiero de una `Unidad Privada`.
    *   *Atributos:* `id` (UUID), `unidadPrivadaId`, `periodo` (ej. "2023-11"), `saldoInicial`, `saldoActual`, `fechaEmision`, `fechaVencimiento`, `pazYSalvoEmitido` (boolean).
    *   *Relaciones:* Contiene múltiples `MovimientoFinanciero`.

*   **`MovimientoFinanciero`**: Transacción de débito o crédito asociada a un `EstadoDeCuenta`.
    *   *Atributos:* `id` (UUID), `estadoDeCuentaId`, `tipo` (Expensa Común, Cuota Extraordinaria, Pago), `descripcion`, `valor`, `fechaMovimiento`, `referenciaPago`.

*   **`Amenidad`**: Espacio común que requiere reserva.
    *   *Atributos:* `id` (UUID), `nombre`, `descripcion`, `capacidad`, `reglasUsoUrl` (referencia a S3/Blob), `phId`.
    *   *Relaciones:* Puede tener múltiples `Reserva`.

*   **`Reserva`**: Registro de una reserva de `Amenidad`.
    *   *Atributos:* `id` (UUID), `amenidadId`, `residenteId`, `fechaReserva`, `horaInicio`, `horaFin`, `estado` (confirmada, cancelada).

*   **`PQRS`**: Petición, Queja, Reclamo o Sugerencia.
    *   *Atributos:* `id` (UUID), `residenteId`, `unidadPrivadaId`, `tipo` (Petición, Queja, Reclamo, Sugerencia), `asunto`, `descripcion`, `fechaCreacion`, `estado` (abierta, en progreso, cerrada).
    *   *Relaciones:* Puede tener múltiples `MensajePQRS`.

*   **`Comunicado`**: Notificación oficial de la administración.
    *   *Atributos:* `id` (UUID), `phId`, `titulo`, `contenido`, `fechaPublicacion`, `dirigidoA` (todos, copropietarios), `documentoAdjuntoUrl` (referencia a S3/Blob).

**Consideraciones para el Modelo:**
*   **Identificadores:** Se utilizarán UUIDs (Universally Unique Identifiers) como claves primarias para la mayoría de las `Entidades` para facilitar la `Escalabilidad` y la distribución en un entorno `Cloud-Native` (evitando dependencias en secuencias autoincrementales).
*   **Tipos de Datos:** Uso de tipos de datos adecuados para garantizar la integridad (ej. `Decimal.js` para valores monetarios para evitar problemas de precisión de punto flotante en `MovimientoFinanciero`).
*   **Normalización:** El modelo buscará un equilibrio entre la normalización (para reducir la redundancia y mejorar la integridad de los datos) y la desnormalización estratégica (para optimizar el `Rendimiento` de consultas específicas, si fuera necesario en el futuro, pero siempre manteniendo el origen de la verdad normalizado).

## 5. Interacción de Datos y Gestión de Dependencias

La interacción con los datos se gestionará a través de la `Regla de la Dependencia`, utilizando el patrón `Repository` como `Puerto` para las `Capas de Casos de Uso` y `Entidades`.

### 5.1. Puertos (Interfaces de Repositorio)

En la `Capa de Casos de Uso`, se definirán interfaces (Puertos) que especifican las operaciones de persistencia que necesitan las `reglas de negocio`. Por ejemplo:

```typescript
// Definido en la capa de Casos de Uso
export interface EstadoDeCuentaRepositoryPort {
  findByUnidadPrivadaIdAndPeriodo(unidadPrivadaId: string, periodo: string): Promise<EstadoDeCuenta | null>;
  findByResidenteId(residenteId: string): Promise<EstadoDeCuenta[]>;
  save(estadoDeCuenta: EstadoDeCuenta): Promise<void>;
  // Otros métodos de persistencia...
}

export interface ResidenteRepositoryPort {
  findById(residenteId: string): Promise<Residente | null>;
  findUnidadesAsociadasByResidenteId(residenteId: string): Promise<UnidadPrivada[]>;
  // Otros métodos de persistencia...
}

export interface DocumentStoragePort {
  uploadDocument(folder: string, fileName: string, content: Buffer, contentType: string): Promise<string>;
  downloadDocument(documentUrl: string): Promise<Buffer>;
  // Otros métodos de gestión de documentos...
}
```

### 5.2. Adaptadores de Interfaz (Implementaciones de Repositorio)

Las implementaciones concretas de estos `Puertos` residirán en la `Capa de Adaptadores de Interfaz` o `Frameworks y Drivers`. Estas implementaciones serán responsables de interactuar con la tecnología de persistencia subyacente (PostgreSQL vía ORM, S3/Blob Storage vía SDK).

```typescript
// Implementado en la capa de Frameworks y Drivers
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaEstadoDeCuentaRepositoryAdapter implements EstadoDeCuentaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}
  // Conversión entre Entidades de Dominio y Modelos de Persistencia (Prisma models)
  // Lógica para interactuar con PostgreSQL vía Prisma
}

@Injectable()
export class S3DocumentStorageAdapter implements DocumentStoragePort {
  constructor(private readonly s3Client: S3Client) {}
  // Lógica para interactuar con Amazon S3 vía AWS SDK v3
}
```

### 5.3. Mapeo entre Dominio y Persistencia (DTOs/Mappers)

Cuando sea necesario, se utilizarán `DTOs` o tipos de modelo específicos para la persistencia (ej. tipos generados por `Prisma`) que pueden no ser idénticos a las `Entidades de Dominio`. `Mappers` (funciones de transformación o clases dedicadas con `class-transformer`) en la `Capa de Adaptadores de Interfaz` serán responsables de la conversión bidireccional entre `Entidades de Dominio` y estos modelos de persistencia, garantizando que el dominio permanezca limpio e independiente.

## 6. Consideraciones de Atributos de Calidad en el Contexto de Datos

Los `Atributos de Calidad` definidos en la `Constitución de Arquitectura` se aplican de manera crítica a la estrategia de datos:

### 6.1. Seguridad
*   **Cifrado de Datos:** Todos los datos sensibles (información personal de `Residentes`, detalles financieros de `EstadoDeCuenta`) deben ser cifrados tanto en tránsito (HTTPS/TLS) como en reposo (cifrado a nivel de base de datos y en el almacén de objetos).
*   **Control de Acceso (RBAC):** Implementación de Roles y Permisos (`Autorización`) robustos a nivel de base de datos y aplicación para asegurar que solo los usuarios autorizados (ej. `Administrador`, `Copropietario` de su propia `UP`) puedan acceder a la información específica. Esto se integra con la `Especificación Funcional` (Escenario de "Acceso no autorizado").
*   **Auditoría de Datos:** Registro detallado de todas las operaciones de lectura/escritura críticas sobre datos sensibles para fines de `auditoría` y cumplimiento.
*   **Anonymization/Masking:** Consideración de técnicas de anonimización o enmascaramiento para entornos de desarrollo y pruebas, especialmente con datos de `Residentes`.

### 6.2. Rendimiento
*   **Optimización de Consultas:** Diseño de esquemas de bases de datos con índices adecuados para las consultas más frecuentes. Optimización continua de las consultas (`SQL`) ejecutadas por los `Adaptadores de Interfaz`.
*   **Estrategia de Caching:** Implementación de caché para datos de lectura intensiva que no cambian con frecuencia, como se mencionó en la sección 3.3.
*   **Paginación y Filtrado:** Implementación de mecanismos de paginación y filtrado en las consultas para evitar la recuperación de grandes volúmenes de datos innecesarios, especialmente para listas y reportes.

### 6.3. Escalabilidad
*   **Escalado Horizontal de Bases de Datos:** Diseño que permita futuras estrategias de escalado horizontal para `PostgreSQL` (ej. réplicas de lectura para descargas de carga, sharding para particionar datos por `PH` o `UP` si el volumen lo justifica).
*   **Escalado de Almacén de Documentos:** Amazon S3/Azure Blob Storage proporcionan escalabilidad elástica y casi ilimitada de forma inherente.
*   **Manejo de Transacciones:** Minimizar la duración de las transacciones de base de datos y optimizar el aislamiento para soportar alta concurrencia.

### 6.4. Confiabilidad y Disponibilidad
*   **Copias de Seguridad y Recuperación (Backup & Restore):** Implementación de políticas de copia de seguridad regulares y automatizadas para `PostgreSQL` y `Almacén de Documentos`, con planes de recuperación probados (`RTO`, `RPO`).
*   **Replicación de Bases de Datos:** Configuración de `PostgreSQL` en alta disponibilidad con réplicas de lectura/escritura o hot standby para tolerancia a fallos.
*   **Monitoreo:** Implementación de monitoreo proactivo de la salud de la base de datos (rendimiento, espacio en disco, conexiones) y del almacén de objetos.
*   **Consistencia de Datos:** Asegurar la consistencia de datos a través de transacciones y, si se usa replicación asíncrona, entender las implicaciones de la consistencia eventual.

### 6.5. Mantenibilidad
*   **Migraciones de Esquema:** Utilización de `Prisma Migrate` para gestionar de forma versionada y automatizada la evolución del esquema de `PostgreSQL`. Las migraciones se generan a partir del `schema.prisma` declarativo y se versionan junto al código fuente.
*   **Código Limpio en Repositorios:** Aplicación de `Código Limpio` y convenciones de nombramiento en las implementaciones de repositorios para facilitar la lectura y el mantenimiento.
*   **Documentación de Esquemas:** Mantener una documentación actualizada del esquema de la base de datos, complementaria a esta fase.

## 7. Directrices para el Diseño e Implementación del Acceso a Datos

*   **TDD Obligatorio:** Todas las implementaciones de los `Adaptadores de Interfaz` (Repositorios) deben ser desarrolladas siguiendo el `Ciclo Red-Green-Refactor`. Esto incluye `Pruebas Unitarias` para la lógica del adaptador (mapeo, manejo de errores) y `Pruebas de Integración` para validar la interacción real con la base de datos o el almacén de objetos.
*   **Validación de Datos:** Implementar validaciones de datos en las capas adecuadas (ej. `Controladores` para entrada, `Entidades` para reglas de negocio, `Adaptadores` para restricciones de persistencia) para mantener la integridad de los datos.
*   **Manejo de Errores Consistente:** Establecer patrones consistentes para el manejo de excepciones y errores relacionados con la persistencia de datos, proporcionando retroalimentación clara y evitando la exposición de detalles internos del sistema.
*   **Registro y Monitoreo:** Implementar un registro detallado de las operaciones de acceso a datos (`queries`, `writes`, `errores`) para facilitar la depuración, el análisis de rendimiento y la auditoría.
*   **Transaccionalidad:** Definir los límites transaccionales claramente, generalmente a nivel de `Caso de Uso`, para asegurar la atomicidad de las operaciones de negocio.

## 8. Conclusión

La estrategia de "Datos / Estado" para el `[ResidentAPP]` se ha diseñado para ser un componente fundamental de un sistema robusto, escalable y mantenible. Al adherirnos a los principios de la `Arquitectura Limpia`, la `Independencia de Bases de Datos` y la `Testabilidad como Primera Clase`, garantizamos que la lógica de negocio permanezca limpia y desacoplada, mientras que la infraestructura de persistencia es eficiente y segura. Esta fase proporciona la base para que los equipos de desarrollo implementen las funcionalidades del `[ResidentAPP]` con confianza y precisión ingenieril.

---