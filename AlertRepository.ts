import { Alert, Id } from '../domain/models';

export interface AlertRepository {
  create(alert: Alert): Promise<void>;
  update(alert: Alert): Promise<void>;
  getById(id: Id): Promise<Alert | undefined>;
  list(): Promise<Alert[]>;
}

export class InMemoryAlertRepository implements AlertRepository {
  private alerts = new Map<Id, Alert>();

  async create(alert: Alert): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async update(alert: Alert): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async getById(id: Id): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async list(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }
}


