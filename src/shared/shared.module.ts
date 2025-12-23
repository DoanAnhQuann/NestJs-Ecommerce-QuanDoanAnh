import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { ShareUserRepository } from './repositories/share-user.repo';
import { SendEmailService } from './services/send-email.service';
import { TwoFactorAuthService } from './services/2fa.service';

const sharedService = [
  PrismaService,
  HashingService,
  TokenService,
  AccessTokenGuard,
  ApiKeyGuard,
  ShareUserRepository,
  SendEmailService,
  TwoFactorAuthService,
];

@Global() //Decorator muốn dùng cho cả app
@Module({
  providers: [
    ...sharedService,
    AccessTokenGuard,
    ApiKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedService, //Để các module khác có thể dùng được service này
  imports: [JwtModule],
})
export class SharedModule {}
