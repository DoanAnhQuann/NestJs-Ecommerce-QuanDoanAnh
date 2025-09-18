import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/shared/services/prisma.service';
import { UserType } from '../models/share-user.model';

@Injectable()
export class ShareUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserType | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    return user;
  }
}
