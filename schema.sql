CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_freq_minutes INTEGER DEFAULT 120,
  start_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by INTEGER
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  team_id INTEGER REFERENCES teams(id),
  org_id INTEGER
);

CREATE TABLE IF NOT EXISTS alert_teams (
  alert_id INTEGER REFERENCES alerts(id),
  team_id INTEGER REFERENCES teams(id),
  PRIMARY KEY (alert_id, team_id)
);

CREATE TABLE IF NOT EXISTS alert_users (
  alert_id INTEGER REFERENCES alerts(id),
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (alert_id, user_id)
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id INTEGER PRIMARY KEY,
  alert_id INTEGER REFERENCES alerts(id),
  user_id INTEGER REFERENCES users(id),
  delivered_at TIMESTAMP,
  delivery_channel TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS user_alerts (
  id INTEGER PRIMARY KEY,
  alert_id INTEGER REFERENCES alerts(id),
  user_id INTEGER REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  snoozed_until TIMESTAMP NULL
);
