import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { PrismaService } from '../common/prisma/prisma.service';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  subscriptionPlan: { findFirst: jest.fn() },
};

const tokensMock = {
  signAccessToken: jest.fn().mockReturnValue('access.jwt'),
  issueRefreshToken: jest
    .fn()
    .mockResolvedValue({ token: 'r.token', expiresAt: new Date(Date.now() + 1_000_000) }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TokensService, useValue: tokensMock },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('throws ConflictException when registering an existing email', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'u1' });
    await expect(
      service.register({
        email: 'a@b.co',
        displayName: 'Aisha',
        password: 'Aa1!aaaaaaaa!Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws UnauthorizedException on unknown email', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.login({ email: 'x@y.z', password: 'whatever' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
