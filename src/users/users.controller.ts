// ** NestJs
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// ** Services
import { UsersService } from './users.service';

// ** DTO
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// ** Decorator
import { ResponseMessage, User } from '../decorator/customize';
import { Roles } from '../decorator/roles.decorator';

// ** Guard
import { RolesGuard } from '../guards/roles.guard';

// ** Interface
import { IUser } from './users.interface';

// ** Messages
import { USERS_MESSAGES } from '../configs/messages/user.message';

// ** Enum
import { RoleType } from '../configs/enums/user.enum';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.CREATE_SUCCESS)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.GET_ALL_SUCCESS)
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+page, +limit, qs);
  }

  @Get('detail/:id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.GET_DETAIL_SUCCESS)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('profile')
  @ResponseMessage(USERS_MESSAGES.GET_PROFILE_SUCCESS)
  findProfile(@User() user: IUser) {
    return this.usersService.findProfile(user);
  }

  @Patch('profile')
  @ResponseMessage(USERS_MESSAGES.UPDATE_PROFILE_SUCCESS)
  updateProfile(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.updateProfile(updateUserDto, user);
  }

  @Patch('update/:id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.UPDATE_SUCCESS)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('delete/:id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.DELETE_SUCCESS)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete('delete-multi')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.DELETE_MULTI_SUCCESS)
  removeMulti(@Body('ids') ids: string[]) {
    return this.usersService.removeMulti(ids);
  }

  @Get('trash')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.GET_TRASH_SUCCESS)
  findDeleted(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() qs: string,
  ) {
    return this.usersService.findDeleted(+page, +limit, qs);
  }

  @Get('trash/:id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.GET_TRASH_DETAIL_SUCCESS)
  findOneDeleted(@Param('id') id: string) {
    return this.usersService.findOneDeleted(id);
  }

  @Delete('trash/delete/:id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.DELETE_SUCCESS)
  hardRemove(@Param('id') id: string) {
    return this.usersService.hardRemove(id);
  }

  @Delete('trash/delete-multi')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.DELETE_MULTI_SUCCESS)
  hardRemoveMulti(@Body('ids') ids: string[]) {
    return this.usersService.hardRemoveMulti(ids);
  }

  @Patch('restore/:id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.RESTORE_SUCCESS)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Patch('restore-multi')
  @Roles(RoleType.ADMIN)
  @ResponseMessage(USERS_MESSAGES.RESTORE_MULTI_SUCCESS)
  restoreMulti(@Body('ids') ids: string[]) {
    return this.usersService.restoreMulti(ids);
  }
}
