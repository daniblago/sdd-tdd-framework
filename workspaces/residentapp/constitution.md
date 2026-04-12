---

# Constitución de Arquitectura del Proyecto [ResidentAPP]

## 1. Propósito y Alcance

Este documento establece la "Constitución" arquitectónica del proyecto [ResidentAPP], definiendo los principios fundamentales, el estilo arquitectónico, la metodología de desarrollo mandatoria y los atributos de calidad esenciales. Su propósito es asegurar una base sólida, mantenible, escalable y resiliente para el sistema, garantizando la coherencia y la adherencia a las mejores prácticas de la industria.

**Alcance:**
*   Definir el estilo arquitectónico principal (Arquitectura Limpia).
*   Establecer TDD como la metodología de desarrollo obligatoria.
*   Presentar los principios y reglas de diseño que gobernarán el desarrollo de software.
*   Delinear los atributos de calidad clave del sistema.
*   Servir como referencia principal para todas las decisiones arquitectónicas y de diseño a lo largo del ciclo de vida del proyecto.

## 2. Principios Fundamentales

Los siguientes principios son la base de nuestra cultura de desarrollo y deben ser aplicados en todas las capas y componentes del sistema:

*   **Independencia de Frameworks/Tecnologías:** El núcleo del negocio debe ser independiente de frameworks externos, bases de datos, UI, y cualquier otro detalle externo. Esto nos permite cambiar dichos detalles sin afectar las reglas de negocio esenciales.
*   **Independencia de UI:** La interfaz de usuario puede cambiar fácilmente sin alterar el resto del sistema.
*   **Independencia de Bases de Datos:** La lógica de negocio no debe saber que existe una base de datos SQL, NoSQL o cualquier otra. Los detalles de persistencia son plug-ins.
*   **Independencia de Agentes Externos:** Las reglas de negocio no deben depender de la existencia de sistemas externos o servicios de terceros.
*   **Testabilidad como Primera Clase:** El diseño debe permitir que las reglas de negocio sean probadas independientemente de la UI, la base de datos, los frameworks o cualquier otro elemento externo.
*   **Desarrollo Guiado por Pruebas (TDD) Obligatorio:** Toda nueva funcionalidad o corrección de errores debe ser precedida por la escritura de pruebas automatizadas que demuestren el comportamiento deseado. No se acepta código sin pruebas.
*   **Separación de Preocupaciones (SoC):** Cada componente o capa debe tener una única responsabilidad bien definida.
*   **Principios SOLID:**
    *   **S**ingle Responsibility Principle (SRP): Una clase debe tener una y solo una razón para cambiar.
    *   **O**pen/Closed Principle (OCP): Las entidades de software deben estar abiertas para extensión, pero cerradas para modificación.
    *   **L**iskov Substitution Principle (LSP): Los subtipos deben ser sustituibles por sus tipos base sin alterar la corrección del programa.
    *   **I**nterface Segregation Principle (ISP): Los clientes no deben ser forzados a depender de interfaces que no utilizan.
    *   **D**ependency Inversion Principle (DIP): Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones. Las abstracciones no deben depender de los detalles. Los detalles deben depender de las abstracciones.

## 3. Estilo Arquitectónico: Arquitectura Limpia (Clean Architecture)

Adoptamos la Arquitectura Limpia como nuestro estilo arquitectónico primario. Este enfoque organiza el código en capas concéntricas, donde las capas internas encapsulan las reglas de negocio de alto nivel y son independientes de las capas externas, que manejan los detalles de implementación.

### 3.1. Las Capas y la Regla de Dependencia

El principio fundamental es la **Regla de Dependencia**: Las dependencias del código fuente solo pueden apuntar hacia adentro. Las capas internas no deben saber nada sobre las capas externas.

1.  **Entidades (Entities / Business Rules):**
    *   **Descripción:** Contienen las reglas de negocio más generales y de alto nivel. Son objetos que encapsulan datos y métodos para operar sobre esos datos. Son el corazón del sistema, independientes de cualquier aplicación específica.
    *   **Responsabilidad:** Modelar las reglas de negocio primarias.
    *   **Dependencias:** Ninguna capa externa (UI, DB, Web) debe afectar a las entidades.

