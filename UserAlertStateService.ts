import { getLocalDateString, Id, isWithinWindow, UserAlertState } from '../domain/models';
import { AlertRepository } from '../repo/AlertRepository';
import { UserAlertStateRepository } from '../repo/UserAlertStateRepository';

export class UserAlertStateService {
  constructor(
    private readonly alertRepo: AlertRepository,
    private readonly stateRepo: UserAlertStateRepository
  ) {}

  async markRead(userId: Id, alertId: Id): Promise<void> {
    const existing = (await this.stateRepo.get(userId, alertId)) ?? { userId, alertId, read: true };
    existing.read = true;
    await this.stateRepo.upsert(existing);
  }

  async markUnread(userId: Id, alertId: Id): Promise<void> {
    const existing = (await this.stateRepo.get(userId, alertId)) ?? { userId, alertId, read: false };
    existing.read = false;
    await this.stateRepo.upsert(existing);
  }

  async snoozeForToday(userId: Id, alertId: Id, now: Date = new Date()): Promise<void> {
    const existing = (await this.stateRepo.get(userId, alertId)) ?? { userId, alertId, read: false };
    existing.snoozedOn = getLocalDateString(now);
    await this.stateRepo.upsert(existing);
  }

  async shouldNotify(userId: Id, alertId: Id, now: Date = new Date()): Promise<boolean> {
    const alert = await this.alertRepo.getById(alertId);
    if (!alert || !alert.active) return false;
    if (!isWithinWindow(now, alert.schedule)) return false;

    const state = await this.stateRepo.get(userId, alertId);
    if (state?.read) return false;
    if (state?.snoozedOn === getLocalDateString(now)) return false;

    const recurrenceMs = (alert.schedule.recurrenceHours ?? 2) * 60 * 60 * 1000;
    if (!state?.lastNotifiedAt) return true;
    return now.getTime() - new Date(state.lastNotifiedAt).getTime() >= recurrenceMs;
  }

  async markNotified(userId: Id, alertId: Id, now: Date = new Date()): Promise<void> {
    const existing: UserAlertState = (await this.stateRepo.get(userId, alertId)) ?? {
      userId,
      alertId,
      read: false
    };
    existing.lastNotifiedAt = now;
    await this.stateRepo.upsert(existing);
  }
}


