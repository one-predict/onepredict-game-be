import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectCoinsHistoryService = () => {
  return Inject(CoinModuleTokens.Services.CoinsHistoryService);
};

export default InjectCoinsHistoryService;
