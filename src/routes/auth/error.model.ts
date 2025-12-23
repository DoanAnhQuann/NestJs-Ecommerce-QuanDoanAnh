import { UnprocessableEntityException } from '@nestjs/common';

export const InvalidOTPException = new UnprocessableEntityException([
  {
    message: 'OTP has expired',
    path: 'code',
  },
]);
