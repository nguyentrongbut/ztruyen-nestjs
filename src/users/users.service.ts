// ** NestJs
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// ** DTO
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// ** Schemas
import { User, UserDocument } from './schemas/user.schema';

// ** Soft Delete Plugin
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

// ** Bcryptjs
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  // Auth
  findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({ path: 'role', select: { name: 1, permissions: 1 } });
  }

  findUserByToken(refreshToken: string) {
    return this.userModel.findOne({
      refreshToken,
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  updateUserToken(refreshToken: string, _id: string) {
    return this.userModel.updateOne(
      {
        _id,
      },
      { refreshToken },
    );
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender } = user;
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException('User with email already exists');
    }
    const hashPassword = this.getHashPassword(password);
    const newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      role: 'USER',
    });

    return newRegister;
  }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  // End Auth
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
