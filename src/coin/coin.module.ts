import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '@core';
import { CoinsPricingInfoController, CoinsHistoryController } from '@coin/controllers';
import {
  CoinsHistoricalRecord,
  CoinsPricingInfo,
  CoinsPricingInfoSchema,
  CoinsHistoricalRecordSchema,
} from '@coin/schemas';
import { CoinsHistoryServiceImpl, CoinsPricingServiceImpl } from '@coin/services';
import { MongoCoinsHistoricalRecordRepository, MongoCoinsPricingInfoRepository } from '@coin/repositories';
import { CryptoCompareCoinsApi } from '@coin/api';
import CoinModuleTokens from './coin.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CoinsPricingInfo.name, schema: CoinsPricingInfoSchema }]),
    MongooseModule.forFeature([{ name: CoinsHistoricalRecord.name, schema: CoinsHistoricalRecordSchema }]),
    ConfigModule,
    HttpModule,
    CoreModule,
  ],
  controllers: [CoinsPricingInfoController, CoinsHistoryController],
  providers: [
    {
      provide: CoinModuleTokens.Services.CoinsHistoryService,
      useClass: CoinsHistoryServiceImpl,
    },
    {
      provide: CoinModuleTokens.Services.CoinsPricingService,
      useClass: CoinsPricingServiceImpl,
    },
    {
      provide: CoinModuleTokens.Repositories.CoinsHistoricalRecordRepository,
      useClass: MongoCoinsHistoricalRecordRepository,
    },
    {
      provide: CoinModuleTokens.Repositories.CoinsPricingInfoRepository,
      useClass: MongoCoinsPricingInfoRepository,
    },
    {
      provide: CoinModuleTokens.Api.CoinsApi,
      useClass: CryptoCompareCoinsApi,
    },
  ],
  exports: [CoinModuleTokens.Services.CoinsHistoryService, CoinModuleTokens.Services.CoinsPricingService],
})
export class CoinModule {}
