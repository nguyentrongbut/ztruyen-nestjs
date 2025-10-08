// ** NestJs
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

// ** Services
import { UsersService } from './users.service';

// ** DTO
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from '../decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @ResponseMessage('Get all users successfully')
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Get detail user successfully')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('profile')
  @ResponseMessage('Get profile successfully')
  getProfile(@User() user: IUser) {
    return this.usersService.getProfile(user);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật người dùng thành công.')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xoá người dùng thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Post('delete-multi')
  @ResponseMessage('Xoá nhiều người dùng thành công!')
  removeMulti(@Body('ids') ids: string[], @User() user: IUser) {
    return this.usersService.removeMulti(ids, user);
  }
}
