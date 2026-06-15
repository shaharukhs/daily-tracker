import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { QuranEntryInput } from '@daily-tracker/shared';

@Injectable()
export class QuranService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.quranEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: QuranEntryInput) {
    const date = new Date(input.date);
    return this.prisma.quranEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { pages: input.pages },
      create: { userId, date, pages: input.pages },
    });
  }
}
