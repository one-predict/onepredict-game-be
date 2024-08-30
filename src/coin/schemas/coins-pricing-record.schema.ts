import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Coin } from '@coin/enums';

export type CoinsPricingRecordDocument = HydratedDocument<CoinsPricingRecord>;

@Schema({ collection: 'coins_pricing_record', minimize: false })
export class CoinsPricingRecord {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  prices: Record<Coin, number>;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  timestamp: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Boolean, default: false })
  completed: boolean;
}

export const CoinsPricingRecordSchema = SchemaFactory.createForClass(CoinsPricingRecord);

CoinsPricingRecordSchema.index({ timestamp: 1 }, { unique: true });
CoinsPricingRecordSchema.index({ completed: 1, timestamp: 1 });
