import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '@core';
import { DigitalAssetsPricesSnapshotController, DigitalAssetsTickController } from './controllers';
import { DigitalAssetsPricesSnapshot, DigitalAssetsPricesSnapshotSchema } from './schemas';
import { DefaultDigitalAssetsPricesSnapshotService, DefaultDigitalAssetsTickService } from './services';
import { MongoDigitalAssetsPricesSnapshotRepository, RedisDigitalAssetsTickRepository } from './repositories';
import { CryptoCompareDigitalAssetsApi } from './api';
import { DefaultDigitalAssetsPricesSnapshotEntityMapper } from './entity-mappers';
import DigitalAssetsModuleTokens from './digital-assets.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DigitalAssetsPricesSnapshot.name, schema: DigitalAssetsPricesSnapshotSchema }]),
    ConfigModule,
    HttpModule,
    CoreModule,
    RedisModule,
  ],
  controllers: [DigitalAssetsPricesSnapshotController, DigitalAssetsTickController],
  providers: [
    {
      provide: DigitalAssetsModuleTokens.Services.DigitalAssetsPricesSnapshotService,
      useClass: DefaultDigitalAssetsPricesSnapshotService,
    },
    {
      provide: DigitalAssetsModuleTokens.Repositories.DigitalAssetsPricesSnapshotRepository,
      useClass: MongoDigitalAssetsPricesSnapshotRepository,
    },
    {
      provide: DigitalAssetsModuleTokens.Api.DigitalAssetsApi,
      useClass: CryptoCompareDigitalAssetsApi,
    },
    {
      provide: DigitalAssetsModuleTokens.EntityMapper.DigitalAssetsPricesSnapshotEntityMapper,
      useClass: DefaultDigitalAssetsPricesSnapshotEntityMapper,
    },
    {
      provide: DigitalAssetsModuleTokens.Services.DigitalAssetsTickService,
      useClass: DefaultDigitalAssetsTickService,
    },
    {
      provide: DigitalAssetsModuleTokens.Repositories.DigitalAssetsTickRepository,
      useClass: RedisDigitalAssetsTickRepository,
    },
  ],
  exports: [
    DigitalAssetsModuleTokens.Services.DigitalAssetsPricesSnapshotService,
    DigitalAssetsModuleTokens.Services.DigitalAssetsTickService,
  ],
})
export class DigitalAssetsModule {}
