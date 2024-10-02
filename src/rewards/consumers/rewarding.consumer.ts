import { ConsumerMessage } from '@consumers/types';
import { ConsumerHandler } from '@consumers/decorators';
import { InjectRewardingService } from '@rewards/decorators';
import { RewardingService } from '@rewards/services';
import { RewardsIssuedEvent } from '@rewards/types';
import { RewardsConsumerName } from '@rewards/enums';

export default class RewardingConsumer {
  constructor(
    @InjectRewardingService()
    private readonly rewardingService: RewardingService,
  ) {}

  @ConsumerHandler(RewardsConsumerName.RewardingConsumerName)
  public async consume(message: ConsumerMessage<RewardsIssuedEvent>) {
    const { deduplicationId, payload: event } = message;

    await this.rewardingService.reward(event.data.rewards, event.data.userId, deduplicationId);
  }
}
