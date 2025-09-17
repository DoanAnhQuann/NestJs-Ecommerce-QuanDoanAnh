import { Injectable } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RolesService {
  private clientRoleId: number;
  constructor(private prismaService: PrismaService) {}
  async getClientRoleId(): Promise<number> {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }
    try {
      const role = await this.prismaService.role.findFirstOrThrow({
        where: { name: RoleName.Client },
      });
      this.clientRoleId = role.id;
      return role.id;
    } catch (error) {
      throw new Error('Client role not found in the database', error);
    }
  }
}
