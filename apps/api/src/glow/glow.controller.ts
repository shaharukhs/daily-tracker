import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GlowService } from './glow.service';
import {
  isoDate,
  createGlowProductSchema,
  updateGlowProductSchema,
  glowLogSchema,
  type CreateGlowProductInput,
  type UpdateGlowProductInput,
  type GlowLogInput,
} from '@daily-tracker/shared';

@Controller('glow')
@UseGuards(JwtAuthGuard)
export class GlowController {
  constructor(private readonly glow: GlowService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.glow.getForDate(user.id, date);
  }

  @Post('products')
  createProduct(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createGlowProductSchema)) body: CreateGlowProductInput,
  ) {
    return this.glow.createProduct(user.id, body);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGlowProductSchema)) body: UpdateGlowProductInput,
  ) {
    return this.glow.updateProduct(user.id, id, body);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.glow.deleteProduct(user.id, id);
  }

  @Put('log')
  setLog(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(glowLogSchema)) body: GlowLogInput,
  ) {
    return this.glow.setLog(user.id, body);
  }
}
