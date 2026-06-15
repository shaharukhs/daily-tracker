import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { JunkFreeEntryInput } from '@daily-tracker/shared';

@Injectable()
export class JunkFreeService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.junkFreeEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: JunkFreeEntryInput) {
    const date = new Date(input.date);
    return this.prisma.junkFreeEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { junkFree: input.junkFree },
      create: { userId, date, junkFree: input.junkFree },
    });
  }
}
