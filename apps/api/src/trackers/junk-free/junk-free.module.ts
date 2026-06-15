import { Module } from '@nestjs/common';
import { JunkFreeController } from './junk-free.controller';
import { JunkFreeService } from './junk-free.service';

@Module({
  controllers: [JunkFreeController],
  providers: [JunkFreeService],
})
export class JunkFreeModule {}
