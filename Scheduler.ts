import { AlertRepository } from '../repo/AlertRepository';
import { UserRepository } from '../repo/UserRepository';
import { UserAlertStateService } from '../services/UserAlertStateService';
import { TargetingService } from '../services/TargetingService';

export interface NotificationSink {
  dispatch(userId: string, alertId: string, title: string, message: string): Promise<void>;
}

export class ConsoleNotificationSink implements NotificationSink {
  async dispatch(userId: string, alertId: string, title: string, message: string): Promise<void> {
    console.log(`[notify] to user=${userId} alert=${alertId} :: ${title} - ${message}`);
  }
}

export class Scheduler {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly alertRepo: AlertRepository,
    private readonly userRepo: UserRepository,
    private readonly stateService: UserAlertStateService,
    private readonly targeting: TargetingService,
    private readonly sink: NotificationSink
  ) {}

  start(pollIntervalMs: number = 60_000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.tick().catch((err) => console.error('scheduler tick error', err));
    }, pollIntervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  private async tick(): Promise<void> {
    const now = new Date();
    const [alerts, users] = await Promise.all([
      this.alertRepo.list(),
      this.userRepo.list()
    ]);

    for (const alert of alerts) {
      for (const user of users) {
        if (!this.targeting.isAlertVisibleToUser(alert, user)) continue;
        const should = await this.stateService.shouldNotify(user.id, alert.id, now);
        if (should) {
          await this.sink.dispatch(user.id, alert.id, alert.title, alert.message);
          await this.stateService.markNotified(user.id, alert.id, now);
        }
      }
    }
  }
}


