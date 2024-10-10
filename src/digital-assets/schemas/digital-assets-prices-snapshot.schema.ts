import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DigitalAssetId } from '@digital-assets/enums';

export type DigitalAssetsPricesSnapshotDocument = HydratedDocument<DigitalAssetsPricesSnapshot>;

@Schema({ collection: 'digital_assets_prices_snapshots', minimize: false })
export class DigitalAssetsPricesSnapshot {
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  prices: Record<DigitalAssetId, number>;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  timestamp: number;
}

export const DigitalAssetsPricesSnapshotSchema = SchemaFactory.createForClass(DigitalAssetsPricesSnapshot);

DigitalAssetsPricesSnapshotSchema.index({ timestamp: 1 }, { unique: true });
