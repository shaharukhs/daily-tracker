import { Module } from '@nestjs/common';
import { GlowController } from './glow.controller';
import { GlowService } from './glow.service';

@Module({
  controllers: [GlowController],
  providers: [GlowService],
})
export class GlowModule {}
