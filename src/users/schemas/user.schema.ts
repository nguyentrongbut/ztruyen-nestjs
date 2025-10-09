// ** NestJS
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// ** Mongoose
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: null })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  bio: string;

  @Prop()
  avatar: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  birthday: Date;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: 'local' })
  provider: string;

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
