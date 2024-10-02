import { RewardsEventCategory, RewardingEventType } from '@rewards/enums';
import { CreateEventParams } from '@events/services';
import { AnyReward, RewardsIssuedEventData } from '@rewards/types';

export const generateRewardsIssuedEvent = (
  rewards: AnyReward[],
  userId: string,
): CreateEventParams<RewardsIssuedEventData> => {
  return {
    type: RewardingEventType.RewardsIssued,
    category: RewardsEventCategory.Rewards,
    data: {
      userId,
      rewards,
    },
    userId: null,
  };
};
