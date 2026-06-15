import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { FoodLogEntryInput } from '@daily-tracker/shared';

@Injectable()
export class FoodLogService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.foodLogEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: FoodLogEntryInput) {
    const date = new Date(input.date);
    // Coalesce undefined -> null so cleared meal fields are persisted as empty.
    const data = {
      suhoorTime: input.suhoorTime ?? null,
      suhoorCalories: input.suhoorCalories ?? null,
      lunchTime: input.lunchTime ?? null,
      lunchCalories: input.lunchCalories ?? null,
      dinnerTime: input.dinnerTime ?? null,
      dinnerCalories: input.dinnerCalories ?? null,
      snackTime: input.snackTime ?? null,
      snackCalories: input.snackCalories ?? null,
    };
    return this.prisma.foodLogEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
