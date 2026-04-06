export class User {
  private verified: boolean = false;

  constructor(private email: string) {
    if (!email || email.trim() === '') {
      throw new Error('Email requerido');
    }
  }

  isVerified(): boolean {
    return this.verified;
  }

  verify(): void {
    this.verified = true;
  }
}