import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ExerciseService } from './exercise.service';
import {
  TRACKER_CODES,
  isoDate,
  exerciseEntrySchema,
  type ExerciseEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/exercise')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.EXERCISE)
export class ExerciseController {
  constructor(private readonly exercise: ExerciseService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.exercise.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(exerciseEntrySchema)) body: ExerciseEntryInput,
  ) {
    return this.exercise.upsert(user.id, body);
  }
}
