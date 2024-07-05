import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '@app/core';
import { Portfolio, PortfolioOffer, PortfolioOfferSchema, PortfolioSchema } from '@portfolio/schemas';
import { PortfolioServiceImpl, PortfolioOfferServiceImpl } from '@portfolio/services';
import { PortfolioController, PortfolioOfferController } from '@portfolio/controllers';
import { MongoPortfolioRepository, MongoPortfolioOfferRepository } from '@portfolio/repositories';
import { CoinGeckoApi } from '@portfolio/api';
import { UserModule } from '@app/user';
import { TournamentModule } from '@app/tournament';
import PortfolioModuleTokens from './portfolio.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Portfolio.name, schema: PortfolioSchema }]),
    MongooseModule.forFeature([{ name: PortfolioOffer.name, schema: PortfolioOfferSchema }]),
    UserModule,
    TournamentModule,
    ConfigModule,
    HttpModule,
    CoreModule,
  ],
  controllers: [PortfolioController, PortfolioOfferController],
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
      provide: PortfolioModuleTokens.Api.CoinsApi,
      useClass: CoinGeckoApi,
    },
  ],
  exports: [
    PortfolioModuleTokens.Services.PortfolioService,
    PortfolioModuleTokens.Services.PortfolioOfferService,
  ],
})
export class PortfolioModule {}
