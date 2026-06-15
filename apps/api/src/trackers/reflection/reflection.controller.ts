import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ReflectionService } from './reflection.service';
import {
  TRACKER_CODES,
  isoDate,
  reflectionEntrySchema,
  type ReflectionEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/reflection')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.REFLECTION)
export class ReflectionController {
  constructor(private readonly reflection: ReflectionService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.reflection.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(reflectionEntrySchema)) body: ReflectionEntryInput,
  ) {
    return this.reflection.upsert(user.id, body);
  }
}
