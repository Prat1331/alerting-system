import express, { Express, Request, Response } from 'express';
import { InMemoryAlertRepository } from './repo/AlertRepository';
import { InMemoryUserRepository } from './repo/UserRepository';
import { InMemoryUserAlertStateRepository } from './repo/UserAlertStateRepository';
import { AlertService } from './services/AlertService';
import { UserAlertStateService } from './services/UserAlertStateService';
import { TargetingService } from './services/TargetingService';
import { ConsoleNotificationSink, Scheduler } from './scheduler/Scheduler';
import { getLocalDateString, Id, User } from './domain/models';

export async function createServer(): Promise<Express> {
  const app = express();
  app.use(express.json());

  // Repos & services (in-memory for demo)
  const alertRepo = new InMemoryAlertRepository();
  const userRepo = new InMemoryUserRepository();
  const stateRepo = new InMemoryUserAlertStateRepository();
  const alertService = new AlertService(alertRepo);
  const userAlertStateService = new UserAlertStateService(alertRepo, stateRepo);
  const targeting = new TargetingService();

  // Start scheduler
  const scheduler = new Scheduler(alertRepo, userRepo, userAlertStateService, targeting, new ConsoleNotificationSink());
  scheduler.start(10_000); // tick every 10s for demo; recurrence is enforced per alert

  // Seed basic data
  void (async () => {
    const users: User[] = [
      { id: 'u-alex', name: 'Alex', organizationId: 'org-1', teamIds: ['team-1'] },
      { id: 'u-beth', name: 'Beth', organizationId: 'org-1', teamIds: ['team-2'] },
      { id: 'u-cam', name: 'Cam', organizationId: 'org-2', teamIds: ['team-3'] }
    ];
    for (const u of users) await userRepo.create(u);
  })();

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Lightweight Alerting & Notification System',
      routes: {
        admin: [
          'POST /admin/alerts - create alert',
          'PUT /admin/alerts/:id - update alert',
          'GET /admin/alerts - list alerts'
        ],
        user: [
          'GET /users/:userId/alerts - list alerts for user',
          'POST /users/:userId/alerts/:alertId/read - mark read',
          'POST /users/:userId/alerts/:alertId/unread - mark unread',
          'POST /users/:userId/alerts/:alertId/snooze - snooze for the day'
        ]
      }
    });
  });

  // Admin APIs
  app.post('/admin/alerts', async (req: Request, res: Response) => {
    const { title, message, visibility, schedule, active, createdBy } = req.body ?? {};
    if (!title || !message || !visibility || !createdBy) {
      return res.status(400).json({ error: 'title, message, visibility, createdBy required' });
    }
    const alert = await alertService.create({ title, message, visibility, schedule, active, createdBy });
    res.status(201).json(alert);
  });

  app.put('/admin/alerts/:id', async (req: Request, res: Response) => {
    const updated = await alertService.update(req.params.id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  });

  app.get('/admin/alerts', async (_req: Request, res: Response) => {
    res.json(await alertService.list());
  });

  // User APIs
  app.get('/users/:userId/alerts', async (req: Request, res: Response) => {
    const user = await userRepo.getById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'user not found' });
    const alerts = await alertService.list();
    const visible = alerts.filter((a) => a.active).filter((a) => targeting.isAlertVisibleToUser(a, user));
    res.json(visible);
  });

  app.post('/users/:userId/alerts/:alertId/read', async (req: Request, res: Response) => {
    await userAlertStateService.markRead(req.params.userId as Id, req.params.alertId as Id);
    res.json({ ok: true });
  });

  app.post('/users/:userId/alerts/:alertId/unread', async (req: Request, res: Response) => {
    await userAlertStateService.markUnread(req.params.userId as Id, req.params.alertId as Id);
    res.json({ ok: true });
  });

  app.post('/users/:userId/alerts/:alertId/snooze', async (req: Request, res: Response) => {
    await userAlertStateService.snoozeForToday(req.params.userId as Id, req.params.alertId as Id);
    res.json({ ok: true, snoozedOn: getLocalDateString(new Date()) });
  });

  return app;
}


