// ** Class Validator
import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  avatar: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  @IsMongoId()
  role: string;

  @IsNotEmpty()
  gender: string;
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
