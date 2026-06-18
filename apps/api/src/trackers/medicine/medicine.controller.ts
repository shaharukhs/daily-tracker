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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiresTrackerGuard } from '../../common/guards/requires-tracker.guard';
import { RequiresTracker } from '../../common/decorators/requires-tracker.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MedicineService } from './medicine.service';
import {
  TRACKER_CODES,
  isoDate,
  createMedicineCardSchema,
  updateMedicineCardSchema,
  createMedicineSchema,
  updateMedicineSchema,
  medicineDoseSchema,
  type CreateMedicineCardInput,
  type UpdateMedicineCardInput,
  type CreateMedicineInput,
  type UpdateMedicineInput,
  type MedicineDoseInput,
} from '@daily-tracker/shared';

@Controller('medicine')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.MEDICINE)
export class MedicineController {
  constructor(private readonly medicine: MedicineService) {}

  @Get(':date')
  getByDate(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(isoDate)) date: string,
  ) {
    return this.medicine.getForDate(user.id, date);
  }

  @Post('cards')
  createCard(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createMedicineCardSchema)) body: CreateMedicineCardInput,
  ) {
    return this.medicine.createCard(user.id, body);
  }

  @Patch('cards/:id')
  updateCard(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMedicineCardSchema)) body: UpdateMedicineCardInput,
  ) {
    return this.medicine.updateCard(user.id, id, body);
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCard(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.medicine.deleteCard(user.id, id);
  }

  @Post('cards/:cardId/medicines')
  createMedicine(
    @CurrentUser() user: AuthUser,
    @Param('cardId') cardId: string,
    @Body(new ZodValidationPipe(createMedicineSchema)) body: CreateMedicineInput,
  ) {
    return this.medicine.createMedicine(user.id, cardId, body);
  }

  @Patch('medicines/:id')
  updateMedicine(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMedicineSchema)) body: UpdateMedicineInput,
  ) {
    return this.medicine.updateMedicine(user.id, id, body);
  }

  @Delete('medicines/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMedicine(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.medicine.deleteMedicine(user.id, id);
  }

  @Put('dose')
  setDose(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(medicineDoseSchema)) body: MedicineDoseInput,
  ) {
    return this.medicine.setDose(user.id, body);
  }
}
