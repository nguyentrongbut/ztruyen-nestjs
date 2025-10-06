// ** NestJs
import { OmitType } from '@nestjs/mapped-types';

// ** Dto
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  _id: string;
}
