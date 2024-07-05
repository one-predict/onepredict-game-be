import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';
import { UserEntity, MongoUserEntity } from '@user/entities';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';

interface CreateUserEntityParams {
  fid: number;
  balance?: number;
  name?: string;
  imageUrl?: string;
}

interface UpdateUserEntityParams {
  name?: string;
  imageUrl?: string;
  addCoins?: number;
}

export interface UserRepository {
  findByFid(fid: number): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(params: CreateUserEntityParams): Promise<UserEntity>;
  updateById(id: string, params: UpdateUserEntityParams): Promise<UserEntity | null>;
}

@Injectable()
export class MongoUserRepository implements UserRepository {
  public constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectTransactionsManagerDecorator() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByFid(fid: number) {
    const user = await this.userModel
      .findOne({ fid })
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
