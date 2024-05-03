import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectPortfolioRepository = () => {
  return Inject(PortfolioModuleTokens.Repositories.PortfolioRepository);
};

export default InjectPortfolioRepository;
