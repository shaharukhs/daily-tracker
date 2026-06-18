import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MoodService } from './mood.service';
import {
  TRACKER_CODES,
  isoDate,
  moodEntrySchema,
  type MoodEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/mood')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.MOOD)
export class MoodController {
  constructor(private readonly mood: MoodService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.mood.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(moodEntrySchema)) body: MoodEntryInput,
  ) {
    return this.mood.upsert(user.id, body);
  }
}
