import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '@core';
import { CoinsPricingRecord, TokensOffer, TokensOfferSchema, CoinsPricingRecordSchema } from '@coin/schemas';
import { CoinsPricingServiceImpl, TokensOfferServiceImpl } from '@coin/services';
import { TokensOfferController } from '@coin/controllers';
import { MongoCoinsPricingRecordRepository, MongoTokensOfferRepository } from '@coin/repositories';
import { CryptoCompareCoinsApi } from '@coin/api';
import CoinModuleTokens from './coin.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TokensOffer.name, schema: TokensOfferSchema }]),
    MongooseModule.forFeature([{ name: CoinsPricingRecord.name, schema: CoinsPricingRecordSchema }]),
    ConfigModule,
    HttpModule,
    CoreModule,
  ],
  controllers: [TokensOfferController],
  providers: [
    {
      provide: CoinModuleTokens.Services.TokensOfferService,
      useClass: TokensOfferServiceImpl,
    },
    {
      provide: CoinModuleTokens.Repositories.TokensOfferRepository,
      useClass: MongoTokensOfferRepository,
    },
    {
      provide: CoinModuleTokens.Services.CoinsPricingService,
      useClass: CoinsPricingServiceImpl,
    },
    {
      provide: CoinModuleTokens.Repositories.CoinsPricingRecordRepository,
      useClass: MongoCoinsPricingRecordRepository,
    },
    {
      provide: CoinModuleTokens.Api.CoinsApi,
      useClass: CryptoCompareCoinsApi,
    },
  ],
  exports: [CoinModuleTokens.Services.TokensOfferService, CoinModuleTokens.Services.CoinsPricingService],
})
export class CoinModule {}
