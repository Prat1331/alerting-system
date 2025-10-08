import { Alert, Id, User, Visibility } from '../domain/models';

export class TargetingService {
  isAlertVisibleToUser(alert: Alert, user: User): boolean {
    const v: Visibility = alert.visibility;
    if (v.scope === 'organization') {
      return v.targetIds.includes(user.organizationId);
    }
    if (v.scope === 'team') {
      return user.teamIds.some((t) => v.targetIds.includes(t));
    }
    if (v.scope === 'user') {
      return v.targetIds.includes(user.id);
    }
    return false;
  }
}


