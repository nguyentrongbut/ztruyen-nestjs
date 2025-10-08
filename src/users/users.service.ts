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
import { IUser } from './users.interface';

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

  async findProfile(user: IUser) {
    const alreadyDeleted = await this.isDeleted(user._id);

    if (alreadyDeleted) {
      throw new BadRequestException('User already deleted');
    }

    return this.userModel
      .findOne({ _id: user._id })
      .select('-password -deletedBy -refreshToken -isDeleted -deletedAt');
  }

  async updateProfile(updateUserDto: UpdateUserDto, user: IUser) {
    const alreadyDeleted = await this.isDeleted(user._id);

    if (alreadyDeleted) {
      throw new BadRequestException('User already deleted');
    }

    const updated = await this.userModel.updateOne(
      {
        _id: user._id,
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
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

  // Check soft delete
  async isDeleted(_id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new NotFoundException('Not found User!');
    const deletedUser = await this.userModel
      .findOne({
        _id,
        isDeleted: true,
      })
      .select('_id');

    return !!deletedUser;
  }

  // End Check soft delete

  // CRUD
  async create(createUserDto: CreateUserDto, user: IUser) {
    const { email, password } = createUserDto;

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException('User with email already exists');
    }

    const hashPassword = this.getHashPassword(password);

    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
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
    const alreadyDeleted = await this.isDeleted(id);

    if (alreadyDeleted) {
      throw new BadRequestException('User already deleted');
    }

    return this.userModel
      .findOne({
        _id: id,
      })
      .select('-password -refreshToken -isDeleted');
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    const alreadyDeleted = await this.isDeleted(id);

    if (alreadyDeleted) {
      throw new BadRequestException('User already deleted');
    }

    const updated = await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new NotFoundException('Invalid User ID!');

    // Check soft deleted ?
    const alreadyDeleted = await this.isDeleted(id);

    if (alreadyDeleted) {
      throw new BadRequestException('User already deleted');
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: { _id: user._id, email: user.email },
      },
    );

    return this.userModel.softDelete({ _id: id });
  }

  async removeMulti(ids: string[], user: IUser) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No user IDs provided');
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid user IDs: ${invalidIds.join(', ')}`,
      );
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const notDeletedUsers = await this.userModel
      .find({ _id: { $in: objectIds }, isDeleted: { $ne: true } })
      .select('_id');

    const validIds = notDeletedUsers.map((u) => u._id);
    if (validIds.length === 0) {
      throw new BadRequestException('No users are eligible for soft delete');
    }

    await this.userModel.updateMany(
      { _id: { $in: validIds } },
      {
        $set: {
          deletedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      },
    );

    return this.userModel.softDelete({ _id: { $in: validIds } });
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new NotFoundException('Not found User!');

    return this.userModel
      .findOne({
        _id: id,
      })
      .select('-password -refreshToken -isDeleted');
  }

  async hardRemove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid User ID!');
    }

    const alreadyDeleted = await this.isDeleted(id);
    if (!alreadyDeleted) {
      throw new BadRequestException("Don't have id");
    }

    return this.userModel.deleteOne({ _id: id });
  }

  async hardRemoveMulti(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No user IDs provided');
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid user IDs: ${invalidIds.join(', ')}`,
      );
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const deletedUsers = await this.userModel
      .find({ _id: { $in: objectIds }, isDeleted: true })
      .select('_id');

    const validIds = deletedUsers.map((u) => u._id);
    if (validIds.length === 0) {
      throw new BadRequestException('No users are eligible for hard delete');
    }

    return this.userModel.deleteMany({ _id: { $in: validIds } });
  }

  async restore(id: string) {
    return this.userModel.restore({ _id: id });
  }

  async restoreMulti(ids: string[]) {
    return this.userModel.restore({ _id: { $in: ids } });
  }

  // End Trash
}
