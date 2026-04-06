/**
 * src/domain/Task.ts
 * Entidad de Dominio: Task
 * Implementa la lógica de ciclo de vida incluyendo Pausa y Reanudación.
 */

export type TaskStatus = 'TODO' | 'DOING' | 'DONE' | 'PAUSED';

export class Task {
  private status: TaskStatus = 'TODO';

  constructor(
    private id: string,
    private title: string,
    private description: string = ''
  ) {
    if (!id || id.trim() === '') throw new Error('El ID de la tarea es obligatorio');
    if (!title || title.trim() === '') throw new Error('El título de la tarea es obligatorio');
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getId(): string {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  /**
   * Inicia la ejecución de la tarea.
   * Transición: TODO -> DOING
   */
  start(): void {
    this.ensureTransitionFrom('TODO');
    this.status = 'DOING';
  }

  /**
   * Pausa una tarea en progreso.
   * Transición: DOING -> PAUSED
   */
  pause(): void {
    if (this.status !== 'DOING') {
      throw new Error('Solo se pueden pausar tareas en progreso');
    }
    this.status = 'PAUSED';
  }

  /**
   * Reanuda una tarea pausada.
   * Transición: PAUSED -> DOING
   */
  resume(): void {
    if (this.status !== 'PAUSED') {
      throw new Error('Solo se pueden reanudar tareas pausadas');
    }
    this.status = 'DOING';
  }

  /**
   * Finaliza la tarea.
   * Transición: DOING -> DONE
   * Restricción: No se puede finalizar desde PAUSED
   */
  complete(): void {
    if (this.status === 'PAUSED') {
      throw new Error('No se puede finalizar una tarea que está pausada');
    }
    if (this.status !== 'DOING') {
      throw new Error('Solo se pueden completar tareas que están en progreso');
    }
    this.status = 'DONE';
  }

  /**
   * Centralización de validaciones básicas
   */
  private ensureTransitionFrom(expectedStatus: TaskStatus): void {
    if (this.status !== expectedStatus) {
      throw new Error(`Transición inválida desde ${this.status}`);
    }
  }
}