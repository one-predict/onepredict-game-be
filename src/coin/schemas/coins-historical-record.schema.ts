import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Coin } from '@coin/enums';

export type CoinsHistoricalRecordDocument = HydratedDocument<CoinsHistoricalRecord>;

@Schema({ collection: 'coins_historical_records', minimize: false })
export class CoinsHistoricalRecord {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  prices: Record<Coin, number>;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  timestamp: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Boolean, default: false })
  completed: boolean;
}

export const CoinsHistoricalRecordSchema = SchemaFactory.createForClass(CoinsHistoricalRecord);

CoinsHistoricalRecordSchema.index({ timestamp: 1 }, { unique: true });
CoinsHistoricalRecordSchema.index({ completed: 1, timestamp: 1 });
