import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  RegisterBodyType,
  RegisterResType,
  VerificationBodyType,
} from './auth.model';
import { UserType } from 'src/shared/models/share-user.model';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    data: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
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
}
