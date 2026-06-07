import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { AiController } from './ai.controller';

@Module({
  providers: [TranslationService],
  controllers: [AiController],
  exports: [TranslationService],
})
export class AiModule {}
