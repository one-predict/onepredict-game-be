import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { GameCardId } from '@card';
import { MongoUserInventoryEntity, UserInventoryEntity } from '@inventory/entities';
import { UserInventory } from '@inventory/schemas';

export interface CreateUserInventoryEntityParams {
  user: string;
  cards: GameCardId[];
  perks: string[];
}

export interface UpdateUserInventoryEntityParams {
  cards?: GameCardId[];
  perks?: string[];
}

export interface UserInventoryRepository {
  findByUserId(userId: string): Promise<UserInventoryEntity | null>;
  createOne(params: CreateUserInventoryEntityParams): Promise<UserInventoryEntity>;
  updateOneById(id: string, params: UpdateUserInventoryEntityParams): Promise<UserInventoryEntity | null>;
}

@Injectable()
export class MongoUserInventoryRepository implements UserInventoryRepository {
  public constructor(
    @InjectModel(UserInventory.name) private userInventoryModel: Model<UserInventory>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByUserId(userId: string) {
    const userInventoryDocument = await this.userInventoryModel
      .findOne({
        user: new ObjectId(userId),
      })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return userInventoryDocument && new MongoUserInventoryEntity(userInventoryDocument);
  }

  public async createOne(params: CreateUserInventoryEntityParams) {
    const [userInventoryDocument] = await this.userInventoryModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoUserInventoryEntity(userInventoryDocument);
  }

  public async updateOneById(id: string, params: UpdateUserInventoryEntityParams) {
    const userInventoryDocument = await this.userInventoryModel
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

    return userInventoryDocument && new MongoUserInventoryEntity(userInventoryDocument);
  }
}
