import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '@user';
import { TournamentModule } from '@tournament';
import { InventoryModule } from '@inventory';
import { CoreModule } from '@core';
import { CardModule } from '@card';
import {
  Portfolio,
  PortfolioOffer,
  PortfolioCardsDeck,
  PortfolioOfferSchema,
  PortfolioSchema,
  PortfolioCardsDeckSchema,
} from '@portfolio/schemas';
import { PortfolioServiceImpl, PortfolioOfferServiceImpl, PortfolioCardsDeckServiceImpl } from '@portfolio/services';
import { PortfolioController, PortfolioOfferController, PortfolioCardsDeckController } from '@portfolio/controllers';
import {
  MongoPortfolioRepository,
  MongoPortfolioOfferRepository,
  MongoPortfolioCardsDeckRepository,
} from '@portfolio/repositories';
import { CoinGeckoApi } from '@portfolio/api';
import PortfolioModuleTokens from './portfolio.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Portfolio.name, schema: PortfolioSchema }]),
    MongooseModule.forFeature([{ name: PortfolioOffer.name, schema: PortfolioOfferSchema }]),
    MongooseModule.forFeature([{ name: PortfolioCardsDeck.name, schema: PortfolioCardsDeckSchema }]),
    UserModule,
    TournamentModule,
    ConfigModule,
    HttpModule,
    CoreModule,
    CardModule,
    InventoryModule,
  ],
  controllers: [PortfolioController, PortfolioOfferController, PortfolioCardsDeckController],
  providers: [
    {
      provide: PortfolioModuleTokens.Services.PortfolioService,
      useClass: PortfolioServiceImpl,
    },
    {
      provide: PortfolioModuleTokens.Repositories.PortfolioRepository,
      useClass: MongoPortfolioRepository,
    },
    {
      provide: PortfolioModuleTokens.Services.PortfolioOfferService,
      useClass: PortfolioOfferServiceImpl,
    },
    {
      provide: PortfolioModuleTokens.Repositories.PortfolioOfferRepository,
      useClass: MongoPortfolioOfferRepository,
    },
    {
      provide: PortfolioModuleTokens.Repositories.PortfolioCardsDeckRepository,
      useClass: MongoPortfolioCardsDeckRepository,
    },
    {
      provide: PortfolioModuleTokens.Services.PortfolioCardsDeckService,
      useClass: PortfolioCardsDeckServiceImpl,
    },
    {
      provide: PortfolioModuleTokens.Api.CoinsApi,
      useClass: CoinGeckoApi,
    },
  ],
  exports: [PortfolioModuleTokens.Services.PortfolioService, PortfolioModuleTokens.Services.PortfolioOfferService],
})
export class PortfolioModule {}
