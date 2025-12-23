import { createZodDto } from 'nestjs-zod';
import { EmptyBodySchema } from '../models/req.model';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
