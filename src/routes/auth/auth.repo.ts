import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  DeviceType,
  RefreshTokenType,
  RegisterBodyType,
  RegisterResType,
  VerificationBodyType,
} from './auth.model';
import { UserType } from 'src/shared/models/share-user.model';
import { VerificationCodeType } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    data: Omit<RegisterBodyType, 'confirmPassword' | 'otp'> &
      Pick<UserType, 'roleId'>,
  ): Promise<RegisterResType> {
    const user = await this.prismaService.user.create({
      data,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
    return user;
  }

  async createVerificationCode(
    payload: Pick<
      VerificationBodyType,
      'email' | 'code' | 'type' | 'expiresAt'
    >,
  ): Promise<VerificationBodyType> {
    const verificationCode = await this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
    return verificationCode;
  }

  async findVerificationCodeByEmail(
    email: string,
    otp: string,
    type: VerificationCodeType,
  ): Promise<VerificationBodyType | null> {
    const verificationCode =
      await this.prismaService.verificationCode.findUnique({
        where: {
          email,
          code: otp,
          type,
        },
      });
    return verificationCode;
  }

  async createRefreshToken(data: {
    token: string;
    userId: number;
    expiresAt: Date;
    deviceId: number;
  }) {
    return this.prismaService.refreshToken.create({
      data,
    });
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'ip' | 'userAgent'> &
      Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({
      data,
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueObject: {
    token: string;
  }): Promise<(RefreshTokenType & { user: UserType & { role: any } }) | null> {
    return this.prismaService.refreshToken.findUnique({
      where: uniqueObject,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async updateDevice(deviceId: number, data: Partial<DeviceType>) {
    return this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    });
  }

  async deleteRefreshToken(uniqueObject: {
    token: string;
  }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where: uniqueObject,
    });
  }
}
