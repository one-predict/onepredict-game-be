import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { OfferStatus } from '@portfolio/enums';

export type PortfolioOfferDocument = HydratedDocument<PortfolioOffer>;

export interface TokenOffer {
  firstToken: string;
  secondToken: string;
}

const TokenOfferSchema = new mongoose.Schema(
  {
    firstToken: { type: String, required: true },
    secondToken: { type: String, required: true },
  },
  { _id: false },
);

@Schema({ collection: 'portfolio_offers' })
export class PortfolioOffer {
  @Prop([{ required: true, type: TokenOfferSchema }])
  tokenOffers: Array<{
    firstToken: string;
    secondToken: string;
  }>;

  @Prop({ required: true, type: mongoose.Schema.Types.Number })
  day: number;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  date: string;

  @Prop({ required: true, type: mongoose.Schema.Types.String })
  offerStatus: OfferStatus;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  pricingChanges?: Record<string, number>;
}

export const PortfolioOfferSchema = SchemaFactory.createForClass(PortfolioOffer);

PortfolioOfferSchema.index({ day: 1 }, { unique: true });
PortfolioOfferSchema.index({ offerStatus: 1, day: 1 });
