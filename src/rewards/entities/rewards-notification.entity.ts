import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { AnyObject } from '@common/types';
import { RewardsNotification } from '@rewards/schemas';

export interface RewardsNotificationEntity {
  getId(): string;
  getRecipientId(): string;
  getType(): string;
  getPayload(): AnyObject;
  getCreatedAt(): Date;
}

export class MongoRewardsNotificationEntity implements RewardsNotificationEntity {
  constructor(private readonly rewardsNotificationDocument: FlattenMaps<RewardsNotification> & { _id: ObjectId }) {}

  public getId() {
    return this.rewardsNotificationDocument._id.toString();
  }

  public getRecipientId() {
    return this.rewardsNotificationDocument.recipient.toString();
  }

  public getType() {
    return this.rewardsNotificationDocument.type;
  }

  public getPayload() {
    return this.rewardsNotificationDocument.payload;
  }

  public getCreatedAt(): Date {
    return this.rewardsNotificationDocument.createdAt;
  }
}
