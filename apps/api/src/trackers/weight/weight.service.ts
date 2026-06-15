import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { WeightEntryInput } from '@daily-tracker/shared';

@Injectable()
export class WeightService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.weightEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: WeightEntryInput) {
    const date = new Date(input.date);
    const data = {
      weightKg: input.weightKg,
      lostThisWeekKg: input.lostThisWeekKg ?? null,
    };
    return this.prisma.weightEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
