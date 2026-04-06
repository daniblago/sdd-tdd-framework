export class Specification { constructor(private title: string) { if(!title) throw new Error('Obligatorio'); } getStatus() { return 'DRAFT'; } }
