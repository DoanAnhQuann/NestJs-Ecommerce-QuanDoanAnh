import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LanguagesRepository } from './language.repo';
import { LanguageTypeBody } from './language.model';

@Injectable()
export class LanguageService {
  constructor(private readonly languagesRepo: LanguagesRepository) {}

  async getLanguages() {
    const languages = await this.languagesRepo.getLanguages();
    return languages;
  }

  async getLanguageById(id: string) {
    const language = await this.languagesRepo.getLanguageById(id);

    if (!language) {
      throw new UnauthorizedException('Language not found');
    }

    return language;
  }

  async createLanguage(data: LanguageTypeBody, userId: number) {
    const isAlreadyExist = await this.languagesRepo.findLanguageById(data.id);

    if (isAlreadyExist) {
      throw new UnauthorizedException('Language with this ID already exists');
    }

    const language = await this.languagesRepo.createLanguage(data, userId);

    if (!language) {
      throw new UnauthorizedException('Failed to create language');
    }
    return {
      message: 'Language created successfully',
    };
  }

  async updateLanguage(
    id: string,
    data: Partial<LanguageTypeBody>,
    userId: number,
  ) {
    const isAlreadyExist = await this.languagesRepo.findLanguageById(id);

    if (!isAlreadyExist) {
      throw new UnauthorizedException(
        'Language with this ID does not already exists',
      );
    }

    const language = await this.languagesRepo.updateLanguage(id, data, userId);

    if (!language) {
      throw new UnauthorizedException('Failed to UPDATE language');
    }
    return {
      message: 'Language UPDATE successfully',
    };
  }

  async deleteLanguage(id: string) {
    const isAlreadyExist = await this.languagesRepo.findLanguageById(id);

    if (!isAlreadyExist) {
      throw new UnauthorizedException(
        'Language with this ID does not already exists',
      );
    }
    const language = await this.languagesRepo.deleteLanguage(id);
    if (!language) {
      throw new UnauthorizedException('Failed to DELETE language');
    }
    return {
      message: 'Language DELETE successfully',
    };
  }
}
