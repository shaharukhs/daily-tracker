import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { MeditationEntryInput } from '@daily-tracker/shared';

@Injectable()
export class MeditationService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.meditationEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: MeditationEntryInput) {
    const date = new Date(input.date);
    return this.prisma.meditationEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { minutes: input.minutes },
      create: { userId, date, minutes: input.minutes },
    });
  }
}
