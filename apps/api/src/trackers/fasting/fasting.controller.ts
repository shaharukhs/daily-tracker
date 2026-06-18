import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { FastingService } from './fasting.service';
import {
  TRACKER_CODES,
  isoDate,
  fastingEntrySchema,
  type FastingEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/fasting')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.FASTING)
export class FastingController {
  constructor(private readonly fasting: FastingService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.fasting.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(fastingEntrySchema)) body: FastingEntryInput,
  ) {
    return this.fasting.upsert(user.id, body);
  }
}
