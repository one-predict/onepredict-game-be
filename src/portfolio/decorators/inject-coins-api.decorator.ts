import { Inject } from '@nestjs/common';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';

const InjectCoinsApi = () => {
  return Inject(PortfolioModuleTokens.Api.CoinsApi);
};

export default InjectCoinsApi;
