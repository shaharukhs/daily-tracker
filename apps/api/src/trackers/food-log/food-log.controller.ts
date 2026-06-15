import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { FoodLogService } from './food-log.service';
import {
  TRACKER_CODES,
  isoDate,
  foodLogEntrySchema,
  type FoodLogEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/food_log')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.FOOD_LOG)
export class FoodLogController {
  constructor(private readonly foodLog: FoodLogService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.foodLog.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(foodLogEntrySchema)) body: FoodLogEntryInput,
  ) {
    return this.foodLog.upsert(user.id, body);
  }
}
