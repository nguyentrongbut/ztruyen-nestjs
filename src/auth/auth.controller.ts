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

// ** Interface
import { IUser } from '../users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successful')
  @Post('login')
  async handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ResponseMessage('Google authentication successful')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ResponseMessage('Google login successful')
  async googleAuthRedirect(@Req() req, @Res() response: Response) {
    return this.authService.googleLogin(req.user, response);
  }

  @Public()
  @ResponseMessage('Registration successful')
  @Post('register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @ResponseMessage('Get new refresh token successful')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('Logout successful')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }

  @Public()
  @Post('forgot-password')
  @ResponseMessage('Please check your email to reset your password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @ResponseMessage('Password reset successfully')
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
