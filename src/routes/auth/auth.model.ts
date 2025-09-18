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
