import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { LanguagesRepository } from './language.repo';

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguagesRepository],
})
export class LanguageModule {}
