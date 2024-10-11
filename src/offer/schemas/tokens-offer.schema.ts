import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { HydratedDocument } from 'mongoose';

export type TokensOfferDocument = HydratedDocument<TokensOffer>;

@Schema({ collection: 'tokens_offers' })
export class TokensOffer {
  @Prop([{ required: true, type: mongoose.Schema.Types.String }])
  assets: Array<string>;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, default: null })
  tournament: ObjectId | null;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  timestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  opensAfterTimestamp: number;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  durationInSeconds: number;
}

export const TokensOfferSchema = SchemaFactory.createForClass(TokensOffer);

TokensOfferSchema.index({ tournament: 1, timestamp: 1 }, { unique: true });
