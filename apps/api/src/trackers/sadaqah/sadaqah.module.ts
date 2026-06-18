import { Module } from '@nestjs/common';
import { SadaqahController } from './sadaqah.controller';
import { SadaqahService } from './sadaqah.service';

@Module({
  controllers: [SadaqahController],
  providers: [SadaqahService],
})
export class SadaqahModule {}
