import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CoreModule } from '@app/core';
import { UserModule } from '@app/user';

import BattleModuleTokens from '@app/battle/battle.module.tokens';
import BattleController from './controllers/battle.controller';
import { BattleServiceImpl } from './services';
import { MongoBattleRepository } from './repositories/battle.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Battle, BattleSchema } from './schemas/battle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battle.name, schema: BattleSchema }]),
    UserModule,
    ConfigModule,
    HttpModule,
    CoreModule,
  ],
  controllers: [BattleController],
  providers: [
    {
      provide: BattleModuleTokens.Services.BattleService,
      useClass: BattleServiceImpl,
    },
    {
      provide: BattleModuleTokens.Repositories.BattleRepository,
      useClass: MongoBattleRepository,
    },
  ],
  exports: [BattleModuleTokens.Services.BattleService, BattleModuleTokens.Repositories.BattleRepository],
})
export class BattleModule {}
