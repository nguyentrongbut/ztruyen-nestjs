// ** Class Validator
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Optional } from '@nestjs/common';

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

  @IsNotEmpty()
  provider: string;
}
