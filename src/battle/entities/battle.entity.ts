import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Battle } from '../schemas/battle.schema';
import { PortfolioOffer } from '@portfolio/schemas';

export interface BattleEntity {
  id: string;
  battleId: string;
  offerId: string;
  ownerId: string;
  entryPrice: number;
  participants: string[];
  offer: PortfolioOffer;
}

export class MongoBattleEntity implements BattleEntity {
  id: string;
  battleId: string;
  offerId: string;
  ownerId: string;
  entryPrice: number;
  participants: string[];
  offer: PortfolioOffer;

  constructor(private readonly document: FlattenMaps<Battle> & { _id: ObjectId }) {}

  getBattle(): BattleEntity {
    return {
      id: this.document._id.toString(),
      battleId: this.document.battleId,
      offerId: this.document.offerId._id.toString(),
      offer: this.document.offerId as unknown as PortfolioOffer,
      ownerId: this.document.ownerId.toString(),
      entryPrice: this.document.entryPrice,
      participants: this.document.participants,
    };
  }
}
