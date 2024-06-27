import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CoreModule } from '@app/core';
import { UserModule } from '@app/user';
import { MongoPortfolioRepository, PortfolioModule } from '@app/portfolio';

import BattleModuleTokens from '@app/battle/battle.module.tokens';
import BattleController from './controllers/battle.controller';
import { BattleServiceImpl } from './services';
import { MongoBattleRepository } from './repositories/battle.repository';
import PortfolioModuleTokens from '@portfolio/portfolio.module.tokens';
import { MongooseModule } from '@nestjs/mongoose';
import { Portfolio, PortfolioSchema } from '@portfolio/schemas';
import { Battle, BattleSchema } from './schemas/battle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battle.name, schema: BattleSchema }]),
    MongooseModule.forFeature([{ name: Portfolio.name, schema: PortfolioSchema }]),
    UserModule,
    ConfigModule,
    HttpModule,
    CoreModule,
    PortfolioModule,
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
    {
      provide: PortfolioModuleTokens.Repositories.PortfolioRepository,
      useClass: MongoPortfolioRepository,
    },
  ],
})
export class BattleModule {}
