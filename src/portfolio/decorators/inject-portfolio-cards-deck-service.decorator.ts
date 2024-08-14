import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectPortfolioCardsDeckService = () => {
  return Inject(PortfolioModuleTokens.Services.PortfolioCardsDeckService);
};

export default InjectPortfolioCardsDeckService;
