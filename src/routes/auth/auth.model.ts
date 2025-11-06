import { VerificationCodeType } from '@prisma/client';
import { UserSchema } from 'src/shared/models/share-user.model';
import z from 'zod';

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    otp: z.string().length(6),
  })
  .strict() // .strict() để không cho phép các trường dư thừa
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type RegisterResType = z.infer<typeof RegisterResSchema>;

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    VerificationCodeType.REGISTER,
    VerificationCodeType.FORGOT_PASSWORD,
    VerificationCodeType.LOGIN,
    VerificationCodeType.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type VerificationBodyType = z.infer<typeof VerificationCodeSchema>;

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export type LoginBodyType = z.infer<typeof LoginBodySchema>;

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type LoginResType = z.infer<typeof LoginResSchema>;

export const RefreshTokenBodySchema = LoginResSchema.pick({
  refreshToken: true,
}).strict();

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;

export const RefreshTokenResSchema = LoginResSchema;

export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>;

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export type DeviceType = z.infer<typeof DeviceSchema>;

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const GoogleAuthStateSchema = z.object({
  userAgent: z.string(),
  ip: z.string(),
});

export const GetAuthorizationUrlSchema = z.object({
  url: z.string().url(),
});

export type GetAuthorizationUrlType = z.infer<typeof GetAuthorizationUrlSchema>;
export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>;
export const LogoutBodySchema = RefreshTokenBodySchema;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>;
