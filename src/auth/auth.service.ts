// ** NestJs
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// ** Express
import { Response } from 'express';

// ** Services
import { UsersService } from '../users/users.service';
import { IUser } from '../users/users.interface';

// ** ms
import ms from 'ms';

// ** DTO
import { RegisterUserDto } from '../users/dto/create-user.dto';
import { EmailService } from '../email/email.service';

// ** Utils
import { formatExpireTime } from '../utils/timeFormatter';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(user: IUser, response: Response) {
    const { _id, name, role, email } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refresh_token = await this.createRefreshToken(payload);

    // update refresh token in db
    await this.usersService.updateUserToken(refresh_token, _id);

    // set refresh token in httpOnly cookie
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  }

  async register(user: RegisterUserDto) {
    const newUser = await this.usersService.register(user);
    return {
      _id: newUser._id,
      createdAt: newUser?.createdAt,
    };
  }

  async logout(response: Response, user: IUser) {
    await this.usersService.updateUserToken('', user._id);
    response.clearCookie('refresh_token');
    return 'ok';
  }

  async forgotPassword(email: string) {
    const token = await this.usersService.setResetToken(email);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const user = await this.usersService.findOneByEmail(email);
    const expireTime = formatExpireTime(
      this.configService.get<string>('EMAIL_RESET_PASSWORD_EXPIRE'),
    );

    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.name,
      resetLink,
      expireTime,
    );

    return 'ok';
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.verifyResetToken(token);
    await this.usersService.updatePassword(user._id.toString(), newPassword);
    return 'ok';
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) return user;
    }
    return null;
  }

  async createRefreshToken(payload) {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')) / 1000,
    });
    return refresh_token;
  }

  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      });

      const user = await this.usersService.findUserByToken(refreshToken);

      if (!user) throw new BadRequestException('Refresh token invalid');

      const { _id, name, email, role } = user;
      const payload = {
        sub: 'token refresh',
        iss: 'from server',
        _id,
        name,
        email,
        role,
      };

      const refresh_token = await this.createRefreshToken(payload);

      // update refresh token in db
      await this.usersService.updateUserToken(refresh_token, _id.toString());

      // clear old refresh token in cookie
      response.clearCookie('refresh_token');

      // set refresh token in httpOnly cookie
      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
      });

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          _id,
          name,
          email,
          role,
        },
      };
    } catch (error) {
      throw new BadRequestException('Refresh token invalid');
    }
  }
}
