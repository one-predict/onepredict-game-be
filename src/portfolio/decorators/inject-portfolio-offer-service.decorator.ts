import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectPortfolioOfferService = () => {
  return Inject(PortfolioModuleTokens.Services.PortfolioOfferService);
};

export default InjectPortfolioOfferService;
