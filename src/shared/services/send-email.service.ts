import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Resend } from 'resend';
import envConfig from '../config';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
@Injectable()
export class SendEmailService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(envConfig.RESEND_KEY);
  }

  private async renderTemplate(filename: string, data: Record<string, any>) {
    const filePath = join('src/shared/templates', filename);
    const source = await fs.readFile(filePath, 'utf8');
    const template = Handlebars.compile(source);
    return template(data);
  }

  async sendEmail(code: string, email: string[]) {
    const html = await this.renderTemplate('send-email.html', { code });
    const { error } = await this.resend.emails.send({
      from: 'QuanDoanAnh <no-reply@daquan.io.vn>',
      to: email,
      subject: 'Mã OTP của bạn!',
      html: html,
    });

    if (error) {
      throw new UnauthorizedException({
        message: 'There was an error sending the email',
        error: error,
        path: 'otp',
      });
    }

    return html;
  }
}
