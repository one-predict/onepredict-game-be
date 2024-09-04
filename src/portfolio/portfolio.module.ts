import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '@user';
import { TournamentModule } from '@tournament';
import { CoreModule } from '@core';
import { CardModule } from '@card';
import { CoinModule } from '@coin';
import { InventoryModule } from '@inventory';
import { Portfolio, PortfolioSchema } from '@portfolio/schemas';
import { PortfolioServiceImpl } from '@portfolio/services';
import { PortfolioController } from '@portfolio/controllers';
import { MongoPortfolioRepository } from '@portfolio/repositories';
import PortfolioModuleTokens from './portfolio.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Portfolio.name, schema: PortfolioSchema }]),
    UserModule,
    TournamentModule,
    ConfigModule,
    HttpModule,
    CoreModule,
    CardModule,
    CoinModule,
    InventoryModule,
  ],
  controllers: [PortfolioController],
  providers: [
    {
      provide: PortfolioModuleTokens.Services.PortfolioService,
      useClass: PortfolioServiceImpl,
    },
    {
      provide: PortfolioModuleTokens.Repositories.PortfolioRepository,
      useClass: MongoPortfolioRepository,
    },
  ],
  exports: [PortfolioModuleTokens.Services.PortfolioService],
})
export class PortfolioModule {}
