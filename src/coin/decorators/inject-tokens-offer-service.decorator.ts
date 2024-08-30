import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectTokensOfferService = () => {
  return Inject(CoinModuleTokens.Services.TokensOfferService);
};

export default InjectTokensOfferService;
