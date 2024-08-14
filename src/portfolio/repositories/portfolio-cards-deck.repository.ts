import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { GameCardId } from '@card';
import { MongoPortfolioCardsDeckEntity, PortfolioCardsDeckEntity } from '@portfolio/entities';
import { PortfolioCardsDeck } from '@portfolio/schemas';

export interface CreatePortfolioCardsDeckEntityParams {
  user: string;
  cards: GameCardId[];
}

export interface UpdatePortfolioCardsDeckEntityParams {
  cards?: GameCardId[];
}

export interface PortfolioCardsDeckRepository {
  findByUserId(userId: string): Promise<PortfolioCardsDeckEntity[]>;
  findById(id: string): Promise<PortfolioCardsDeckEntity | null>;
  createOne(params: CreatePortfolioCardsDeckEntityParams): Promise<PortfolioCardsDeckEntity>;
  updateOneById(id: string, params: UpdatePortfolioCardsDeckEntityParams): Promise<PortfolioCardsDeckEntity | null>;
}

@Injectable()
export class MongoPortfolioCardsDeckRepository implements PortfolioCardsDeckRepository {
  public constructor(
    @InjectModel(PortfolioCardsDeck.name) private portfolioCardsDeckModel: Model<PortfolioCardsDeck>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByUserId(userId) {
    const decks = await this.portfolioCardsDeckModel
      .find({ user: new ObjectId(userId) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return decks.map((deck) => {
      return new MongoPortfolioCardsDeckEntity(deck);
    });
  }

  public async findById(id: string) {
    const deck = await this.portfolioCardsDeckModel
      .findOne({
        _id: new ObjectId(id),
      })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return deck && new MongoPortfolioCardsDeckEntity(deck);
  }

  public async createOne(params: CreatePortfolioCardsDeckEntityParams) {
    const [deck] = await this.portfolioCardsDeckModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoPortfolioCardsDeckEntity(deck);
  }

  public async updateOneById(id: string, params: UpdatePortfolioCardsDeckEntityParams) {
    const deck = await this.portfolioCardsDeckModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        params,
        {
          new: true,
          session: this.transactionsManager.getSession(),
        },
      )
      .lean()
      .exec();

    return deck && new MongoPortfolioCardsDeckEntity(deck);
  }
}
