import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectCoinsHistoricalRecordRepository = () => {
  return Inject(CoinModuleTokens.Repositories.CoinsHistoricalRecordRepository);
};

export default InjectCoinsHistoricalRecordRepository;
