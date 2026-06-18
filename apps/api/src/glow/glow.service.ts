import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type {
  CreateGlowProductInput,
  GlowLogInput,
  UpdateGlowProductInput,
} from '@daily-tracker/shared';

@Injectable()
export class GlowService {
  constructor(private readonly prisma: PrismaService) {}

  /** All of the user's products with their done-state for the given date. */
  async getForDate(userId: string, date: string) {
    const products = await this.prisma.glowProduct.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { logs: { where: { date: new Date(date) } } },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      note: p.note,
      routine: p.routine,
      sortOrder: p.sortOrder,
      done: p.logs[0]?.done ?? false,
    }));
  }

  async createProduct(userId: string, input: CreateGlowProductInput) {
    const sortOrder = await this.prisma.glowProduct.count({ where: { userId } });
    return this.prisma.glowProduct.create({
      data: {
        userId,
        name: input.name,
        note: input.note ?? null,
        routine: input.routine,
        sortOrder,
      },
    });
  }

  async updateProduct(userId: string, id: string, input: UpdateGlowProductInput) {
    await this.assertProduct(userId, id);
    return this.prisma.glowProduct.update({
      where: { id },
      data: {
        name: input.name,
        note: input.note,
        routine: input.routine,
        sortOrder: input.sortOrder,
      },
    });
  }

  async deleteProduct(userId: string, id: string): Promise<void> {
    await this.assertProduct(userId, id);
    await this.prisma.glowProduct.delete({ where: { id } });
  }

  async setLog(userId: string, input: GlowLogInput) {
    await this.assertProduct(userId, input.productId);
    const date = new Date(input.date);
    return this.prisma.glowLog.upsert({
      where: { productId_date: { productId: input.productId, date } },
      update: { done: input.done },
      create: { productId: input.productId, date, done: input.done },
    });
  }

  private async assertProduct(userId: string, id: string) {
    const product = await this.prisma.glowProduct.findFirst({ where: { id, userId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
