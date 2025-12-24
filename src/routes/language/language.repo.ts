import { PrismaService } from 'src/shared/services/prisma.service';
import { LanguageTypeBody } from './language.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguagesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getLanguages() {
    const languages = await this.prismaService.language.findMany({
      where: { deletedAt: null },
    });
    return languages;
  }

  async getLanguageById(id: string) {
    const language = await this.prismaService.language.findUnique({
      where: { id, deletedAt: null },
    });
    return language;
  }

  async createLanguage(data: LanguageTypeBody, createdById: number) {
    const language = await this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    });
    return language;
  }

  async updateLanguage(
    id: string,
    data: Partial<LanguageTypeBody>,
    updatedById: number,
  ) {
    const language = await this.prismaService.language.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    });
    return language;
  }

  async deleteLanguage(id: string) {
    const language = await this.prismaService.language.delete({
      where: { id, deletedAt: null },
    });
    return language;
  }

  async findLanguageById(id: string) {
    const language = await this.prismaService.language.findUnique({
      where: { id },
    });
    return language;
  }
}
