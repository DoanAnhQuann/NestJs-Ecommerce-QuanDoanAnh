/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../types/jwt.type';
import { REQUEST } from '@nestjs/core';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

export const ActiveUser = createParamDecorator(
  (field: keyof TokenPayload | undefined, context: ExecutionContext) => {
    console.log('field', field, 'context', context);
    const request = context.switchToHttp().getRequest();
    console.log(request['user']);
    const user: TokenPayload | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
