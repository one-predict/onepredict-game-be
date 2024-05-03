import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectPortfolioOfferRepository = () => {
  return Inject(PortfolioModuleTokens.Repositories.PortfolioOfferRepository);
};

export default InjectPortfolioOfferRepository;
