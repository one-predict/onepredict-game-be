import { Inject } from '@nestjs/common';
import RewardsModuleTokens from '@rewards/rewards.module.tokens';

const InjectRewardingService = () => {
  return Inject(RewardsModuleTokens.Services.RewardingService);
};

export default InjectRewardingService;
