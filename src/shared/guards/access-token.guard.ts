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
import { TokenService } from '../services/token.service';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      return false;
    }

    try {
      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
