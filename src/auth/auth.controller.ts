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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage(AUTH_MESSAGES.LOGIN_SUCCESS)
  @Post('login')
  async handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
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
    return this.authService.socialLogin(
      req.user,
      response,
      ProviderType.GOOGLE,
    );
  }

  @Public()
  @Get('facebook/callback')
  @ResponseMessage(AUTH_MESSAGES.SOCIAL_LOGIN_SUCCESS)
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(@Req() req, @Res() res: Response) {
    return this.authService.socialLogin(req.user, res, ProviderType.FACEBOOK);
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
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @Post('/logout')
  @ResponseMessage(AUTH_MESSAGES.LOGOUT_SUCCESS)
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
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
