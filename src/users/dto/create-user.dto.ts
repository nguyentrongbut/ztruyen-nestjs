// ** Class Validator
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Optional } from '@nestjs/common';

// ** Enums
import { ProviderType, RoleType } from '../../configs/enums/user.enum';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @Optional()
  age: number;

  @IsEnum(RoleType, {
    message: 'Role must be one of: user, admin, moderator',
  })
  role: RoleType;

  @Optional()
  gender: string;

  @Optional()
  bio?: string;

  @Optional()
  birthday?: Date;
}

export class RegisterUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  gender: string;
}

export class CreateUserSocialDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  avatar: string;

  @IsEnum(ProviderType, {
    message: 'Provider must be one of: local, google, facebook',
  })
  provider: ProviderType;
}
