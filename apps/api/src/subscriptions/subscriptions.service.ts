import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  listPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { priceCents: 'asc' },
      include: { planTrackers: { select: { trackerCode: true } } },
    });
  }

  getForUser(userId: string) {
    return this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: { include: { planTrackers: true } } },
    });
  }
}
