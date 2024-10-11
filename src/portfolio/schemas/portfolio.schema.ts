import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DigitalAssetPricePrediction } from '@prediction-game/types';
import { PortfolioResult } from '@portfolio/types';

export type PortfolioDocument = HydratedDocument<Portfolio>;

@Schema({ minimize: false })
export class Portfolio {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: ObjectId;

  @Prop([{ required: true, type: mongoose.Schema.Types.Mixed }])
  predictions: DigitalAssetPricePrediction[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  offer: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  tournament: ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  intervalStartTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  intervalEndTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Boolean })
  isAwarded: boolean;

  @Prop({ type: mongoose.Schema.Types.Date })
  createdAt: Date;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  result?: PortfolioResult;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

PortfolioSchema.index({ user: 1, offer: 1 }, { unique: true });
PortfolioSchema.index(
  { isAwarded: 1, intervalStartTimestamp: 1, intervalEndTimestamp: 1 },
  {
    partialFilterExpression: {
      isAwarded: false,
    },
  },
);
