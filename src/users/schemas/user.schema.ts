// ** NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// ** Mongoose
import { HydratedDocument } from 'mongoose';

// ** Enums
import { ProviderType, RoleType } from '../../configs/enums/user.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: null })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  cover: string;

  @Prop()
  bio: string;

  @Prop()
  avatar: string;

  @Prop()
  avatar_frame: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  birthday: Date;

  @Prop({
    type: String,
    enum: RoleType,
    default: RoleType.USER,
  })
  role: RoleType;

  @Prop({
    type: String,
    enum: Object.values(ProviderType),
    default: ProviderType.LOCAL,
  })
  provider: ProviderType;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiry?: Date;

  @Prop()
  refreshToken: string;

  @Prop()
  deletedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
