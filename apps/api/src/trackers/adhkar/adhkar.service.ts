import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { AdhkarEntryInput } from '@daily-tracker/shared';

@Injectable()
export class AdhkarService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.adhkarEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: AdhkarEntryInput) {
    const date = new Date(input.date);
    const data = { morning: input.morning, evening: input.evening };
    return this.prisma.adhkarEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
