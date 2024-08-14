import { Module } from '@nestjs/common';
import { CoreModule } from '@core';
import { UserModule } from '@user';
import { CardModule } from '@card';
import { InventoryModule } from '@inventory';
import { GameCardsMarketplaceController } from '@marketplace/controllers';
import { GameCardsMarketplaceServiceImpl } from '@marketplace/services';
import MarketplaceModuleTokens from './marketplace.module.tokens';

@Module({
  imports: [UserModule, CoreModule, CardModule, InventoryModule],
  controllers: [GameCardsMarketplaceController],
  providers: [
    {
      provide: MarketplaceModuleTokens.Services.GameCardsMarketplaceService,
      useClass: GameCardsMarketplaceServiceImpl,
    },
  ],
  exports: [MarketplaceModuleTokens.Services.GameCardsMarketplaceService],
})
export class MarketplaceModule {}
