import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PortfolioOffer, TokenOffer } from '@portfolio/schemas';
import { OfferStatus } from '@portfolio/enums';

export interface PortfolioOfferEntity {
  getId(): string;
  getDay(): number;
  getDate(): string;
  getTokenOffers(): TokenOffer[];
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

  public getTokenOffers() {
    return this.portfolioOfferDocument.tokenOffers;
  }

  public getPriceChanges() {
    return this.portfolioOfferDocument.pricingChanges || {};
  }

  public getOfferStatus() {
    return this.portfolioOfferDocument.offerStatus;
  }
}
