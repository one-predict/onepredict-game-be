import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '@user/schemas';
import { ExternalUserType } from '@user/enums';

export interface UserEntity {
  getId(): string;
  getExternalId(): string | number;
  getExternalType(): ExternalUserType;
  getFirstName(): string | undefined;
  getLastName(): string | undefined;
  getUsername(): string | undefined;
  getAvatarUrl(): string | undefined;
  getCoinsBalance(): number;
  getIsOnboarded(): boolean;
  getReferer(): string;
}

export class MongoUserEntity implements UserEntity {
  constructor(private readonly userDocument: FlattenMaps<User> & { _id: ObjectId }) { }

  public getId() {
    return this.userDocument._id.toString();
  }

  public getExternalId() {
    return this.userDocument.externalId;
  }

  public getExternalType() {
    return this.userDocument.externalType;
  }

  public getUsername() {
    return this.userDocument.username;
  }

  public getFirstName() {
    return this.userDocument.firstName;
  }

  public getLastName() {
    return this.userDocument.lastName;
  }

  public getAvatarUrl() {
    return this.userDocument.avatarUrl;
  }

  public getCoinsBalance() {
    return this.userDocument.coinsBalance;
  }

  public getIsOnboarded() {
    return this.userDocument.onboarded;
  }

  public getReferer() {
    return this.userDocument.referrer.toString();
  }
}
