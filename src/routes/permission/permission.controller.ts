import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import {
  PermissionByIdSchemaResDTO,
  PermissionSchemaParamDTO,
  PermissionSchemaQueryDTO,
  PermissionSchemaReqBodyCreateDTO,
  PermissionSchemaResDTO,
} from './permission.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ZodSerializerDto } from 'nestjs-zod';
import { MessageResDTO } from 'src/shared/dtos/response.dto';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(PermissionSchemaResDTO)
  getAllPermissions(@Query() query: PermissionSchemaQueryDTO) {
    return this.permissionService.getAllPermissions(query);
  }

  @Get('/:permissionId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(PermissionByIdSchemaResDTO)
  getPermissionById(@Param() param: PermissionSchemaParamDTO) {
    return this.permissionService.getPermissionById(param.permissionId);
  }

  @Post('')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(MessageResDTO)
  createPermission(
    @Body() body: PermissionSchemaReqBodyCreateDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.createPermission(body, userId);
  }

  @Put('/:permissionId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(MessageResDTO)
  updatePermission(
    @Param() param: PermissionSchemaParamDTO,
    @Body() body: PermissionSchemaReqBodyCreateDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.updatePermission(
      param.permissionId,
      body,
      userId,
    );
  }

  @Delete('/:permissionId')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(MessageResDTO)
  deletePermission(
    @Param() param: PermissionSchemaParamDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.deletePermission(param.permissionId, userId);
  }
}
