export type Id = string;

export interface User {
  id: Id;
  name: string;
  organizationId: Id;
  teamIds: Id[];
}

export type VisibilityScope = 'organization' | 'team' | 'user';

export interface Visibility {
  scope: VisibilityScope;
  targetIds: Id[]; // orgIds when scope=organization, teamIds when scope=team, userIds when scope=user
}

export interface AlertSchedule {
  recurrenceHours: number; // reminders cadence; default 2
  startAt?: Date;
  endAt?: Date;
}

export interface Alert {
  id: Id;
  title: string;
  message: string;
  visibility: Visibility;
  schedule: AlertSchedule;
  active: boolean;
  createdBy: Id; // admin/user id
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAlertState {
  userId: Id;
  alertId: Id;
  read: boolean;
  lastNotifiedAt?: Date;
  snoozedOn?: string; // YYYY-MM-DD local date string
}

export function isWithinWindow(now: Date, schedule: AlertSchedule): boolean {
  if (schedule.startAt && now < schedule.startAt) return false;
  if (schedule.endAt && now > schedule.endAt) return false;
  return true;
}

export function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}


