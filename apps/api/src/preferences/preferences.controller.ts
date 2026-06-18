import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PreferencesService } from './preferences.service';
import {
  preferenceUpdateSchema,
  preferencesLayoutSchema,
  type PreferenceUpdateInput,
  type PreferencesLayoutInput,
} from '@daily-tracker/shared';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferences: PreferencesService) {}

  /** Returns all trackers the user's plan unlocks, with the user's enabled/disabled choice. */
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.preferences.listForUser(user.id);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(preferenceUpdateSchema)) body: PreferenceUpdateInput,
  ) {
    return this.preferences.upsert(user.id, body);
  }

  /** Save the whole dashboard layout (enabled + position for each card). */
  @Put('layout')
  saveLayout(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(preferencesLayoutSchema)) body: PreferencesLayoutInput,
  ) {
    return this.preferences.saveLayout(user.id, body.items);
  }
}
