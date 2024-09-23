import { Inject } from '@nestjs/common';
import RewardsModuleTokens from '@rewards/rewards.module.tokens';

const InjectRewardsNotificationRepository = () => {
  return Inject(RewardsModuleTokens.Repositories.RewardsNotificationRepository);
};

export default InjectRewardsNotificationRepository;
