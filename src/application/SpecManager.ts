import { Specification } from '../domain/Specification.js';
export class SpecManager {
  private specs: Specification[] = [];
  registerSpec(spec: Specification): void { this.specs.push(spec); }
  getAllSpecs(): Specification[] { return [...this.specs]; }
  getSpecByTitle(title: string): Specification | undefined {
    return this.specs.find(s => s.getTitle() === title);
  }
}
