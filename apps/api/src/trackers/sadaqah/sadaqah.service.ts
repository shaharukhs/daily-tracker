import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { SadaqahEntryInput } from '@daily-tracker/shared';

@Injectable()
export class SadaqahService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.sadaqahEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: SadaqahEntryInput) {
    const date = new Date(input.date);
    const data = {
      given: input.given,
      amount: input.amount ?? null,
      note: input.note ?? null,
    };
    return this.prisma.sadaqahEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
