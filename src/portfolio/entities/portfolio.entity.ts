import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Portfolio } from '@portfolio/schemas';

export interface PortfolioEntity {
  getId(): string;
  getUserId(): string;
  getOfferId(): string;
  getCreatedAt(): Date;
  getSelectedTokens(): string[];
  getEarnedPoints(): number;
  isAwarded(): boolean;
}

export class MongoPortfolioEntity implements PortfolioEntity {
  constructor(private readonly portfolioDocument: FlattenMaps<Portfolio> & { _id: ObjectId }) {}

  public getId() {
    return this.portfolioDocument._id.toString();
  }

  public getUserId() {
    return this.portfolioDocument.user.toString();
  }

  public getSelectedTokens() {
    return this.portfolioDocument.selectedTokens;
  }

  public getOfferId() {
    return this.portfolioDocument.offer.toString();
  }

  public getCreatedAt() {
    return this.portfolioDocument.createdAt;
  }

  public getEarnedPoints() {
    return this.portfolioDocument.earnedPoints;
  }

  public isAwarded() {
    return this.portfolioDocument.earnedPoints !== undefined;
  }
}
