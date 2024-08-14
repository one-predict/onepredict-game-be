import { ObjectId } from 'mongodb';
import { FlattenMaps } from 'mongoose';
import { GameCardId } from '@card';
import { UserInventory } from '@inventory/schemas';

export interface UserInventoryEntity {
  getId(): string;
  getUserId(): string;
  getPurchasedCardIds(): GameCardId[];
  getPurchasedPerkIds(): string[];
  getAvailableCardSlots(): number;
}

export class MongoUserInventoryEntity implements UserInventoryEntity {
  constructor(private readonly userInventoryDocument: FlattenMaps<UserInventory> & { _id: ObjectId }) {}

  public getId() {
    return this.userInventoryDocument._id.toString();
  }

  public getUserId() {
    return this.userInventoryDocument.user.toString();
  }

  public getPurchasedCardIds() {
    return this.userInventoryDocument.cards;
  }

  public getPurchasedPerkIds() {
    return this.userInventoryDocument.perks;
  }

  public getAvailableCardSlots() {
    return this.userInventoryDocument.availableCardSlots;
  }
}
