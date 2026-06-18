import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SleepService } from './sleep.service';
import {
  TRACKER_CODES,
  isoDate,
  sleepEntrySchema,
  type SleepEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/sleep')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.SLEEP)
export class SleepController {
  constructor(private readonly sleep: SleepService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.sleep.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(sleepEntrySchema)) body: SleepEntryInput,
  ) {
    return this.sleep.upsert(user.id, body);
  }
}
