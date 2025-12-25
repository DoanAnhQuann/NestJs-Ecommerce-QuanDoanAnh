import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repo';

@Module({
  providers: [PermissionService, PermissionRepository],
  controllers: [PermissionController],
})
export class PermissionModule {}
