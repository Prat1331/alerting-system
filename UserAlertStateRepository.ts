import { Id, UserAlertState } from '../domain/models';

export interface UserAlertStateRepository {
  get(userId: Id, alertId: Id): Promise<UserAlertState | undefined>;
  upsert(state: UserAlertState): Promise<void>;
  listForUser(userId: Id): Promise<UserAlertState[]>;
}

export class InMemoryUserAlertStateRepository implements UserAlertStateRepository {
  private byKey = new Map<string, UserAlertState>();

  private key(userId: Id, alertId: Id): string {
    return `${userId}::${alertId}`;
  }

  async get(userId: Id, alertId: Id): Promise<UserAlertState | undefined> {
    return this.byKey.get(this.key(userId, alertId));
  }

  async upsert(state: UserAlertState): Promise<void> {
    this.byKey.set(this.key(state.userId, state.alertId), state);
  }

  async listForUser(userId: Id): Promise<UserAlertState[]> {
    const results: UserAlertState[] = [];
    for (const value of this.byKey.values()) {
      if (value.userId === userId) results.push(value);
    }
    return results;
  }
}


