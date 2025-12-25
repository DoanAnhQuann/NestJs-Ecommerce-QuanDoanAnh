import { createZodDto } from 'nestjs-zod';
import {
  PermissionModelSchema,
  PermissionParamSchema,
  PermissionQuerySchema,
  PermissionReqBodyCreateSchema,
  PermissionResSchema,
} from './permission.model';

export class PermissionSchemaQueryDTO extends createZodDto(
  PermissionQuerySchema,
) {}

export class PermissionSchemaParamDTO extends createZodDto(
  PermissionParamSchema,
) {}

export class PermissionSchemaReqBodyCreateDTO extends createZodDto(
  PermissionReqBodyCreateSchema,
) {}

export class PermissionSchemaResDTO extends createZodDto(PermissionResSchema) {}

export class PermissionByIdSchemaResDTO extends createZodDto(
  PermissionModelSchema,
) {}
