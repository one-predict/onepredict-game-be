import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionsManager, InjectTransactionsManager } from '@core';
import { AnyObject } from '@common/types';
import { InjectRewardsNotificationRepository } from '@rewards/decorators';
import { RewardsNotificationEntity } from '@rewards/entities';
import { RewardsNotificationRepository } from '@rewards/repositories';
import { RewardsNotificationType } from '@rewards/enums';

interface CreateRewardsNotificationParams<Type extends string, Payload extends AnyObject> {
  type: Type;
  payload: Payload;
  recipientId: string;
}

type CreateCoinsRewardsNotificationParams = CreateRewardsNotificationParams<
  RewardsNotificationType.Coins,
  { coins: number }
>;

export type CreateAnyRewardsNotificationParams = CreateCoinsRewardsNotificationParams;

export interface BatchCreateRewardsNotificationsParams {
  batch: CreateAnyRewardsNotificationParams[];
}

export interface RewardsNotificationService {
  listByRecipientId(recipientId: string): Promise<RewardsNotificationEntity[]>;
  getById(id: string): Promise<RewardsNotificationEntity | null>;
  getByIdIfExists(id: string): Promise<RewardsNotificationEntity>;
  batchCreate(params: BatchCreateRewardsNotificationsParams): Promise<void>;
  delete(id: string, deletedById?: string | null): Promise<RewardsNotificationEntity>;
}

@Injectable()
export class DefaultRewardsNotificationService implements RewardsNotificationService {
  constructor(
    @InjectRewardsNotificationRepository()
    private readonly rewardsNotificationRepository: RewardsNotificationRepository,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public listByRecipientId(recipientId: string) {
    return this.rewardsNotificationRepository.findByRecipientId(recipientId);
  }

  public getById(id: string) {
    return this.rewardsNotificationRepository.findById(id);
  }

  public getByIdIfExists(id: string) {
    const notification = this.getById(id);

    if (!notification) {
      throw new NotFoundException('Notification is not found.');
    }

    return notification;
  }

  public async batchCreate(params: BatchCreateRewardsNotificationsParams) {
    await this.transactionsManager.useTransaction(async () => {
      return this.rewardsNotificationRepository.createMany({
        batch: params.batch.map((batchItem) => ({
          recipient: batchItem.recipientId,
          type: batchItem.type,
          payload: batchItem.payload,
        })),
      });
    });
  }

  public delete(id: string, deletedById?: string | null) {
    return this.transactionsManager.useTransaction(async () => {
      const notification = await this.getByIdIfExists(id);

      if (deletedById && notification.getRecipientId() !== deletedById) {
        throw new ForbiddenException('You are not allowed to delete this notification.');
      }

      await this.rewardsNotificationRepository.delete(id);

      return notification;
    });
  }
}
