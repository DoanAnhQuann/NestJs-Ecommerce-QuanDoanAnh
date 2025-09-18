/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
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

    return verificationCode;
  }

  async login(body: any): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Account does not exist');
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
    const { accessToken, refreshToken } = await this.generateTokens({
      userId: user.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(payload: {
    userId: number;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId: payload.userId }),
      this.tokenService.signRefreshToken({ userId: payload.userId }),
    ]);
    // const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
    // await this.prismaService.refreshToken.create({
    //   data: {
    //     token: refreshToken,
    //     userId: payload.userId,
    //     expiresAt: new Date(decoded.exp * 1000),
    //   },
    // });
    return { accessToken, refreshToken };
  }

  async refreshToken(payload: { refreshToken: string }) {
    try {
      //1 Kiểm tra refresh token có hợp lệ hay không
      const decoded = await this.tokenService.verifyRefreshToken(
        payload.refreshToken,
      );

      //2 Kiểm tra refresh token có tồn tại trong db hay không
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: payload.refreshToken,
        },
      });

      //3. Xóa refreshToken cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: payload.refreshToken,
        },
      });

      //4. Tạo mới cặp access token và refresh token
      const { accessToken, refreshToken } = await this.generateTokens({
        userId: decoded.userId,
      });
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Trường hợp đã refresh token rồi, hay thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(payload: { refreshToken: string }) {
    try {
      //1 Kiểm tra refresh token có hợp lệ hay không
      await this.tokenService.verifyRefreshToken(payload.refreshToken);

      //2 Xóa refresh token trong db
      await this.prismaService.refreshToken.delete({
        where: {
          token: payload.refreshToken,
        },
      });

      return {
        message: 'Logout successful',
      };
    } catch (error) {
      // Trường hợp đã refresh token rồi, hay thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
