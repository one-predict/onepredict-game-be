import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Portfolio, SelectedPortfolioToken } from '@portfolio/schemas';

export interface PortfolioEntity {
  getId(): string;
  getUserId(): string;
  getOfferId(): string;
  getTournamentId(): string | null;
  getCreatedAt(): Date;
  getInterval(): [number, number];
  getAppliedCardsStack(): Record<string, number>;
  getSelectedTokens(): SelectedPortfolioToken[];
  getEarnedCoins(): number;
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

  public getAppliedCardsStack() {
    return this.portfolioDocument.appliedCardsStack;
  }

  public getCreatedAt() {
    return this.portfolioDocument.createdAt;
  }

  public getEarnedCoins() {
    return this.portfolioDocument.earnedCoins;
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

  public getTournamentId(): string | null {
    return this.portfolioDocument.tournament?.toString() ?? null;
  }
}
