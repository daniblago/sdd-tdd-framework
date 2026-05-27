import type { StoredUserRecord } from '../../application/usecases/MigrateUsersUseCase.js';

export interface UserRepository {
  findByUsername(username: string): Promise<StoredUserRecord | null>;
}
