import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  fid: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number, default: 1000 })
  balance: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number, default: 0 })
  points: number;

  @Prop()
  name: string;

  @Prop()
  imageUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ fid: 1 }, { unique: true });
UserSchema.index({ points: -1, _id: 1 });
