import { Id, User } from '../domain/models';

export interface UserRepository {
  getById(id: Id): Promise<User | undefined>;
  list(): Promise<User[]>;
  create(user: User): Promise<void>;
}

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<Id, User>();

  async getById(id: Id): Promise<User | undefined> {
    return this.users.get(id);
  }

  async list(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async create(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}


