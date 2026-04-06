export type SpecStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';
export class Specification {
  private status: SpecStatus = 'DRAFT';
  constructor(private title: string, private description: string) {
    if (!title || title.trim() === '') throw new Error('El título es obligatorio');
  }
  getStatus(): SpecStatus { return this.status; }
  getTitle(): string { return this.title; }
  requestReview(): void {
    if (this.status !== 'DRAFT' && this.status !== 'REJECTED') throw new Error('Estado invalido');
    this.status = 'REVIEW';
  }
  approve(): void {
    if (this.status !== 'REVIEW') throw new Error('Debe estar en revision');
    this.status = 'APPROVED';
  }
  reject(): void {
    if (this.status !== 'REVIEW') throw new Error('Debe estar en revision');
    this.status = 'REJECTED';
  }
}
