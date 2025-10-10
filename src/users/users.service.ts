// ** NestJs
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// ** Api Query Params
import aqp from 'api-query-params';

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

// ** Mongoose
import mongoose from 'mongoose';

// ** Interface
import { IUser } from './users.interface';

// ** Message
import { USERS_MESSAGES } from '../configs/messages/user.message';

// ** utils
import { validateMongoId, validateMongoIds } from '../utils/mongoose.util';

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

  private async ensureNotDeleted(_id: string) {
    validateMongoId(_id);
    const user = await this.userModel.findById(_id).select('isDeleted').lean();
    if (!user || user.isDeleted) {
      throw new BadRequestException(USERS_MESSAGES.DELETED_OR_BANNED);
    }
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
    return this.userModel.findOne({ refreshToken });
  }

  async register(user: RegisterUserDto) {
    const { email, password } = user;

    // check email exists
    if (await this.userModel.findOne({ email })) {
      throw new BadRequestException(USERS_MESSAGES.EMAIL_EXISTED);
    }

    const hash = this.getHashPassword(password);
    return this.userModel.create({ ...user, password: hash });
  }

  // forgot password
  async setResetToken(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) throw new BadRequestException(USERS_MESSAGES.USER_NOT_FOUND);

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
      throw new BadRequestException(USERS_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
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
    return this.userModel.create(createUserSocialDto);
  }

  // Profile
  async findProfile(user: IUser) {
    await this.ensureNotDeleted(user._id);
    return this.userModel
      .findById(user._id)
      .select('-password -refreshToken -isDeleted -deletedAt');
  }

  async updateProfile(updateUserDto: UpdateUserDto, user: IUser) {
    await this.ensureNotDeleted(user._id);
    return this.userModel.updateOne({ _id: user._id }, updateUserDto);
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

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  };

  // End Auth

  // CRUD
  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    // check email exists
    if (await this.userModel.findOne({ email })) {
      throw new BadRequestException(USERS_MESSAGES.EMAIL_EXISTED);
    }

    const hashPassword = this.getHashPassword(password);

    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    const offset = (+page - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password -refreshToken -isDeleted')
      .exec();

    return {
      meta: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    await this.ensureNotDeleted(id);

    return this.userModel
      .findOne({
        _id: id,
      })
      .select('-password -refreshToken -isDeleted');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.ensureNotDeleted(id);
    return this.userModel.updateOne({ _id: id }, { updateUserDto });
  }

  async remove(id: string) {
    await this.ensureNotDeleted(id);
    return this.userModel.softDelete({ _id: id });
  }

  async removeMulti(ids: string[]) {
    validateMongoIds(ids);
    const users = await this.userModel.find({
      _id: { $in: ids },
      isDeleted: { $ne: true },
    });
    if (!users.length)
      throw new BadRequestException(USERS_MESSAGES.NO_ELIGIBLE);
    return this.userModel.softDelete({ _id: { $in: users.map((u) => u._id) } });
  }

  // End CRUD

  // Trash
  async findDeleted(page: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    filter.isDeleted = true;

    const offset = (+page - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password -refreshToken -isDeleted')
      .exec();

    return {
      meta: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      result,
    };
  }

  async findOneDeleted(id: string) {
    validateMongoId(id);
    return this.userModel.findById(id).select('-password -refreshToken -isDeleted');
  }

  async hardRemove(id: string) {
    validateMongoId(id);
    return this.userModel.deleteOne({ _id: id });
  }

  async hardRemoveMulti(ids: string[]) {
    validateMongoIds(ids);
    const users = await this.userModel.find({
      _id: { $in: ids },
      isDeleted: true,
    });
    if (!users.length)
      throw new BadRequestException(USERS_MESSAGES.NO_ELIGIBLE);
    return this.userModel.deleteMany({ _id: { $in: users.map((u) => u._id) } });
  }

  async restore(id: string) {
    validateMongoId(id);
    return this.userModel.restore({ _id: id });
  }

  async restoreMulti(ids: string[]) {
    validateMongoIds(ids);
    return this.userModel.restore({ _id: { $in: ids } });
  }

  // End Trash
}
