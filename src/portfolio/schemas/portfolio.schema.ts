import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '@user/schemas';
import { PortfolioOffer } from './portfolio-offer.schema';

export type PortfolioDocument = HydratedDocument<Portfolio>;

@Schema()
export class Portfolio {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: ObjectId;

  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  selectedTokens: string[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PortfolioOffer.name,
  })
  offer: ObjectId;

  @Prop({ required: false, type: mongoose.Schema.Types.Number })
  earnedPoints?: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Boolean })
  isAwarded: boolean;

  @Prop({ type: mongoose.Schema.Types.Date })
  createdAt: Date;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

PortfolioSchema.index({ user: 1, offer: 1 }, { unique: true });
PortfolioSchema.index({ offer: 1 });
PortfolioSchema.index({ isAwarded: 1, offer: 1 });
