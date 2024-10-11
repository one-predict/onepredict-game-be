import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { DigitalAssetPricePrediction } from '@prediction-game/types';
import { Portfolio } from '@portfolio/schemas';
import { PortfolioResult } from '@portfolio/types';

export interface PortfolioEntity {
  getId(): string;
  getUserId(): string;
  getOfferId(): string;
  getTournamentId(): string | null;
  getCreatedAt(): Date;
  getInterval(): [number, number];
  getPredictions(): DigitalAssetPricePrediction[];
  getResult(): PortfolioResult | undefined;
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

  public getPredictions() {
    return this.portfolioDocument.predictions;
  }

  public getOfferId() {
    return this.portfolioDocument.offer.toString();
  }

  public getCreatedAt() {
    return this.portfolioDocument.createdAt;
  }

  public getResult() {
    return this.portfolioDocument.result;
  }

  public isAwarded() {
    return this.portfolioDocument.isAwarded;
  }

  public getInterval() {
    return [this.portfolioDocument.intervalStartTimestamp, this.portfolioDocument.intervalEndTimestamp] as [
      number,
      number,
    ];
  }

  public getTournamentId() {
    return this.portfolioDocument.tournament.toString();
  }
}
