import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ExternalUserType } from '@user/enums';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  externalId: number | string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  externalType: ExternalUserType;

  @Prop({ required: true, type: mongoose.Schema.Types.Number, default: 1000 })
  coinsBalance: number;

  @Prop({ type: mongoose.Schema.Types.String })
  username?: string;

  @Prop({ type: mongoose.Schema.Types.String })
  firstName?: string;

  @Prop({ type: mongoose.Schema.Types.String })
  lastName?: string;

  @Prop({ type: mongoose.Schema.Types.String })
  avatarUrl?: string;

  @Prop({ type: mongoose.Schema.Types.Boolean, default: false })
  onboarded: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ externalId: 1 }, { unique: true });
