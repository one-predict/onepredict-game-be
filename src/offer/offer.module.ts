import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { TokensOffer, TokensOfferSchema } from '@offer/schemas';
import { TokensOfferServiceImpl } from '@offer/services';
import { TokensOfferController } from '@offer/controllers';
import { MongoTokensOfferRepository } from '@offer/repositories';
import OfferModuleTokens from './offer.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TokensOffer.name, schema: TokensOfferSchema }]),
    ConfigModule,
    CoreModule,
  ],
  controllers: [TokensOfferController],
  providers: [
    {
      provide: OfferModuleTokens.Services.TokensOfferService,
      useClass: TokensOfferServiceImpl,
    },
    {
      provide: OfferModuleTokens.Repositories.TokensOfferRepository,
      useClass: MongoTokensOfferRepository,
    },
  ],
  exports: [OfferModuleTokens.Services.TokensOfferService],
})
export class OfferModule {}
