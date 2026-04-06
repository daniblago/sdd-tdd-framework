export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'PAUSED';

export class Task {
  private status: TaskStatus = 'TODO';

  constructor(private title: string, private description: string) {
    if (!title || title.trim() === '') {
      throw new Error('El título es obligatorio');
    }
  }

  getTitle(): string {
    return this.title;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  start(): void {
    this.status = 'IN_PROGRESS';
  }

  complete(): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('La tarea debe estar en progreso para completarse');
    }
    this.status = 'DONE';
  }

  pause(): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('Solo se pueden pausar tareas en progreso');
    }
    this.status = 'PAUSED';
  }
}