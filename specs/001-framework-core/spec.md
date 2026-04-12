# Spec-001: Núcleo del Framework SDD+TDD

## 1. Visión y Objetivos [cite: 77]
* **Propósito**: Establecer la estructura base que garantice la trazabilidad total desde el negocio hasta el código[cite: 18, 294].
* **Actores**: Arquitecto de Software, Desarrollador, Agente de IA[cite: 64, 331].

## 2. Historias de Usuario [cite: 78]
* **Historia**: Como Arquitecto, quiero un sistema de carpetas estandarizado para que la IA no improvise la ubicación de los archivos[cite: 228, 590].
* **Criterios de Aceptación**:
  * [ ] El repositorio debe contener las 10 carpetas de las fases de la guía[cite: 42, 228].
  * [ ] El archivo AGENT.md debe ser detectado por el editor[cite: 638, 642].

## 3. Casos Límite y Errores [cite: 80]
* **Conflicto de Versiones**: Manejo de cambios concurrentes entre agentes mediante Git Worktrees[cite: 1279, 1281].
* **Drift de Contrato**: El CI debe fallar si el código no coincide con la spec[cite: 222].
