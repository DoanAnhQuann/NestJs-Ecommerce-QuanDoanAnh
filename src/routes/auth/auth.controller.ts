/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import {
  LoginBodyDTO,
  LoginResponseDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResponseDTO,
  SendOTPBodyDTO,
} from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { RegisterResType } from './auth.model';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResponseDTO)
  async register(@Body() body: RegisterBodyDTO): Promise<RegisterResType> {
    const result = await this.authService.register(body);
    return result;
  }

  @Post('send-otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    const result = await this.authService.sendOTP(body);
    return result;
  }

  @Post('login')
  @IsPublic()
  async login(
    @Body() body: LoginBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ): Promise<LoginResponseDTO> {
    const result = await this.authService.login({
      ...body,
      userAgent,
      ip,
    });
    return result;
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(
    @Body() body: RefreshTokenBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ): Promise<any> {
    const result = await this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    });
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    const result = await this.authService.logout(body);
    return result;
  }
}
