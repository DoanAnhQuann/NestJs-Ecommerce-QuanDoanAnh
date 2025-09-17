/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { RegisterBodyDTO, RegisterResponseDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { RegisterResType } from './auth.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDTO)
  async register(@Body() body: RegisterBodyDTO): Promise<RegisterResType> {
    const result = await this.authService.register(body);
    return result;
  }

  @Post('login')
  async login(@Body() body: any): Promise<any> {
    const result = await this.authService.login(body);
    return result;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: any): Promise<any> {
    const result = await this.authService.refreshToken(body);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: any): Promise<{ message: string }> {
    const result = await this.authService.logout(body);
    return result;
  }
}
