import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { ExerciseEntryInput } from '@daily-tracker/shared';

@Injectable()
export class ExerciseService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.exerciseEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: ExerciseEntryInput) {
    const date = new Date(input.date);
    const data = { exercised: input.exercised, steps: input.steps };
    return this.prisma.exerciseEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
