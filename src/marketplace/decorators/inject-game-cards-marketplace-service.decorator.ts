import { Inject } from '@nestjs/common';
import UserInventoryModuleTokens from '@marketplace/marketplace.module.tokens';

const InjectGameCardsMarketplaceService = () => {
  return Inject(UserInventoryModuleTokens.Services.GameCardsMarketplaceService);
};

export default InjectGameCardsMarketplaceService;
