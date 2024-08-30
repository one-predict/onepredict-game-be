import { Inject } from '@nestjs/common';
import CoinModuleTokens from '@coin/coin.module.tokens';

const InjectTokensOfferRepository = () => {
  return Inject(CoinModuleTokens.Repositories.TokensOfferRepository);
};

export default InjectTokensOfferRepository;
