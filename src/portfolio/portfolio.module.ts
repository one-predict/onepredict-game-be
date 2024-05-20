import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Portfolio, PortfolioOffer, PortfolioOfferSchema, PortfolioSchema } from '@portfolio/schemas';
import { PortfolioServiceImpl, PortfolioOfferServiceImpl } from '@portfolio/services';
import { PortfolioController, PortfolioOfferController } from '@portfolio/controllers';
import { MongoPortfolioRepository, MongoPortfolioOfferRepository } from '@portfolio/repositories';
import { UserModule } from '@app/user';
import PortfolioModuleTokens from './portfolio.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Portfolio.name, schema: PortfolioSchema }]),
    MongooseModule.forFeature([{ name: PortfolioOffer.name, schema: PortfolioOfferSchema }]),
    UserModule,
    ConfigModule,
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
  ],
  exports: [
    PortfolioModuleTokens.Services.PortfolioService,
    PortfolioModuleTokens.Services.PortfolioOfferService,
  ],
})
export class PortfolioModule {}
