// ** NestJs
import { ConfigService } from '@nestjs/config';

// ** Express
import { Response, Request } from 'express';

// ** Controllers
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

// ** Services
import { AuthService } from './auth.service';

// ** DTO
import { RegisterUserDto } from '../users/dto/create-user.dto';

// ** Decorators
import { Public, ResponseMessage, User } from '../decorator/customize';

// ** Guards
import { LocalAuthGuard } from './passport/guards/local-auth.guard';

import { GoogleAuthGuard } from './passport/guards/google-auth.guard';
import { FacebookAuthGuard } from './passport/guards/facebook-auth.guard';

// ** Interface
import { IUser } from '../users/users.interface';

// ** Messages
import { AUTH_MESSAGES } from '../configs/messages/auth.message';

// ** Enums
import { ProviderType } from '../configs/enums/user.enum';

// ** ms
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage(AUTH_MESSAGES.LOGIN_SUCCESS)
  @Post('login')
  async handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refresh_token, user } = await this.authService.login(
      req.user,
    );

    // save refresh token in cookie
    response.cookie('ZTC_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return { access_token: accessToken, user };
  }

  @Public()
  @Get('google')
  @ResponseMessage(AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS)
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Public()
  @Get('facebook')
  @ResponseMessage(AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS)
  @UseGuards(FacebookAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async login() {}

  @Public()
  @Get('google/callback')
  @ResponseMessage(AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS)
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() response: Response) {
    const { refreshToken, redirectUrl } = await this.authService.socialLogin(
      req.user,
      ProviderType.GOOGLE,
    );

    // save refresh token in cookie
    response.cookie('ZTC_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return response.redirect(redirectUrl);
  }

  @Public()
  @Get('facebook/callback')
  @ResponseMessage(AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS)
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(@Req() req, @Res() response: Response) {
    const { refreshToken, redirectUrl } = await this.authService.socialLogin(
      req.user,
      ProviderType.FACEBOOK,
    );

    // save refresh token in cookie
    response.cookie('ZTC_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return response.redirect(redirectUrl);
  }

  @Public()
  @Post('register')
  @ResponseMessage(AUTH_MESSAGES.REGISTRATION_SUCCESS)
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage(AUTH_MESSAGES.REFRESH_TOKEN_SUCCESS)
  async handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['ZTC_token'];
    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await this.authService.processNewToken(refreshToken);

    response.cookie('ZTC_token', newRefreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')),
    });

    return { access_token: accessToken, user };
  }

  @Post('/logout')
  @ResponseMessage(AUTH_MESSAGES.LOGOUT_SUCCESS)
  async handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    await this.authService.logout(user);
    response.clearCookie('ZTC_token');
    return 'ok';
  }

  @Public()
  @Post('forgot-password')
  @ResponseMessage(AUTH_MESSAGES.FORGOT_PASSWORD)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @ResponseMessage(AUTH_MESSAGES.RESET_PASSWORD_SUCCESS)
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
