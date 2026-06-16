import { PrismaClient } from '@prisma/client';
import { ALL_TRACKER_CODES } from '@daily-tracker/shared';

const prisma = new PrismaClient();

async function main() {
  // Plans
  const free = await prisma.subscriptionPlan.upsert({
    where: { code: 'free' },
    update: {},
    create: { code: 'free', name: 'Free', priceCents: 0, isDefault: true },
  });

  const pro = await prisma.subscriptionPlan.upsert({
    where: { code: 'pro' },
    update: {},
    create: { code: 'pro', name: 'Pro', priceCents: 499 },
  });

  const premium = await prisma.subscriptionPlan.upsert({
    where: { code: 'premium' },
    update: {},
    create: { code: 'premium', name: 'Premium', priceCents: 999 },
  });

  // Map plans -> trackers. The default (free) plan unlocks every tracker so
  // every user can track their full day; paid tiers exist for future gated features.
  const freeTrackers = [...ALL_TRACKER_CODES];
  const proTrackers = [...ALL_TRACKER_CODES];
  const premiumTrackers = [...ALL_TRACKER_CODES];

  const upsertPlanTrackers = async (planId: string, codes: string[]) => {
    for (const code of codes) {
      await prisma.planTracker.upsert({
        where: { planId_trackerCode: { planId, trackerCode: code } },
        update: {},
        create: { planId, trackerCode: code },
      });
    }
  };

  await upsertPlanTrackers(free.id, freeTrackers);
  await upsertPlanTrackers(pro.id, proTrackers);
  await upsertPlanTrackers(premium.id, premiumTrackers);

  console.log('Seeded plans:', { free: free.code, pro: pro.code, premium: premium.code });

  // Backfill: ensure every user has a subscription. This self-heals accounts created
  // before the plans were seeded (which would otherwise see no trackers).
  const usersWithoutSub = await prisma.user.findMany({
    where: { subscription: null },
    select: { id: true },
  });
  for (const u of usersWithoutSub) {
    await prisma.userSubscription.create({ data: { userId: u.id, planId: free.id } });
  }
  console.log(`Backfilled default subscription for ${usersWithoutSub.length} user(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
