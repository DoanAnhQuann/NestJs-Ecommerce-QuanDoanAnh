import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RegisterBodyType, RegisterResType, UserType } from './auth.model';

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
}
