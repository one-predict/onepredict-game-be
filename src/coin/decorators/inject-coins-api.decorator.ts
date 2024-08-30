import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectCoinsApi = () => {
  return Inject(CoinModuleTokens.Api.CoinsApi);
};

export default InjectCoinsApi;
