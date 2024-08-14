import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PortfolioDocument = HydratedDocument<Portfolio>;

export type TokenDirection = 'growth' | 'falling';

export interface SelectedPortfolioToken {
  id: string;
  direction: TokenDirection;
}

const SelectedPortfolioToken = new mongoose.Schema(
  {
    id: { type: String, required: true },
    direction: { type: String, required: true },
  },
  { _id: false },
);

@Schema()
export class Portfolio {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  user: ObjectId;

  @Prop([{ required: true, type: SelectedPortfolioToken }])
  selectedTokens: SelectedPortfolioToken[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  offer: ObjectId;

  @Prop({ required: false, type: mongoose.Schema.Types.Number })
  earnedCoins?: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Boolean })
  isAwarded: boolean;

  @Prop({ type: mongoose.Schema.Types.Date })
  createdAt: Date;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

PortfolioSchema.index({ user: 1, offer: 1 }, { unique: true });
PortfolioSchema.index({ offer: 1 });
PortfolioSchema.index({ isAwarded: 1, offer: 1 });
