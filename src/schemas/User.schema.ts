import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DEFAULT_AVATAR_URL } from 'src/constants/defaultAvatarURL';

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, default: DEFAULT_AVATAR_URL })
  avatarURL: string;

  @Prop({ required: false, default: '' })
  token: '' | string;
}

export const UserSchema = SchemaFactory.createForClass(User);
