import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SalahService } from './salah.service';
import {
  TRACKER_CODES,
  isoDate,
  salahEntrySchema,
  type SalahEntryInput,
} from '@daily-tracker/shared';
import { z } from 'zod';

@Controller('trackers/salah')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.SALAH)
export class SalahController {
  constructor(private readonly salah: SalahService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.salah.getForDate(user.id, date);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.salah.recent(user.id);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(salahEntrySchema)) body: SalahEntryInput,
  ) {
    return this.salah.upsert(user.id, body);
  }
}

// Inline schema example kept narrow: only validating one param above using the shared `isoDate`.
export const _SalahDateParam = z.object({ date: isoDate });
