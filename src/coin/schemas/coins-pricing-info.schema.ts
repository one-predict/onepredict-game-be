import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Coin } from '@coin/enums';

export type CoinsPricingInfoDocument = HydratedDocument<CoinsPricingInfo>;

export type CoinsPricingDetails = Record<
  Coin,
  {
    price: number;
    percentChange24h: number;
    percentChange1h: number;
    lastUpdateTimestamp: number;
  }
>;

@Schema({ collection: 'coins_pricing_info', minimize: false })
export class CoinsPricingInfo {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  pricingDetails: CoinsPricingDetails;

  @Prop({ required: true, type: mongoose.Schema.Types.Date })
  updatedAt: Date;
}

export const CoinsPricingInfoSchema = SchemaFactory.createForClass(CoinsPricingInfo);
