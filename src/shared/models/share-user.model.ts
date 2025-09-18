import { UserStatus } from '@prisma/client';
import z from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phoneNumber: z.string().min(10).max(15),
  password: z.string().min(6).max(100),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  totpSecret: z.string().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;
