import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  externalId: number | string;

  @Prop({ required: true, type: mongoose.Schema.Types.Number, default: 1000 })
  coinsBalance: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Number, default: 0 })
  totalEarnedCoins: number;

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, default: null })
  referrer?: ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ externalId: 1 }, { unique: true });
