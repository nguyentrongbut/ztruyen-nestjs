// ** Class Validator
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Optional } from '@nestjs/common';

// ** Enums
import { ProviderType } from '../../configs/enums/user.enum';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  avatar: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsMongoId()
  role: string;

  @IsNotEmpty()
  @IsString()
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
