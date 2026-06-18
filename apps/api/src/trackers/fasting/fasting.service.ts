import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { FastingEntryInput } from '@daily-tracker/shared';

@Injectable()
export class FastingService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.fastingEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: FastingEntryInput) {
    const date = new Date(input.date);
    const data = { fasted: input.fasted, fastType: input.fastType ?? null };
    return this.prisma.fastingEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
