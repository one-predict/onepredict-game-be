import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { AnyObject } from '@common/types';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { RewardsNotification } from '@rewards/schemas';
import { MongoRewardsNotificationEntity, RewardsNotificationEntity } from '@rewards/entities';

export interface CreateRewardsNotificationEntityParams {
  recipient: string;
  type;
  payload: AnyObject;
}

export interface BatchCreateRewardsNotificationEntityParams {
  batch: CreateRewardsNotificationEntityParams[];
}

export interface RewardsNotificationRepository {
  findByRecipientId(recipientId: string): Promise<RewardsNotificationEntity[]>;
  findById(id: string): Promise<RewardsNotificationEntity | null>;
  createMany(params: BatchCreateRewardsNotificationEntityParams): Promise<RewardsNotificationEntity[]>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class MongoRewardsNotificationRepository implements RewardsNotificationRepository {
  public constructor(
    @InjectModel(RewardsNotification.name)
    private readonly rewardsNotificationModel: Model<RewardsNotification>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByRecipientId(recipientId: string) {
    const rewardsNotificationDocuments = await this.rewardsNotificationModel
      .find({ recipient: new ObjectId(recipientId) }, undefined, {
        lean: true,
        sort: {
          createdAt: 1,
        },
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return rewardsNotificationDocuments.map((rewardsNotificationDocument) => {
      return new MongoRewardsNotificationEntity(rewardsNotificationDocument);
    });
  }

  public async findById(id: string) {
    const rewardsNotificationDocument = await this.rewardsNotificationModel
      .findOne({ _id: new ObjectId(id) }, undefined, {
        lean: true,
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return rewardsNotificationDocument ? new MongoRewardsNotificationEntity(rewardsNotificationDocument) : null;
  }

  public async createMany(params: BatchCreateRewardsNotificationEntityParams) {
    const rewardsNotificationDocuments = await this.rewardsNotificationModel.create(params.batch, {
      session: this.transactionsManager.getSession(),
    });

    return rewardsNotificationDocuments.map((rewardsNotificationDocument) => {
      return new MongoRewardsNotificationEntity(rewardsNotificationDocument);
    });
  }

  public async delete(id: string) {
    await this.rewardsNotificationModel
      .deleteOne({ _id: new ObjectId(id) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();
  }
}
