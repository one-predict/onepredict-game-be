import { Inject } from '@nestjs/common';
import UserModuleTokens from '@user/user.module.tokens';

const InjectReferralService = () => {
  return Inject(UserModuleTokens.Services.ReferralService);
};

export default InjectReferralService;
