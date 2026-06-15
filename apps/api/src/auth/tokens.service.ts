import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import type { Env } from '../config/env';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {}

  signAccessToken(payload: JwtPayload): string {
    return this.jwt.sign(payload, {
      secret: this.cfg.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: this.cfg.get('JWT_ACCESS_TTL', { infer: true }),
    });
  }

  /** Generate cryptographically strong opaque refresh token + persist its SHA-256 hash. */
  async issueRefreshToken(
    userId: string,
    meta: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(token);
    const ttlDays = this.parseDays(this.cfg.get('JWT_REFRESH_TTL', { infer: true }));
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        userAgent: meta.userAgent?.slice(0, 255),
        ipAddress: meta.ipAddress?.slice(0, 64),
        expiresAt,
      },
    });
    return { token, expiresAt };
  }

  /** Rotate refresh token: revoke old, issue new. Returns null if token invalid/expired/revoked. */
  async rotateRefreshToken(
    rawToken: string,
    meta: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<{ userId: string; token: string; expiresAt: Date } | null> {
    const tokenHash = this.hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      return null;
    }

    // Revoke old, then issue new in a transaction to prevent replay.
    const issued = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() },
      });
      const token = randomBytes(48).toString('base64url');
      const newHash = this.hashToken(token);
      const ttlDays = this.parseDays(this.cfg.get('JWT_REFRESH_TTL', { infer: true }));
      const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
      await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: newHash,
          userAgent: meta.userAgent?.slice(0, 255),
          ipAddress: meta.ipAddress?.slice(0, 64),
          expiresAt,
        },
      });
      return { token, expiresAt };
    });

    return { userId: existing.userId, ...issued };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private parseDays(ttl: string): number {
    const match = /^(\d+)([dhm])$/.exec(ttl);
    if (!match) return 30;
    const value = Number(match[1]);
    const unit = match[2];
    if (unit === 'd') return value;
    if (unit === 'h') return value / 24;
    if (unit === 'm') return value / (24 * 60);
    return 30;
  }
}
