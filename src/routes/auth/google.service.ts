/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { GoogleAuthStateType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { RolesService } from './roles.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;
  constructor(
    private authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    // Chuyển object sang string sang base64 an toàn và bỏ lên url
    const stateString = Buffer.from(
      JSON.stringify({
        userAgent,
        ip,
      }),
    ).toString('base64');

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: stateString,
    });

    return { url };
  }

  async handleGoogleCallback(code: string, state: string) {
    // Giải mã state từ base64 về object
    try {
      let userAgent = 'Unknown';
      let ip = 'Unknown';

      // Lấy state url
      try {
        if (state) {
          const clientInfo = JSON.parse(
            Buffer.from(state, 'base64').toString('utf-8'),
          ) as GoogleAuthStateType;
          userAgent = clientInfo.userAgent;
          ip = clientInfo.ip;
        }
      } catch (error) {
        console.error('Failed to parse state:', error);
      }

      //Dùng code lấy token
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Lấy thông tin user từ google
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();
      if (!data.email) {
        throw new Error('Không thể lấy thông tin người dùng từ google!');
      }

      let user = await this.authRepository.findUserByEmail(data.email);

      //Nếu không có user là người mới tiến hành đki

      if (!user) {
        const randomPassword = uuidv4();
        const hashedPassword = await this.hashingService.hash(randomPassword);
        const clientRoleId = await this.rolesService.getClientRoleId();
        user = await this.authRepository.createUser({
          email: data.email,
          name: data.name ?? 'No Name',
          phoneNumber: '',
          password: hashedPassword,
          roleId: clientRoleId,
          avatar: data.picture ?? null,
        });
      }
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      const { accessToken, refreshToken } =
        await this.authService.generateTokens({
          userId: user.id,
          roleId: user.roleId,
          deviceId: device.id,
        });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      throw new Error('Đăng nhập bằng Google thất bại');
    }
  }
}
