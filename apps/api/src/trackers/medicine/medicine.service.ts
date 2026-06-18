import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type {
  CreateMedicineCardInput,
  CreateMedicineInput,
  MedicineDoseInput,
  UpdateMedicineCardInput,
  UpdateMedicineInput,
} from '@daily-tracker/shared';

@Injectable()
export class MedicineService {
  constructor(private readonly prisma: PrismaService) {}

  /** All of the user's medicine cards + medicines, with dose state for the given date. */
  async getForDate(userId: string, date: string) {
    const cards = await this.prisma.medicineCard.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        medicines: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: { doses: { where: { date: new Date(date) } } },
        },
      },
    });

    return cards.map((c) => ({
      id: c.id,
      title: c.title,
      note: c.note,
      sortOrder: c.sortOrder,
      medicines: c.medicines.map((m) => ({
        id: m.id,
        name: m.name,
        note: m.note,
        slots: m.slots,
        doses: Object.fromEntries(m.doses.map((d) => [d.slot, d.taken])) as Record<string, boolean>,
      })),
    }));
  }

  async createCard(userId: string, input: CreateMedicineCardInput) {
    const sortOrder = await this.prisma.medicineCard.count({ where: { userId } });
    return this.prisma.medicineCard.create({
      data: { userId, title: input.title, note: input.note ?? null, sortOrder },
    });
  }

  async updateCard(userId: string, id: string, input: UpdateMedicineCardInput) {
    await this.assertCard(userId, id);
    return this.prisma.medicineCard.update({
      where: { id },
      data: { title: input.title, note: input.note, sortOrder: input.sortOrder },
    });
  }

  async deleteCard(userId: string, id: string): Promise<void> {
    await this.assertCard(userId, id);
    await this.prisma.medicineCard.delete({ where: { id } });
  }

  async createMedicine(userId: string, cardId: string, input: CreateMedicineInput) {
    await this.assertCard(userId, cardId);
    const sortOrder = await this.prisma.medicine.count({ where: { cardId } });
    return this.prisma.medicine.create({
      data: {
        cardId,
        name: input.name,
        note: input.note ?? null,
        slots: input.slots,
        sortOrder,
      },
    });
  }

  async updateMedicine(userId: string, id: string, input: UpdateMedicineInput) {
    await this.assertMedicine(userId, id);
    return this.prisma.medicine.update({
      where: { id },
      data: { name: input.name, note: input.note, slots: input.slots },
    });
  }

  async deleteMedicine(userId: string, id: string): Promise<void> {
    await this.assertMedicine(userId, id);
    await this.prisma.medicine.delete({ where: { id } });
  }

  async setDose(userId: string, input: MedicineDoseInput) {
    await this.assertMedicine(userId, input.medicineId);
    const date = new Date(input.date);
    return this.prisma.medicineDoseLog.upsert({
      where: {
        medicineId_date_slot: { medicineId: input.medicineId, date, slot: input.slot },
      },
      update: { taken: input.taken },
      create: { medicineId: input.medicineId, date, slot: input.slot, taken: input.taken },
    });
  }

  // ─── Ownership guards ──────────────────────────────────────────────────────

  private async assertCard(userId: string, id: string) {
    const card = await this.prisma.medicineCard.findFirst({ where: { id, userId } });
    if (!card) throw new NotFoundException('Medicine card not found');
    return card;
  }

  private async assertMedicine(userId: string, id: string) {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, card: { userId } },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    return medicine;
  }
}
