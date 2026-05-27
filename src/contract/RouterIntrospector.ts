import type { Router } from 'express';

export interface Mount {
  mount: string;
  router: Router;
}

interface RawLayer {
  route?: { path: string; methods?: Record<string, boolean> };
  name?: string;
  handle?: { stack?: RawLayer[] };
}

const TO_OPENAPI_PARAM = /:([A-Za-z0-9_]+)/g;

export class RouterIntrospector {
  fromMounts(mounts: Mount[]): string[] {
    const seen = new Set<string>();
    for (const { mount, router } of mounts) {
      this.walkRouter(router, mount, seen);
    }
    return [...seen];
  }

  private walkRouter(router: Router, prefix: string, seen: Set<string>): void {
    const stack = (router as unknown as { stack?: RawLayer[] }).stack ?? [];
    this.walk(stack, prefix, seen);
  }

  private walk(stack: RawLayer[], prefix: string, seen: Set<string>): void {
    for (const layer of stack) {
      if (layer.route) {
        const fullPath = this.normalize(prefix + layer.route.path);
        const methods = Object.keys(layer.route.methods ?? {});
        for (const m of methods) {
          if (m === '_all') continue;
          seen.add(`${m.toUpperCase()} ${fullPath}`);
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        this.walk(layer.handle.stack, prefix, seen);
      }
    }
  }

  private normalize(path: string): string {
    return path.replace(TO_OPENAPI_PARAM, '{$1}');
  }
}
