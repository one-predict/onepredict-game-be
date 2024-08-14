import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { GameCard } from '@card/schemas';
import { GameCardId } from '@card/enums';
import { GameCardEntity, MongoGameCardEntity } from '@card/entities';

export interface GameCardRepository {
  find(): Promise<GameCardEntity[]>;
  findByIds(ids: GameCardId[]): Promise<GameCardEntity[]>;
  findById(id: GameCardId): Promise<GameCardEntity>;
}

@Injectable()
export class MongoGameCardRepository implements GameCardRepository {
  public constructor(
    @InjectModel(GameCard.name) private gameCardModel: Model<GameCard>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find() {
    const gameCardDocuments = await this.gameCardModel
      .find()
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return gameCardDocuments.map((gameCardDocument) => {
      return new MongoGameCardEntity(gameCardDocument);
    });
  }

  public async findByIds(ids: GameCardId[]) {
    const gameCardDocuments = await this.gameCardModel
      .find({ _id: { $in: ids } })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return gameCardDocuments.map((gameCardDocument) => {
      return new MongoGameCardEntity(gameCardDocument);
    });
  }

  public async findById(id: GameCardId) {
    const gameCardDocument = await this.gameCardModel
      .findOne({
        _id: id,
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return gameCardDocument && new MongoGameCardEntity(gameCardDocument);
  }
}
