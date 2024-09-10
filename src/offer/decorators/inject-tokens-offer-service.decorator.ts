import { Inject } from '@nestjs/common';
import OfferModuleTokens from '@offer/offer.module.tokens';

const InjectTokensOfferService = () => {
  return Inject(OfferModuleTokens.Services.TokensOfferService);
};

export default InjectTokensOfferService;
