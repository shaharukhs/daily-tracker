import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SadaqahService } from './sadaqah.service';
import {
  TRACKER_CODES,
  isoDate,
  sadaqahEntrySchema,
  type SadaqahEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/sadaqah')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.SADAQAH)
export class SadaqahController {
  constructor(private readonly sadaqah: SadaqahService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.sadaqah.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(sadaqahEntrySchema)) body: SadaqahEntryInput,
  ) {
    return this.sadaqah.upsert(user.id, body);
  }
}
