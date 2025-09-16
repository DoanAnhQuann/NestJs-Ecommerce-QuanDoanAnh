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
import envConfig from '../config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const X_API_KEY = request.headers['x-api-key'];
    console.log(X_API_KEY, envConfig.SECRET_API_KEY);
    if (X_API_KEY !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