2.  **Casos de Uso (Use Cases / Application Business Rules):**
    *   **Descripción:** Contienen las reglas de negocio específicas de la aplicación. Orchestran el flujo de datos hacia y desde las Entidades, y dirigen a las Entidades a utilizar sus reglas de negocio.
    *   **Responsabilidad:** Implementar las funcionalidades específicas que la aplicación requiere, orquestando las interacciones entre las Entidades y las interfaces de datos (Gateways).
    *   **Dependencias:** Dependen de las Entidades y de interfaces (puertos) definidos en esta misma capa o en las Entidades.

3.  **Adaptadores de Interfaz (Interface Adapters):**
    *   **Descripción:** Convierten datos desde el formato más conveniente para las capas externas (Web, DB) al formato más conveniente para las capas internas (Use Cases, Entities).
    *   **Ejemplos:**
        *   **Controladores/Presentadores (Controllers/Presenters):** Adaptan los datos de entrada de la UI a los Casos de Uso y los datos de salida de los Casos de Uso a un formato presentable para la UI.
        *   **Gateways (Interfaces de Repositorio):** Definen los contratos (interfaces) para interactuar con bases de datos o servicios externos. Los Casos de Uso invocan estos contratos.
        *   **Serializadores/Mappers:** Convierten entre modelos de dominio y DTOs (Data Transfer Objects).
    *   **Responsabilidad:** Adaptar la información para cruzar los límites de la arquitectura.
    *   **Dependencias:** Dependen de los Casos de Uso y de las Entidades.

4.  **Frameworks y Drivers (External Details):**
    *   **Descripción:** La capa más externa. Contiene los detalles de implementación: frameworks web (Spring, ASP.NET Core, Express), bases de datos (ORM como JPA, Entity Framework), herramientas externas, dispositivos.
    *   **Responsabilidad:** Implementar los "enchufes" (drivers) de los Gateways definidos en los Adaptadores de Interfaz. Concretar las interfaces de acceso a datos y servicios.
    *   **Ejemplos:** Implementaciones de bases de datos (repositorios), REST APIs, UI frameworks (React, Angular).
    *   **Dependencias:** Dependen de todas las capas internas, pero las capas internas no dependen de esta capa.

## 4. Metodología Obligatoria: Desarrollo Guiado por Pruebas (TDD)

El Desarrollo Guiado por Pruebas (TDD) no es opcional; es la metodología fundamental para la construcción de nuestro software. TDD es una disciplina de desarrollo de software donde se escribe una prueba fallida antes de escribir cualquier código de producción para cumplir con esa prueba, seguido de una refactorización para mejorar el diseño del código.

### 4.1. El Ciclo de TDD: Red-Green-Refactor

1.  **ROJO (RED):** Escribir una pequeña prueba automatizada que falla porque la funcionalidad aún no existe. Esta prueba debe ser específica y probar un comportamiento particular.
2.  **VERDE (GREEN):** Escribir la cantidad mínima de código de producción necesario para que la prueba ROJA pase (se vuelva VERDE). El objetivo aquí es simplemente hacer que la prueba pase, sin preocuparse excesivamente por el diseño aún.
3.  **REFACTORIZAR (REFACTOR):** Una vez que la prueba es VERDE, refactorizar el código de producción y las pruebas para mejorar su diseño, eliminar duplicación, mejorar la claridad y optimizar la legibilidad, asegurando que todas las pruebas existentes sigan siendo VERDES.

### 4.2. Beneficios Clave de TDD

