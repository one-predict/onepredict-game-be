import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { GameCardId } from '@card';
import { PortfolioCardsDeck } from '@portfolio/schemas';

export interface PortfolioCardsDeckEntity {
  getId(): string;
  getUserId(): string;
  getCardIds(): GameCardId[];
}

export class MongoPortfolioCardsDeckEntity implements PortfolioCardsDeckEntity {
  constructor(private readonly portfolioCardsDeckDocument: FlattenMaps<PortfolioCardsDeck> & { _id: ObjectId }) {}

  public getId() {
    return this.portfolioCardsDeckDocument._id.toString();
  }

  public getUserId() {
    return this.portfolioCardsDeckDocument.user.toString();
  }

  public getCardIds() {
    return this.portfolioCardsDeckDocument.cards;
  }
}
