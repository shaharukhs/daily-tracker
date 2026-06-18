import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { MoodEntryInput } from '@daily-tracker/shared';

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.moodEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: MoodEntryInput) {
    const date = new Date(input.date);
    const data = { mood: input.mood, gratitude: input.gratitude };
    return this.prisma.moodEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
