// ** NestJs
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ** Send grid
import sgMail from '@sendgrid/mail';

// ** Pug
import pug from 'pug';

// ** Path
import { join } from 'path';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  private renderTemplate(templateName: string, context: any) {
    const templatePath = join(
      process.cwd(),
      'src/email/templates',
      `${templateName}.pug`,
    );
    return pug.renderFile(templatePath, context);
  }

  async sendResetPasswordEmail(
    to: string,
    username: string,
    resetLink: string,
    expireTime: string,
  ) {
    const html = this.renderTemplate('reset-password', {
      name: username,
      resetLink,
      expireTime,
    });

    await sgMail.send({
      to,
      from: this.configService.get<string>('SENDGRID_FROM_EMAIL'),
      subject: '🔐 Yêu cầu đặt lại mật khẩu - ZTruyen',
      html,
    });
  }
}
