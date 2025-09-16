import { AccessTokenGuard } from './access-token.guard';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_TYPE_KEY,
  AuthTypeDecoratorPayload,
} from '../decorators/auth.decorator';

import { ApiKeyGuard } from './api-key.guard';
import { AuthType, ConditionGuard } from '../constants/auth.constant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private authTypeGuardMap: Record<string, CanActivate>;
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.ApiKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      authTypes: [AuthType.None],
      options: { condition: 'AND' },
    };

    const guards = authTypeValue.authTypes.map((type) => {
      return this.authTypeGuardMap[type];
    });

    if (authTypeValue.options.condition === ConditionGuard.OR) {
      for (const guard of guards) {
        if (await guard.canActivate(context)) {
          return true;
        }
      }
      throw new UnauthorizedException();
    } else {
      for (const guard of guards) {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException();
        }
      }
      return true;
    }
  }
}
