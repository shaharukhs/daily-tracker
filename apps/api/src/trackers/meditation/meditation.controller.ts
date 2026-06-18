import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MeditationService } from './meditation.service';
import {
  TRACKER_CODES,
  isoDate,
  meditationEntrySchema,
  type MeditationEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/meditation')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.MEDITATION)
export class MeditationController {
  constructor(private readonly meditation: MeditationService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.meditation.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(meditationEntrySchema)) body: MeditationEntryInput,
  ) {
    return this.meditation.upsert(user.id, body);
  }
}
