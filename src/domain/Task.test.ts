import { describe, it, expect } from 'vitest';
import { Task } from './Task.js';

describe('Task Domain Entity', () => {
  it('debería inicializarse en estado TODO con título y descripción válidos', () => {
    const task = new Task('Task-001', 'Implementar autenticación');
    expect(task.getTitle()).toBe('Task-001');
    expect(task.getStatus()).toBe('TODO');
  });

  it('debería lanzar un error si se intenta crear sin título', () => {
    expect(() => new Task('', 'Descripción')).toThrowError('El título es obligatorio');
    expect(() => new Task('   ', 'Descripción')).toThrowError('El título es obligatorio');
  });

  it('debería cambiar el estado a IN_PROGRESS al iniciarla', () => {
    const task = new Task('Task-002', 'Descripción');
    task.start();
    expect(task.getStatus()).toBe('IN_PROGRESS');
  });

  it('debería permitir completar una tarea que está en IN_PROGRESS', () => {
    const task = new Task('Task-003', 'Descripción');
    task.start();
    task.complete();
    expect(task.getStatus()).toBe('DONE');
  });

  it('debería lanzar un error si se intenta completar sin estar en progreso', () => {
    const task = new Task('Task-004', 'Descripción');
    // Intenta completar directamente desde TODO
    expect(() => task.complete()).toThrowError('La tarea debe estar en progreso para completarse');
  });

  it('debería permitir pausar una tarea en progreso', () => {
    const task = new Task('Task-005', 'Descripción');
    task.start();
    task.pause();
    expect(task.getStatus()).toBe('PAUSED');
  });

  it('debería lanzar un error si se intenta pausar una tarea que no está en progreso', () => {
    const task = new Task('Task-006', 'Descripción');
    expect(() => task.pause()).toThrowError('Solo se pueden pausar tareas en progreso');
    task.start();
    task.complete();
    expect(() => task.pause()).toThrowError('Solo se pueden pausar tareas en progreso');
  });
});