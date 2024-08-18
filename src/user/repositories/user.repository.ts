import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { User } from '@user/schemas';
import { UserEntity, MongoUserEntity } from '@user/entities';
import { ExternalUserType } from '@user/enums';

interface CreateUserEntityParams {
  externalId: string | number;
  externalType: ExternalUserType;
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
  addCoins?: number;
}

export interface UserRepository {
  findByExternalId(externalId: string | number): Promise<UserEntity | null>;
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

  public async findByExternalId(externalId: string | number) {
    const user = await this.userModel
      .findOne({ externalId })
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return user && new MongoUserEntity(user);
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
