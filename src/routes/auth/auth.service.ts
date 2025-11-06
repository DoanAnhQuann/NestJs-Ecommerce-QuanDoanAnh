/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { generateOTP, isNotFoundError } from 'src/shared/helper';
import { RolesService } from './roles.service';
import {
  LoginBodyType,
  LoginResType,
  RegisterBodyType,
  RegisterResType,
  SendOTPBodyType,
} from './auth.model';
import { AuthRepository } from './auth.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { addMilliseconds } from 'date-fns';
import envConfig from 'src/shared/config';
import ms from 'ms';
import { VerificationCodeType } from '@prisma/client';
import { SendEmailService } from 'src/shared/services/send-email.service';
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly sendEmail: SendEmailService,
  ) {}
  async register(body: RegisterBodyType): Promise<RegisterResType> {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const roleId = await this.rolesService.getClientRoleId();
      const isEmailExist = await this.shareUserRepository.findUserByEmail(
        body.email,
      );
      if (isEmailExist) {
        throw new ConflictException('Email already exists');
      }

      const codeByEmail = await this.authRepository.findVerificationCodeByEmail(
        body.email,
        body.otp,
        VerificationCodeType.REGISTER,
      );

      if (codeByEmail?.code !== body.otp) {
        throw new UnprocessableEntityException([
          {
            message: 'OTP is incorrect',
            path: 'code',
          },
        ]);
      }

      if (codeByEmail?.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'OTP has expired',
            path: 'code',
          },
        ]);
      }

      const user = await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId,
      });

      return user;
    } catch (error) {
      console.error('Có lỗi xảy ra khi đăng kí!', error);
      throw error;
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // Kiểm tra email có tồn tại trong hệ thống không
    const isEmailExist = await this.shareUserRepository.findUserByEmail(
      body.email,
    );
    console.log(body.email);
    if (isEmailExist) {
      throw new ConflictException('Email already exists');
    }

    //Tạo mã otp
    const code = generateOTP();
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: 'REGISTER',
      expiresAt: addMilliseconds(
        new Date(),
        ms(envConfig.OTP_EXPIRES_IN as ms.StringValue),
      ),
    });
    const sendEmail = await this.sendEmail.sendEmail(verificationCode.code, [
      'doananhquan12e.vanlang@gmail.com',
    ]);

    console.log(sendEmail);

    return {
      message: `Send OTP successfully to ${body.email}`,
    };
  }

  async login(
    body: LoginBodyType & { userAgent: string; ip: string },
  ): Promise<LoginResType> {
    const user = await this.shareUserRepository.findUserByEmail(body.email);

    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email does not exist',
          path: 'email',
        },
      ]);
    }

    const isPasswordValid = await this.hashingService.compare(
      body.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException([
        {
          field: 'password',
          message: 'Password is incorrect',
        },
      ]);
    }
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    });

    const { accessToken, refreshToken } = await this.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      deviceId: device.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(
    payload: AccessTokenPayloadCreate,
  ): Promise<LoginResType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: payload.userId,
        roleId: payload.roleId,
        deviceId: payload.deviceId,
      }),
      this.tokenService.signRefreshToken({
        userId: payload.userId,
      }),
    ]);
    const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decoded.exp * 1000),
      deviceId: payload.deviceId,
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(payload: {
    refreshToken: string;
    userAgent: string;
    ip: string;
  }) {
    try {
      //1 Kiểm tra refresh token có hợp lệ hay không
      const decoded = await this.tokenService.verifyRefreshToken(
        payload.refreshToken,
      );

      //2 Kiểm tra refresh token có tồn tại trong db hay không
      const refreshTokenInDB =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
          token: payload.refreshToken,
        });

      if (!refreshTokenInDB) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      const {
        deviceId,
        user: { roleId },
      } = refreshTokenInDB;

      //3 Cập nhật lại device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip: payload.ip,
        userAgent: payload.userAgent,
      });

      //4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: payload.refreshToken,
      });

      //5. Tạo mới cặp access token và refresh token
      const $token = this.generateTokens({
        userId: decoded.userId,
        roleId,
        deviceId,
      });

      const [, , tokens] = await Promise.all([
        $updateDevice,
        $deleteRefreshToken,
        $token,
      ]);
      return tokens;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token', error);
    }
  }

  async logout(payload: { refreshToken: string }) {
    try {
      //1 Kiểm tra refresh token có hợp lệ hay không
      await this.tokenService.verifyRefreshToken(payload.refreshToken);

      //2 Xóa refresh token trong db
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: payload.refreshToken,
      });

      //3. Cập nhật device là đã logout
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      });
      return {
        message: 'Logout successful',
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
