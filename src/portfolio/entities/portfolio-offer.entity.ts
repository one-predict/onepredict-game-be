import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PortfolioOffer } from '@portfolio/schemas';
import { OfferStatus } from '@portfolio/enums';

export interface PortfolioOfferEntity {
  getId(): string;
  getDay(): number;
  getDate(): string;
  getTokens(): string[];
  getPriceChanges(): Record<string, number>;
  getOfferStatus(): OfferStatus;
}

export class MongoPortfolioOfferEntity implements PortfolioOfferEntity {
  constructor(private readonly portfolioOfferDocument: FlattenMaps<PortfolioOffer> & { _id: ObjectId }) {}

  public getId() {
    return this.portfolioOfferDocument._id.toString();
  }

  public getDay() {
    return this.portfolioOfferDocument.day;
  }

  public getDate() {
    return this.portfolioOfferDocument.date;
  }

  public getTokens() {
    return this.portfolioOfferDocument.tokens;
  }

  public getPriceChanges() {
    return this.portfolioOfferDocument.pricingChanges || {};
  }

  public getOfferStatus() {
    return this.portfolioOfferDocument.offerStatus;
  }
}
