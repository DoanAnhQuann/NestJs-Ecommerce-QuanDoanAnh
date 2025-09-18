import { createZodDto } from 'nestjs-zod';
import {
  RegisterBodySchema,
  RegisterResSchema,
  SendOTPBodySchema,
} from './auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDTO extends createZodDto(RegisterResSchema) {}
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
