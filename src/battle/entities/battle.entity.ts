import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Battle } from '../schemas/battle.schema';

export interface BattleEntity {
  id: string;
  battleId: string;
  offerId: string;
  ownerId: string;
  entryPrice: number;
  participants: string[];
}

export class MongoBattleEntity implements BattleEntity {
  id: string;
  battleId: string;
  offerId: string;
  ownerId: string;
  entryPrice: number;
  participants: string[];

  constructor(private readonly document: FlattenMaps<Battle> & { _id: ObjectId }) {
    this.id = this.document._id.toString();
    this.battleId = this.document.battleId;
    this.offerId = this.document.offerId.toString();
    this.ownerId = this.document.ownerId.toString();
    this.entryPrice = this.document.entryPrice;
    this.participants = this.document.participants;
  }
}
