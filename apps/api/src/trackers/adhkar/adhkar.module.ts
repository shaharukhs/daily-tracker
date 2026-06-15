import { Module } from '@nestjs/common';
import { AdhkarController } from './adhkar.controller';
import { AdhkarService } from './adhkar.service';

@Module({
  controllers: [AdhkarController],
  providers: [AdhkarService],
})
export class AdhkarModule {}
