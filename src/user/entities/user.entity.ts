import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';

export interface UserEntity {
  getId(): string;
  getFid(): number;
  getName(): string;
  getImageUrl(): string;
  getCoinsBalance(): number;
  getEnergy(): number;
}

export class MongoUserEntity implements UserEntity {
  constructor(private readonly userDocument: FlattenMaps<User> & { _id: ObjectId }) {}

  public getId() {
    return this.userDocument._id.toString();
  }

  public getFid() {
    return this.userDocument.fid;
  }

  public getName() {
    return this.userDocument.name;
  }

  public getImageUrl() {
    return this.userDocument.imageUrl;
  }

  public getCoinsBalance() {
    return this.userDocument.coinsBalance;
  }

  public getEnergy() {
    return this.userDocument.energy;
  }
}
