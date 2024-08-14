import { FlattenMaps } from 'mongoose';
import { GameCard } from '@card/schemas';
import { GameCardId, GameCardRarity } from '@card/enums';

export interface GameCardEntity {
  getId(): GameCardId;
  getDescription(): string;
  getName(): string;
  getRarity(): GameCardRarity;
  getPrice(): number;
}

export class MongoGameCardEntity implements GameCardEntity {
  constructor(private readonly gameCardDocument: FlattenMaps<GameCard> & { _id: GameCardId }) {}

  public getId() {
    return this.gameCardDocument._id;
  }

  public getDescription() {
    return this.gameCardDocument.description;
  }

  public getName() {
    return this.gameCardDocument.name;
  }

  public getRarity() {
    return this.gameCardDocument.rarity;
  }

  public getPrice() {
    return this.gameCardDocument.price;
  }
}
