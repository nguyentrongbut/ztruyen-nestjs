// ** class-validator
import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

// ** Configs
import { ProviderType, RoleType } from '../../configs/enums/user.enum';

export class ImportUserDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password?: string;

  @IsOptional()
  age?: number;

  @IsOptional()
  gender?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @IsOptional()
  @IsEnum(ProviderType)
  provider?: ProviderType;

  @IsOptional()
  birthday?: Date;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  avatar_frame?: string;

  @IsOptional()
  cover?: string;
}
