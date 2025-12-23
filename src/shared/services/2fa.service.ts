/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import envConfig from '../config';

@Injectable()
export class TwoFactorAuthService {
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email);
    return { secret: totp.secret.base32, url: totp.toString() };
  }

  verifyTOTP({
    email,
    token,
    secret,
  }: {
    email: string;
    token: string;
    secret: string;
  }): boolean {
    const totp = this.createTOTP(email, secret);

    //window: 1 => cho phép lệch thời gian 30s trước hoặc sau
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }
}
