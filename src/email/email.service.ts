// ** NestJs
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordEmail(
    to: string,
    username: string,
    resetLink: string,
    expireTime: string,
  ) {
    await this.mailerService.sendMail({
      to,
      from: {
        name: 'ZTruyen',
        address: 'noreply@ztruyen.io.vn',
      },
      subject: '🔐 Yêu cầu đặt lại mật khẩu - ZTruyen',
      template: 'reset-password',
      context: {
        name: username,
        resetLink,
        expireTime,
      },
    });
  }
}
