import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from '@core';
import { DigitalAssetsPricesSnapshotController } from './controllers';
import { DigitalAssetsPricesSnapshot, DigitalAssetsPricesSnapshotSchema } from './schemas';
import { DefaultDigitalAssetsPricesSnapshotService } from './services';
import { MongoDigitalAssetsPricesSnapshotRepository } from './repositories';
import { CryptoCompareDigitalAssetsApi } from './api';
import { DefaultDigitalAssetsPricesSnapshotEntityMapper } from './entity-mappers';
import DigitalAssetsModuleTokens from './digital-assets.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DigitalAssetsPricesSnapshot.name, schema: DigitalAssetsPricesSnapshotSchema }]),
    ConfigModule,
    HttpModule,
    CoreModule,
  ],
  controllers: [DigitalAssetsPricesSnapshotController],
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
  ],
  exports: [DigitalAssetsModuleTokens.Services.DigitalAssetsPricesSnapshotService],
})
export class DigitalAssetsModule {}
