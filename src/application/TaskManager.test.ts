import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager } from './TaskManager.js';

describe('TaskManager (Capa de Aplicación)', () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  it('debería registrar una nueva tarea y recuperarla por ID', () => {
    manager.createTask('T1', 'Test de Integración');
    const found = manager.getTaskById('T1');

    expect(found).toBeDefined();
    expect(found?.getId()).toBe('T1');
    expect(found?.getStatus()).toBe('TODO');
  });

  it('debería orquestar la pausa de una tarea existente', () => {
    manager.createTask('T1', 'Tarea para Pausar');
    const task = manager.getTaskById('T1');
    task?.start();
    manager.pauseTask('T1');
    expect(task?.getStatus()).toBe('PAUSED');
  });

  it('debería lanzar error si se intenta pausar una tarea que no existe', () => {
    expect(() => manager.pauseTask('NON-EXISTENT')).toThrow('Tarea no encontrada');
  });

  it('debería reanudar una tarea previamente pausada', () => {
    manager.createTask('T1', 'Tarea Reanudable');
    const task = manager.getTaskById('T1');
    task?.start();
    task?.pause();
    manager.resumeTask('T1');
    expect(task?.getStatus()).toBe('DOING');
  });
});
