# Lightweight Alerting & Notification System

Run locally:

```bash
npm install
npm run dev
```

The service exposes a minimal API for admins to configure alerts and for end users to read, snooze, and manage notification state. See inline route descriptions when the server starts.

Example admin alert creation:

```bash
curl -X POST http://localhost:3000/admin/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Security Update",
    "message": "Rotate your passwords today",
    "visibility": {"scope":"organization", "targetIds":["org-1"]},
    "schedule": {"recurrenceHours": 2},
    "createdBy": "admin-1"
  }'
```

End users can list visible alerts:

```bash
curl http://localhost:3000/users/u-alex/alerts
```

Snooze an alert for the rest of the day:

```bash
curl -X POST http://localhost:3000/users/u-alex/alerts/<alertId>/snooze
```


