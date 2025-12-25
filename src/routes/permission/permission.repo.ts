import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  PermissionTypeQuery,
  PermissionTypeReqBodyCreate,
} from './permission.model';
import { HTTPMethod } from '@prisma/client';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(panigation: PermissionTypeQuery) {
    const { page, limit } = panigation;
    const skip = (page - 1) * limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  findById(permissionId: number) {
    return this.prismaService.permission.findFirst({
      where: {
        id: permissionId,
        deletedAt: null,
      },
    });
  }

  create(body: PermissionTypeReqBodyCreate, userId: number) {
    return this.prismaService.permission.create({
      data: {
        ...body,
        createdById: userId,
      },
    });
  }

  update(
    permissionId: number,
    body: PermissionTypeReqBodyCreate,
    userId: number,
  ) {
    return this.prismaService.permission.update({
      where: {
        id: permissionId,
        deletedAt: null,
      },
      data: {
        ...body,
        updatedById: userId,
      },
    });
  }

  delete(permissionId: number, userId: number, isHardDelete?: boolean) {
    return isHardDelete
      ? this.prismaService.permission.update({
          where: {
            id: permissionId,
          },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        })
      : this.prismaService.permission.delete({
          where: {
            id: permissionId,
          },
        });
  }

  findByPathAndMethod(path: string, method: HTTPMethod) {
    return this.prismaService.permission.findFirst({
      where: {
        path,
        method,
        deletedAt: null,
      },
    });
  }
}