*   **Mayor Calidad del Código:** Reduce la cantidad de defectos.
*   **Mejor Diseño de Software:** Fomenta la creación de módulos acoplados de forma débil y cohesivos, alineándose perfectamente con la Arquitectura Limpia y los principios SOLID.
*   **Documentación Viva:** Las pruebas actúan como una especificación ejecutable del comportamiento del sistema.
*   **Confianza en la Refactorización:** Las pruebas automatizadas proporcionan una red de seguridad, permitiendo cambios y mejoras en el código con la certeza de que el comportamiento existente no se ha roto.
*   **Reducción del Deuda Técnica:** Promueve la limpieza y el buen diseño desde el principio.

### 4.3. Tipos de Pruebas y Aplicación en Arquitectura Limpia

*   **Pruebas Unitarias:**
    *   **Foco:** Entidades, Casos de Uso (sin dependencias externas), componentes de la lógica de Adaptadores de Interfaz (Presentadores, Mappers).
    *   **Características:** Aisladas, rápidas, prueban una unidad de código pequeña y específica. Son la base de TDD.
*   **Pruebas de Integración:**
    *   **Foco:** Interacción entre los Casos de Uso y los Gateways, validación de la implementación de los Gateways con frameworks y drivers reales (ej. base de datos, servicios externos).
    *   **Características:** Prueban la interacción entre múltiples componentes, pueden ser más lentas que las unitarias.
*   **Pruebas de Aceptación/End-to-End (E2E):**
    *   **Foco:** Validar funcionalidades completas desde la interfaz de usuario hasta la persistencia y viceversa.
    *   **Características:** Prueban el sistema como un todo, son las más lentas, pero aseguran que el sistema cumple con los requisitos del usuario. No son el foco principal de TDD para el código de bajo nivel, pero se usan para guiar el desarrollo de funcionalidades de alto nivel.

## 5. Atributos de Calidad Primarios

Los siguientes atributos de calidad son críticos para el éxito y la sostenibilidad del proyecto:

*   **Testabilidad:** Capacidad del sistema para ser probado exhaustivamente de manera eficiente y efectiva. (Reforzado por TDD y Clean Architecture).
*   **Mantenibilidad:** Facilidad con la que el sistema puede ser modificado para corregir defectos, mejorar el rendimiento o adaptarse a nuevos requisitos.
*   **Flexibilidad/Adaptabilidad:** Capacidad del sistema para cambiar y evolucionar con facilidad ante nuevos requisitos de negocio o cambios tecnológicos.
*   **Rendimiento:** Eficiencia con la que el sistema utiliza sus recursos para cumplir con los requisitos de tiempo de respuesta y procesamiento.
*   **Seguridad:** Capacidad del sistema para proteger la información y los recursos contra accesos no autorizados, modificaciones o destrucción.
*   **Escalabilidad:** Capacidad del sistema para manejar un aumento de carga (usuarios, datos, transacciones) mediante la adición de recursos.
*   **Confiabilidad:** Capacidad del sistema para realizar sus funciones requeridas bajo condiciones específicas durante un período de tiempo determinado.

## 6. Guías y Estándares de Codificación

Para asegurar la coherencia y la mantenibilidad, se adhieren las siguientes guías:

*   **Código Limpio:** Se promoverá la legibilidad, simplicidad y expresividad del código, siguiendo las directrices de libros como "Clean Code" de Robert C. Martin.
*   **Convenciones de Nombramiento:** Se seguirán convenciones estándar del lenguaje y del framework elegido para nombres de variables, funciones, clases, archivos y paquetes.
*   **Gestión de Dependencias:** Se utilizará un sistema de inyección de dependencias para gestionar las relaciones entre componentes, favoreciendo la inversión de dependencias.
*   **Manejo de Errores:** Se establecerán patrones consistentes para el manejo de excepciones y la notificación de errores en todas las capas.

## 7. Evolución y Mantenimiento de la Constitución

Esta Constitución es un documento vivo. Será revisada y actualizada periódicamente por el Arquitecto del proyecto en colaboración con el equipo de desarrollo para reflejar las lecciones aprendidas, los cambios en el contexto del proyecto o la evolución de las mejores prácticas. Cualquier cambio significativo deberá ser comunicado y consensuado con el equipo.

---