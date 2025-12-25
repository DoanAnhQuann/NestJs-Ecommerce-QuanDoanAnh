import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  PermissionTypeQuery,
  PermissionTypeReqBodyCreate,
} from './permission.model';
import { PermissionRepository } from './permission.repo';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepository) {}

  getAllPermissions(query: PermissionTypeQuery) {
    return this.permissionRepo.findAll(query);
  }

  async getPermissionById(permissionId: number) {
    const permission = await this.permissionRepo.findById(permissionId);

    if (!permission) {
      throw new UnauthorizedException('Permission not found');
    }
    return permission;
  }

  async createPermission(body: PermissionTypeReqBodyCreate, userId: number) {
    const isAlreadyExist = await this.permissionRepo.findByPathAndMethod(
      body.path,
      body.method,
    );

    if (isAlreadyExist) {
      throw new UnauthorizedException(
        'Permission with this path and method already exists',
      );
    }

    const permission = await this.permissionRepo.create(body, userId);

    if (!permission) {
      throw new UnauthorizedException('Failed to create permission');
    }

    return {
      message: 'Permission created successfully',
    };
  }

  async updatePermission(
    permissionId: number,
    body: PermissionTypeReqBodyCreate,
    userId: number,
  ) {
    const isAlreadyExist = await this.permissionRepo.findById(permissionId);

    if (!isAlreadyExist) {
      throw new UnauthorizedException(
        'Permission with this ID does not already exists',
      );
    }

    const isAlreadyPathAndMethodExist =
      await this.permissionRepo.findByPathAndMethod(body.path, body.method);

    if (isAlreadyPathAndMethodExist) {
      throw new UnauthorizedException(
        'Permission with this path and method already exists',
      );
    }

    const permission = await this.permissionRepo.update(
      permissionId,
      body,
      userId,
    );

    if (!permission) {
      throw new UnauthorizedException('Failed to update permission');
    }

    return {
      message: 'Permission updated successfully',
    };
  }

  async deletePermission(permissionId: number, userId: number) {
    const isAlreadyExist = await this.permissionRepo.findById(permissionId);

    if (!isAlreadyExist) {
      throw new UnauthorizedException(
        'Permission with this ID does not already exists',
      );
    }

    const permission = await this.permissionRepo.delete(permissionId, userId);

    if (!permission) {
      throw new UnauthorizedException('Failed to delete permission');
    }

    return {
      message: 'Permission deleted successfully',
    };
  }
}
