import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertSchedule, Id, Visibility } from '../domain/models';
import { AlertRepository } from '../repo/AlertRepository';

export interface CreateAlertInput {
  title: string;
  message: string;
  visibility: Visibility;
  schedule?: Partial<AlertSchedule>;
  active?: boolean;
  createdBy: Id;
}

export class AlertService {
  constructor(private readonly alertRepo: AlertRepository) {}

  async create(input: CreateAlertInput): Promise<Alert> {
    const now = new Date();
    const alert: Alert = {
      id: uuidv4(),
      title: input.title,
      message: input.message,
      visibility: input.visibility,
      schedule: {
        recurrenceHours: input.schedule?.recurrenceHours ?? 2,
        startAt: input.schedule?.startAt,
        endAt: input.schedule?.endAt
      },
      active: input.active ?? true,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now
    };
    await this.alertRepo.create(alert);
    return alert;
  }

  async update(alertId: Id, updates: Partial<Omit<Alert, 'id' | 'createdAt' | 'createdBy'>>): Promise<Alert | undefined> {
    const existing = await this.alertRepo.getById(alertId);
    if (!existing) return undefined;
    const updated: Alert = {
      ...existing,
      ...updates,
      schedule: {
        ...existing.schedule,
        ...(updates as any).schedule
      },
      updatedAt: new Date()
    };
    await this.alertRepo.update(updated);
    return updated;
  }

  async list(): Promise<Alert[]> {
    return this.alertRepo.list();
  }
}


