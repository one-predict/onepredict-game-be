import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectCoinsPricingRecordRepository = () => {
  return Inject(CoinModuleTokens.Repositories.CoinsPricingRecordRepository);
};

export default InjectCoinsPricingRecordRepository;
