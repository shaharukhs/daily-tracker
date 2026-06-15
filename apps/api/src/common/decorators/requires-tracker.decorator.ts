import { SetMetadata } from '@nestjs/common';

export const REQUIRES_TRACKER_KEY = 'requires_tracker';

/**
 * Marks an endpoint as requiring access to a specific tracker.
 * Enforced by `RequiresTrackerGuard`: checks the user's plan and preferences.
 */
export const RequiresTracker = (code: string): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRES_TRACKER_KEY, code);
