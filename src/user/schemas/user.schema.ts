import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ExternalUserType } from "@auth/enums";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  externalId: number | string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  externalType: ExternalUserType;

  @Prop({ required: true, type: mongoose.Schema.Types.Number, default: 1000 })
  coinsBalance: number;

  @Prop()
  username?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ externalId: 1 }, { unique: true });
