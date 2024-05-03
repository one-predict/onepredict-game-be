import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  fid: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  balance: number;

  @Prop()
  name: string;

  @Prop()
  imageUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
