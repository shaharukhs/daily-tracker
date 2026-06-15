import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { REQUIRES_TRACKER_KEY } from '../decorators/requires-tracker.decorator';
import type { AuthUser } from '../decorators/current-user.decorator';

/**
 * Authorization guard for tracker endpoints.
 * Allows access only when:
 *   1. user is authenticated
 *   2. user's active subscription plan includes the tracker
 *   3. the user has not disabled the tracker in their preferences
 */
@Injectable()
export class RequiresTrackerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const trackerCode = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRES_TRACKER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!trackerCode) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    if (!user) throw new UnauthorizedException();

    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId: user.id },
      include: { plan: { include: { planTrackers: true } } },
    });
    if (!sub || sub.status !== 'ACTIVE') {
      throw new ForbiddenException('No active subscription');
    }
    const planHasTracker = sub.plan.planTrackers.some((pt) => pt.trackerCode === trackerCode);
    if (!planHasTracker) {
      throw new ForbiddenException(`Your plan does not include the "${trackerCode}" tracker`);
    }

    const pref = await this.prisma.userTrackerPreference.findUnique({
      where: { userId_trackerCode: { userId: user.id, trackerCode } },
    });
    if (pref && pref.enabled === false) {
      throw new ForbiddenException(`Tracker "${trackerCode}" is disabled in your preferences`);
    }
    return true;
  }
}
