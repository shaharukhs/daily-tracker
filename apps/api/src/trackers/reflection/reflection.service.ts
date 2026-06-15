import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { ReflectionEntryInput } from '@daily-tracker/shared';

@Injectable()
export class ReflectionService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.reflectionEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  upsert(userId: string, input: ReflectionEntryInput) {
    const date = new Date(input.date);
    return this.prisma.reflectionEntry.upsert({
      where: { userId_date: { userId, date } },
      update: { text: input.text },
      create: { userId, date, text: input.text },
    });
  }
}
