import { describe, it, expect, beforeEach } from 'vitest';
import { Task } from './Task.js';

describe('Task Domain Entity', () => {
  let task: Task;

  beforeEach(() => {
    // Ahora pasamos la descripción opcional
    task = new Task('T1', 'Título de prueba', 'Descripción de prueba');
  });

  it('debería inicializarse en estado TODO con título y descripción válidos', () => {
    expect(task.getStatus()).toBe('TODO');
    expect(task.getId()).toBe('T1');
    expect(task.getDescription()).toBe('Descripción de prueba');
  });

  it('debería lanzar un error si se intenta crear sin título', () => {
    expect(() => new Task('T2', '   ')).toThrow('El título de la tarea es obligatorio');
  });

  it('debería cambiar el estado a DOING al iniciarla', () => {
    task.start();
    expect(task.getStatus()).toBe('DOING');
  });

  it('debería permitir completar una tarea que está en DOING', () => {
    task.start();
    task.complete();
    expect(task.getStatus()).toBe('DONE');
  });

  it('debería lanzar un error si se intenta completar sin estar en progreso', () => {
    expect(() => task.complete()).toThrow('Solo se pueden completar tareas que están en progreso');
  });

  it('debería permitir pausar una tarea en progreso', () => {
    task.start();
    task.pause();
    expect(task.getStatus()).toBe('PAUSED');
  });

  it('debería lanzar un error si se intenta pausar una tarea que no está en progreso', () => {
    expect(() => task.pause()).toThrow('Solo se pueden pausar tareas en progreso');
  });
});