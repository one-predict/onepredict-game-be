import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { User } from '@user/schemas';
import { UserEntity, MongoUserEntity } from '@user/entities';

export type FindUserEntitiesQuery = FindEntitiesQuery<{
  externalId?: string | number;
  referrerId?: string;
}>;

interface CreateUserEntityParams {
  externalId: string | number;
  coinsBalance?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  referrer?: string | null;
}

interface UpdateUserEntityParams {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  coinsBalance?: number;
  totalEarnedCoins?: number;
  addCoins?: number;
}

export interface UserRepository {
  find(query: FindUserEntitiesQuery): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  create(params: CreateUserEntityParams): Promise<UserEntity>;
  updateById(id: string, params: UpdateUserEntityParams): Promise<UserEntity | null>;
}

@Injectable()
export class MongoUserRepository implements UserRepository {
  public constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindUserEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<User> = {};

    if (query.filter?.externalId) {
      mongodbQueryFilter.externalId = query.filter.externalId;
    }

    if (query.filter?.referrerId) {
      mongodbQueryFilter.referrer = new ObjectId(query.filter.referrerId);
    }

    const users = await this.userModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        limit: query.limit,
        skip: query.skip,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return users.map((user) => new MongoUserEntity(user));
  }

  public async findById(id: string) {
    const user = await this.userModel
      .findOne({ _id: new ObjectId(id) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return user && new MongoUserEntity(user);
  }

  public async create(params: CreateUserEntityParams) {
    const [user] = await this.userModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoUserEntity(user);
  }

  public async updateById(id: string, params: UpdateUserEntityParams) {
    const { addCoins, ...restParams } = params;

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          ...restParams,
          ...(addCoins !== undefined ? { $inc: { coinsBalance: addCoins } } : {}),
        },
        { new: true, session: this.transactionsManager.getSession() },
      )
      .lean()
      .exec();

    return user && new MongoUserEntity(user);
  }
}
