import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { WaterEntryInput } from '@daily-tracker/shared';

@Injectable()
export class WaterService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.waterEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: WaterEntryInput) {
    const date = new Date(input.date);
    return this.prisma.waterEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { glasses: input.glasses },
      create: { userId, date, glasses: input.glasses },
    });
  }
}
