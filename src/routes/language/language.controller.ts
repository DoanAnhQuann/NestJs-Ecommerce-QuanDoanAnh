import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  LanguageBodyDTO,
  LanguageParamDTO,
  LanguageResByIdDTO,
  LanguageResDTO,
} from './language.dto';

import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { LanguageService } from './language.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('/')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(LanguageResDTO)
  getLanguages() {
    return this.languageService.getLanguages();
  }

  @Get('/:languageId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(LanguageResByIdDTO)
  getLanguageById(@Param() param: LanguageParamDTO) {
    return this.languageService.getLanguageById(param.languageId);
  }

  @Post('/')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  createLanguage(
    @Body() body: LanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.createLanguage(body, userId);
  }

  @Put('/:languageId')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  updateLanguage(
    @Param() param: LanguageParamDTO,
    @Body() body: LanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.updateLanguage(param.languageId, body, userId);
  }

  @Delete('/:languageId')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  deleteLanguage(@Param() param: LanguageParamDTO) {
    return this.languageService.deleteLanguage(param.languageId);
  }
}
