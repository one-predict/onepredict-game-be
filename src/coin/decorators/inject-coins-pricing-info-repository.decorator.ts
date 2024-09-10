import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectCoinsPricingInfoRepository = () => {
  return Inject(CoinModuleTokens.Repositories.CoinsPricingInfoRepository);
};

export default InjectCoinsPricingInfoRepository;
