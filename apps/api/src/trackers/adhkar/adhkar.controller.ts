import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AdhkarService } from './adhkar.service';
import {
  TRACKER_CODES,
  isoDate,
  adhkarEntrySchema,
  type AdhkarEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/adhkar')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.ADHKAR)
export class AdhkarController {
  constructor(private readonly adhkar: AdhkarService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.adhkar.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(adhkarEntrySchema)) body: AdhkarEntryInput,
  ) {
    return this.adhkar.upsert(user.id, body);
  }
}
