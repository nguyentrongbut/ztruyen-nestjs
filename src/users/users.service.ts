// ** NestJs
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// ** DTO
import {
  CreateUserDto,
  CreateUserSocialDto,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// ** Schemas
import { User, UserDocument } from './schemas/user.schema';

// ** Soft Delete Plugin
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

// ** Bcryptjs
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

// ** Crypto
import { randomBytes } from 'crypto';

// ** ms
import ms from 'ms';

@Injectable()
export class UsersService {
  private readonly emailExpire: string;

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly configService: ConfigService,
  ) {
    this.emailExpire = this.configService.get<string>(
      'EMAIL_RESET_PASSWORD_EXPIRE',
    );
  }

  // Auth
  findOneByEmail(email: string) {
    return this.userModel
      .findOne({
        email,
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
    });

    return newRegister;
  }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  // forgot password
  async setResetToken(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(
      Date.now() +
        ms(this.configService.get<string>('EMAIL_RESET_PASSWORD_EXPIRE')),
    );
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();
    return token;
  }

  async verifyResetToken(token: string) {
    const user = await this.userModel.findOne({ resetToken: token });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    return user;
  }

  async updatePassword(userId: string, password: string) {
    const hashed = this.getHashPassword(password);
    return this.userModel.findByIdAndUpdate(userId, {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }

  async createUserSocial(createUserSocialDto: CreateUserSocialDto) {
    const newSocial = await this.userModel.create({
      ...createUserSocialDto,
    });

    return newSocial;
  }

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
