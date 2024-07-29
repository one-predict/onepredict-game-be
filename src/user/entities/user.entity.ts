import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';

export interface UserEntity {
  getId(): string;
  getFid(): number;
  getUsername(): string;
  getImageUrl(): string;
  getCoinsBalance(): number;
}

export class MongoUserEntity implements UserEntity {
  constructor(private readonly userDocument: FlattenMaps<User> & { _id: ObjectId }) {}

  public getId() {
    return this.userDocument._id.toString();
  }

  public getFid() {
    return this.userDocument.fid;
  }

  public getUsername() {
    return this.userDocument.username;
  }

  public getImageUrl() {
    return this.userDocument.imageUrl;
  }

  public getCoinsBalance() {
    return this.userDocument.coinsBalance;
  }
}
