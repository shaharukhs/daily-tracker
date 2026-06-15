import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TRACKER_METADATA, type PreferenceUpdateInput, type TrackerCode } from '@daily-tracker/shared';

export interface PreferenceView {
  trackerCode: string;
  label: string;
  description: string;
  enabled: boolean;
  includedInPlan: boolean;
  sortOrder: number;
}

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<PreferenceView[]> {
    const [sub, prefs] = await Promise.all([
      this.prisma.userSubscription.findUnique({
        where: { userId },
        include: { plan: { include: { planTrackers: true } } },
      }),
      this.prisma.userTrackerPreference.findMany({ where: { userId } }),
    ]);

    const planCodes = new Set(sub?.plan.planTrackers.map((pt) => pt.trackerCode) ?? []);
    const prefMap = new Map(prefs.map((p) => [p.trackerCode, p]));

    return Object.entries(TRACKER_METADATA)
      .filter(([code]) => planCodes.has(code))
      .map(([code, meta]) => {
        const pref = prefMap.get(code);
        return {
          trackerCode: code,
          label: meta.label,
          description: meta.description,
          enabled: pref?.enabled ?? meta.defaultEnabled,
          includedInPlan: true,
          sortOrder: pref?.sortOrder ?? 0,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async upsert(userId: string, input: PreferenceUpdateInput): Promise<PreferenceView> {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: { include: { planTrackers: true } } },
    });
    const allowed = sub?.plan.planTrackers.some((pt) => pt.trackerCode === input.trackerCode);
    if (!allowed) throw new ForbiddenException('Tracker is not part of your plan');

    const meta = TRACKER_METADATA[input.trackerCode as TrackerCode];
    if (!meta) throw new ForbiddenException('Unknown tracker');

    const pref = await this.prisma.userTrackerPreference.upsert({
      where: { userId_trackerCode: { userId, trackerCode: input.trackerCode } },
      update: { enabled: input.enabled },
      create: {
        userId,
        trackerCode: input.trackerCode,
        enabled: input.enabled,
      },
    });

    return {
      trackerCode: pref.trackerCode,
      label: meta.label,
      description: meta.description,
      enabled: pref.enabled,
      includedInPlan: true,
      sortOrder: pref.sortOrder,
    };
  }
}
