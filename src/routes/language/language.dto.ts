import { createZodDto } from 'nestjs-zod';
import {
  languageParamSchema,
  languageSchema,
  languageSchemaBody,
  languageSchemaRes,
} from './language.model';

export class LanguageBodyDTO extends createZodDto(languageSchemaBody) {}

export class LanguageResDTO extends createZodDto(languageSchemaRes) {}

export class LanguageResByIdDTO extends createZodDto(languageSchema) {}

export class LanguageParamDTO extends createZodDto(languageParamSchema) {}
