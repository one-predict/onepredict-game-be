import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';
import { UserEntity, MongoUserEntity } from '@user/entities';
import { InjectTransactionsManagerDecorator } from '@core/decorators';
import { TransactionsManager } from '@core/managers';
import { Gt, Match, Or } from '@common/data/aggregations';

interface CreateUserEntityParams {
  fid: number;
  balance?: number;
  name?: string;
  imageUrl?: string;
}

interface UpdateUserEntityParams {
  balance?: number;
  name?: string;
  imageUrl?: string;
  addPoints?: number;
}

export interface UserRepository {
  findByFid(fid: number): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  getUserRank(userId: string): Promise<number | null>;
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
    const user = await this.userModel.findOne({ fid }).lean().exec();

    return user && new MongoUserEntity(user);
  }

  public async findById(id: string) {
    const user = await this.userModel
      .findOne({ _id: new ObjectId(id) })
      .lean()
      .exec();

    return user && new MongoUserEntity(user);
  }

  public async getUserRank(userId: string) {
    const user = await this.userModel
      .findOne(
        {
          _id: new ObjectId(userId),
        },
        { points: 1, _id: 1 },
      )
      .lean()
      .exec();

    if (!user) {
      return null;
    }

    // 300, 100, 200

    const [{ summary }] = await this.userModel
      .aggregate([
        Match(Or([{ points: Gt(user.points) }, { points: user.points, _id: Gt(user._id) }])),
        { $sort: { points: -1, _id: 1 } },
        { $count: 'summary' },
      ])
      .exec();

    return (summary as number) + 1;
  }

  public async create(params: CreateUserEntityParams) {
    const user = await this.userModel.create(params);

    return new MongoUserEntity(user);
  }

  public async updateById(id: string, params: UpdateUserEntityParams) {
    const { addPoints, ...restParams } = params;

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          ...restParams,
          ...(addPoints !== undefined ? { $inc: { points: addPoints } } : {}),
        },
        { new: true, session: this.transactionsManager.getSession() },
      )
      .lean()
      .exec();

    return user && new MongoUserEntity(user);
  }
}
