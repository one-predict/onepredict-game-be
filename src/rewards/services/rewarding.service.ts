import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectUserService, UserService } from '@user';
import { InjectDeduplicationService } from '@deduplication/decorators';
import { DeduplicationService } from '@deduplication/services';
import { AnyReward } from '@rewards/types';
import { RewardType } from '@rewards/enums';

export interface RewardingService {
  reward(rewards: AnyReward[], userId: string, rewardingId: string): Promise<void>;
}

export class DefaultRewardingService implements RewardingService {
  constructor(
    @InjectDeduplicationService() private readonly deduplicationService: DeduplicationService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async reward(rewards: AnyReward[], userId: string, rewardingId: string) {
    return this.transactionsManager.useTransaction(async () => {
      await this.deduplicationService.createDeduplicationRecord(`rewarding:${rewardingId}`);

      for (const reward of rewards) {
        if (reward.type === RewardType.Coins) {
          await this.userService.addCoins(userId, reward.coins);
        }
      }
    });
  }
}
