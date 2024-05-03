import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectPortfolioService = () => {
  return Inject(PortfolioModuleTokens.Services.PortfolioService);
};

export default InjectPortfolioService;
