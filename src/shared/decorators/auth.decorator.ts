import { SetMetadata } from '@nestjs/common';
import { AuthType, ConditionGuard } from '../constants/auth.constant';

export const AUTH_TYPE_KEY = 'authType';
export type AuthTypeDecoratorPayload = {
  authTypes: AuthType[];
  options: {
    condition: ConditionGuard;
  };
};
export const Auth = (
  authTypes: AuthType[],
  options?: { condition: ConditionGuard },
) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    authTypes,
    options: options ?? { condition: ConditionGuard.AND },
  });
};
