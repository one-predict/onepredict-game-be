import { Inject } from '@nestjs/common';
import OfferModuleTokens from '@offer/offer.module.tokens';

const InjectTokensOfferRepository = () => {
  return Inject(OfferModuleTokens.Repositories.TokensOfferRepository);
};

export default InjectTokensOfferRepository;
