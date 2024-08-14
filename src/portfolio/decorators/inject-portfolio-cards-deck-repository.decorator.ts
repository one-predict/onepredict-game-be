import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectPortfolioCardsDeckRepository = () => {
  return Inject(PortfolioModuleTokens.Repositories.PortfolioCardsDeckRepository);
};

export default InjectPortfolioCardsDeckRepository;
