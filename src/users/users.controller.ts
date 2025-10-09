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
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
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

  @Get('detail/:id')
  @ResponseMessage('Get detail user successfully')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('profile')
  @ResponseMessage('Get profile successfully')
  findProfile(@User() user: IUser) {
    return this.usersService.findProfile(user);
  }

  @Patch('profile')
  @ResponseMessage('Update profile successfully')
  updateProfile(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.updateProfile(updateUserDto, user);
  }

  @Patch('update/:id')
  @ResponseMessage('Cập nhật người dùng thành công.')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('delete/:id')
  @ResponseMessage('Xoá người dùng thành công!')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete('delete-multi')
  @ResponseMessage('Xoá nhiều người dùng thành công!')
  removeMulti(@Body('ids') ids: string[]) {
    return this.usersService.removeMulti(ids);
  }

  @Get('trash')
  @ResponseMessage('Get list trash successfully')
  findDeleted(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() qs: string,
  ) {
    return this.usersService.findDeleted(+page, +limit, qs);
  }

  @Get('trash/:id')
  @ResponseMessage('Get detail trash successfully')
  findOneDeleted(@Param('id') id: string) {
    return this.usersService.findOneDeleted(id);
  }

  @Delete('trash/delete/:id')
  @ResponseMessage('Delete user successfully')
  hardRemove(@Param('id') id: string) {
    return this.usersService.hardRemove(id);
  }

  @Delete('trash/delete-multi')
  @ResponseMessage('Delete multi user successfully')
  hardRemoveMulti(@Body('ids') ids: string[]) {
    return this.usersService.hardRemoveMulti(ids);
  }

  @Patch('restore/:id')
  @ResponseMessage('Restore user successfully')
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Patch('restore-multi')
  @ResponseMessage('Restore user successfully')
  restoreMulti(@Body('ids') ids: string[]) {
    return this.usersService.restoreMulti(ids);
  }
}
