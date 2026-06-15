import { Injectable } from '@nestjs/common';
import { SalahStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { SalahEntryInput, SalahPrayerStatus } from '@daily-tracker/shared';

const statusMap: Record<SalahPrayerStatus, SalahStatus> = {
  missed: SalahStatus.MISSED,
  qadha: SalahStatus.QADHA,
  on_time: SalahStatus.ON_TIME,
  in_jamaah: SalahStatus.IN_JAMAAH,
};

@Injectable()
export class SalahService {
  constructor(private readonly prisma: PrismaService) {}

  getForDate(userId: string, date: string) {
    return this.prisma.salahEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  }

  recent(userId: string) {
    return this.prisma.salahEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  upsert(userId: string, input: SalahEntryInput) {
    const date = new Date(input.date);
    const data = {
      fajr: statusMap[input.fajr],
      dhuhr: statusMap[input.dhuhr],
      asr: statusMap[input.asr],
      maghrib: statusMap[input.maghrib],
      isha: statusMap[input.isha],
      fajrSunnah: input.fajrSunnah,
      dhuhrSunnah: input.dhuhrSunnah,
      maghribSunnah: input.maghribSunnah,
      ishaSunnahWitr: input.ishaSunnahWitr,
      tahajjud: input.tahajjud,
    };
    return this.prisma.salahEntry.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { userId, date, ...data },
    });
  }
}
