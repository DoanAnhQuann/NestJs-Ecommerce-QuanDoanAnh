import { Algorithm } from './../../../node_modules/@types/jsonwebtoken/index.d';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import envConfig from '../config';
import { v4 as uuidv4 } from 'uuid';
import {
  AccessTokenPayloadCreate,
  RefreshTokenPayloadCreate,
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../types/jwt.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: AccessTokenPayloadCreate): string {
    return this.jwtService.sign(
      { ...payload, uuild: uuidv4() },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256' as Algorithm,
      },
    );
  }

  //Them uuid de tranh trung token khi tao token lien tuc
  signRefreshToken(payload: RefreshTokenPayloadCreate): string {
    return this.jwtService.sign(
      { ...payload, uuild: uuidv4() },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256' as Algorithm,
      },
    );
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }
}
