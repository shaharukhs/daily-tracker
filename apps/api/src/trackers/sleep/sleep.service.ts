import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { SleepEntryInput } from '@daily-tracker/shared';

@Injectable()
export class SleepService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.sleepEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: SleepEntryInput) {
    const date = new Date(input.date);
    const data = { hours: input.hours, quality: input.quality };
    return this.prisma.sleepEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
