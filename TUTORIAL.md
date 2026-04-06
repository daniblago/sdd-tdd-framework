# 🚀 Guía Práctica: Tu primera funcionalidad en el SDD-TDD Framework

La regla de oro de este framework es: **Prohibido el "Vibe Coding" (programar improvisando)**. Todo código de producción nace de una especificación y de una prueba que falla. 

> 💡 **Aclaración clave:** Aunque el framework tiene 10 fases, no es un modelo en "cascada" rígido. El trabajo se divide en un **Macro-Ciclo** (Fases 1 a 8 para diseñar y especificar) que haces solo de vez en cuando, y un **Micro-Ciclo** (Fases 9 y 10 para programar haciendo TDD) que es tu bucle de trabajo diario.

---

Sigue estos 4 pasos para construir una nueva entidad `User` (Usuario) que debe tener un correo electrónico y que pueda ser "verificada":

## Paso 1: Diseño y Especificación (Fases 1 a 8 - SDD)
Antes de tocar código, debemos definir qué vamos a construir.
1. **Glosario (Fase 2):** Vas a `domain-glossary.md` y agregas la definición: *"Usuario: Persona registrada en el sistema, identificada por un correo."*
2. **Especificación (Fase 3):** Vas a la carpeta de especificaciones (`specs/`) y escribes las reglas de negocio. Por ejemplo:
   * *Regla 1:* Un usuario no puede crearse sin un correo.
   * *Regla 2:* Todo usuario nace con el estado `unverified`.
   * *Regla 3:* Al llamar al método `verify()`, el estado cambia a `verified`.

## Paso 2: Desglose de Tareas (Fase 9)
Ahora que sabes *qué* construir, vas a `tasks.md` y creas tu backlog enfocado en TDD:
```markdown
### Módulo de Usuarios
- [ ] TASK-4.01: [RED] Escribir pruebas unitarias para `User` (creación y verificación)
- [ ] TASK-4.02: [GREEN] Implementar `User.ts`
- [ ] TASK-4.03: [REFACTOR] Validar cobertura del 80%+
```

## Paso 3: El Ciclo TDD - Fase RED (Fase 10)
**Nunca escribas el código fuente primero.** Empieza por la prueba (`src/domain/User.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { User } from './User.js';

describe('User Entity', () => {
  it('debería inicializarse como unverified', () => {
    const user = new User('test@test.com');
    expect(user.isVerified()).toBe(false);
  });

  it('debería cambiar a verified al llamar verify()', () => {
    const user = new User('test@test.com');
    user.verify();
    expect(user.isVerified()).toBe(true);
  });
});
```
👉 **Acción:** Ejecutas `npm test`. 
🔴 **Resultado esperado:** Falla estrepitosamente porque `User.ts` no existe. ¡Felicidades, lograste el estado RED! Marcas la `TASK-4.01` como completada.

## Paso 4: El Ciclo TDD - Fase GREEN y REFACTOR
Ahora escribes el código mínimo y necesario en `src/domain/User.ts` para complacer a tu prueba:
```typescript
export class User {
  private verified: boolean = false;
  constructor(private email: string) {
    if (!email) throw new Error('Email requerido');
  }
  isVerified(): boolean { return this.verified; }
  verify(): void { this.verified = true; }
}
```
👉 **Acción:** Ejecutas `npm test`. 
🟢 **Resultado esperado:** Todo pasa en verde. Marcas la `TASK-4.02` como completada.

👉 **Acción (Refactor):** Ejecutas `npm run test:coverage`.
📊 **Resultado esperado:** Vitest te muestra una tabla de cobertura. Si la tabla marca menos de 80%, la constitución (Fase 1) te prohíbe subir ese código. Si marca 100%, marcas la `TASK-4.03` como completada.