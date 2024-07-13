import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Battle } from '../schemas/battle.schema';
import { PortfolioOffer } from '@portfolio/schemas';

export interface BattlePlayer {
  userId: string;
  points: number;
}

export interface BattleEntity {
  id: string;
  displayId: string;
  offerId: string;
  ownerId: string;
  entryPrice: number;
  staticPrizePool: number;
  players: BattlePlayer[];
  offer: PortfolioOffer;
}

export class MongoBattleEntity implements BattleEntity {
  id: string;
  displayId: string;
  offerId: string;
  ownerId: string;
  entryPrice: number;
  staticPrizePool: number;
  players: BattlePlayer[];
  offer: PortfolioOffer;

  constructor(private readonly document: FlattenMaps<Battle> & { _id: ObjectId }) {}

  getBattle(): BattleEntity {
    return {
      id: this.document._id.toString(),
      displayId: this.document.displayId,
      offerId: this.document.offerId._id.toString(),
      offer: this.document.offerId as unknown as PortfolioOffer,
      ownerId: this.document.ownerId.toString(),
      entryPrice: this.document.entryPrice,
      staticPrizePool: this.document.staticPrizePool,
      players: this.document.players,
    };
  }
}
