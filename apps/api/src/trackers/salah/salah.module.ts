import { Module } from '@nestjs/common';
import { SalahController } from './salah.controller';
import { SalahService } from './salah.service';

@Module({
  controllers: [SalahController],
  providers: [SalahService],
})
export class SalahModule {}
