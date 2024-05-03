import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';
import { UserEntity, MongoUserEntity } from '@user/entities';

interface CreateUserParams {
  fid: number;
  balance: number;
  name?: string;
  imageUrl?: string;
}

export interface UserRepository {
  findByFid(fid: number): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(params: CreateUserParams): Promise<UserEntity>;
}

@Injectable()
export class MongoUserRepository implements UserRepository {
  public constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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

  public async create(params: CreateUserParams) {
    const user = await this.userModel.create(params);

    return new MongoUserEntity(user);
  }
}
