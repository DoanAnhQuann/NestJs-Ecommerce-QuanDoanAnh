import { HTTPMethods } from 'src/shared/constants/role.constant';
import z from 'zod';

export const PermissionModelSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(500),
  description: z.string().max(255).default(''),
  path: z.string().max(1000),
  method: z.enum([
    HTTPMethods.GET,
    HTTPMethods.POST,
    HTTPMethods.PUT,
    HTTPMethods.DELETE,
    HTTPMethods.PATCH,
    HTTPMethods.OPTIONS,
    HTTPMethods.HEAD,
  ]),
  module: z.string().max(500).default(''),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PermissionQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();

export const PermissionParamSchema = z.object({
  permissionId: z.coerce.number().int().positive(),
});

export const PermissionReqBodyCreateSchema = PermissionModelSchema.pick({
  name: true,
  path: true,
  method: true,
  description: true,
  module: true,
}).strict();

export const PermissionResSchema = z.object({
  data: z.array(PermissionModelSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type PermissionTypeRes = z.infer<typeof PermissionResSchema>;

export type PermissionTypeReqBodyCreate = z.infer<
  typeof PermissionReqBodyCreateSchema
>;

export type PermissionTypeParam = z.infer<typeof PermissionParamSchema>;

export type PermissionTypeQuery = z.infer<typeof PermissionQuerySchema>;

export type PermissionTypeModel = z.infer<typeof PermissionModelSchema>;
