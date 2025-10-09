// ** NestJs
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ** Passport
import { ExtractJwt, Strategy } from 'passport-jwt';

// ** Interfaces
import { IUser } from '../../../users/users.interface';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN'),
    });
  }

  async validate(payload: IUser) {
    const { _id } = payload;

    const user = await this.usersService.findOne(_id);

    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('User has been deleted or banned!');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
