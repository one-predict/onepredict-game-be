import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectCoinsPricingService = () => {
  return Inject(CoinModuleTokens.Services.CoinsPricingService);
};

export default InjectCoinsPricingService;
