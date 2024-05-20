import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PortfolioOffer, TokenOffer } from '@portfolio/schemas';

export interface PortfolioOfferEntity {
  getId(): string;
  getDay(): number;
  getDate(): string;
  getTokenOffers(): TokenOffer[];
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
}
