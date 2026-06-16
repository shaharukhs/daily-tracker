import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma/prisma.service';
import { TokensService } from './tokens.service';
import {
  ALL_TRACKER_CODES,
  TRACKER_METADATA,
  type LoginInput,
  type RegisterInput,
} from '@daily-tracker/shared';

export interface AuthResult {
  user: { id: string; email: string; displayName: string };
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
  ) {}

  async register(
    input: RegisterInput,
    meta: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.isActive) {
      // Same error for "already exists" and "weak password" cases is good practice;
      // here registration is explicit so a conflict is fine.
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const defaultPlan = existing
      ? null
      : await this.prisma.subscriptionPlan.findFirst({ where: { isDefault: true } });

    const user = existing
      ? // Archived account re-registering: reactivate it. All previous data
        // (preferences, subscription, tracker entries) is preserved and restored.
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { isActive: true, passwordHash, displayName: input.displayName },
        })
      : await this.prisma.user.create({
          data: {
            email: input.email,
            displayName: input.displayName,
            passwordHash,
            ...(defaultPlan && {
              subscription: { create: { planId: defaultPlan.id } },
            }),
            preferences: {
              create: ALL_TRACKER_CODES.map((code, idx) => ({
                trackerCode: code,
                enabled: TRACKER_METADATA[code].defaultEnabled,
                sortOrder: idx,
              })),
            },
          },
        });

    const accessToken = this.tokens.signAccessToken({ sub: user.id, email: user.email });
    const { token: refreshToken, expiresAt } = await this.tokens.issueRefreshToken(user.id, meta);

    return {
      user: { id: user.id, email: user.email, displayName: user.displayName },
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async login(
    input: LoginInput,
    meta: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });

    // Constant-ish work to avoid user-enumeration timing leak.
    const dummyHash =
      '$argon2id$v=19$m=65536,t=3,p=1$ZGVmYXVsdHNhbHQ$1B1xUWPHm0n0aGqfvJk1Q2g0RZ7vNzKuC0aL+t6Hh1Y';
    const hashToCheck = user?.passwordHash ?? dummyHash;
    const ok = await argon2.verify(hashToCheck, input.password).catch(() => false);

    if (!user || !user.isActive || !ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.tokens.signAccessToken({ sub: user.id, email: user.email });
    const { token: refreshToken, expiresAt } = await this.tokens.issueRefreshToken(user.id, meta);

    return {
      user: { id: user.id, email: user.email, displayName: user.displayName },
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async refresh(
    rawRefreshToken: string,
    meta: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<{ accessToken: string; refreshToken: string; refreshExpiresAt: Date }> {
    const rotated = await this.tokens.rotateRefreshToken(rawRefreshToken, meta);
    if (!rotated) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.prisma.user.findUnique({ where: { id: rotated.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid refresh token');
    const accessToken = this.tokens.signAccessToken({ sub: user.id, email: user.email });
    return { accessToken, refreshToken: rotated.token, refreshExpiresAt: rotated.expiresAt };
  }

  async logout(rawRefreshToken: string | undefined, userId: string): Promise<void> {
    if (rawRefreshToken) {
      await this.tokens.revokeRefreshToken(rawRefreshToken);
    } else {
      await this.tokens.revokeAllForUser(userId);
    }
  }

  /**
   * Soft-delete ("archive") an account on user request. No data is deleted — the user
   * row and all related records are kept. The account is marked inactive (which the JWT
   * strategy, login and refresh all reject) and every refresh token is revoked, so the
   * user is locked out immediately. They regain access only by registering again with
   * the same email, which reactivates this account (see `register`).
   */
  async archiveAccount(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    await this.tokens.revokeAllForUser(userId);
  }
}
