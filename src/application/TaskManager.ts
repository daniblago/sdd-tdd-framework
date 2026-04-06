/**
 * src/application/TaskManager.ts
 * Capa de Aplicación: Orquestador de Casos de Uso.
 * Implementa el contrato definido en la Fase 8.
 */
import { Task } from '../domain/Task.js';

export class TaskManager {
  private tasks: Map<string, Task> = new Map();

  /**
   * Crea una nueva instancia de tarea y la registra en el sistema.
   */
  createTask(id: string, title: string): Task {
    const newTask = new Task(id, title);
    this.tasks.set(id, newTask);
    return newTask;
  }

  /**
   * Caso de Uso: Pausar Tarea.
   * Busca la entidad y delega la validación de estado al dominio.
   */
  pauseTask(taskId: string): void {
    const task = this.getRequiredTask(taskId);
    task.pause();
  }

  /**
   * Caso de Uso: Reanudar Tarea.
   */
  resumeTask(taskId: string): void {
    const task = this.getRequiredTask(taskId);
    task.resume();
  }

  /**
   * Recupera una tarea por su identificador.
   */
  getTaskById(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Método privado auxiliar para asegurar la existencia de la tarea.
   */
  private getRequiredTask(taskId: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Tarea no encontrada: ${taskId}`);
    }
    return task;
  }
}