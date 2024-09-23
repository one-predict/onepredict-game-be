import { Inject } from '@nestjs/common';
import RewardsModuleTokens from '@rewards/rewards.module.tokens';

const InjectRewardsNotificationService = () => {
  return Inject(RewardsModuleTokens.Services.RewardsNotificationService);
};

export default InjectRewardsNotificationService;
