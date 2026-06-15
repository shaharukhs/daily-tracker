import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JunkFreeService } from './junk-free.service';
import {
  TRACKER_CODES,
  isoDate,
  junkFreeEntrySchema,
  type JunkFreeEntryInput,
} from '@daily-tracker/shared';

@Controller('trackers/junk_free')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.JUNK_FREE)
export class JunkFreeController {
  constructor(private readonly junkFree: JunkFreeService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.junkFree.getForDate(user.id, date);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(junkFreeEntrySchema)) body: JunkFreeEntryInput,
  ) {
    return this.junkFree.upsert(user.id, body);
  }
}
