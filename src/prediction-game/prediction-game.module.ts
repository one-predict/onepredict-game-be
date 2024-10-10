import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { DigitalAssetsModule } from '@digital-assets';
import { UserModule } from '@user';
import {
  PredictionChoice,
  PredictionStreak,
  PredictionGameState,
  PredictionChoiceSchema,
  PredictionStreakSchema,
  PredictionGameStateSchema,
} from './schemas';
import {
  MongoPredictionChoiceRepository,
  MongoPredictionStreakRepository,
  MongoPredictionGameStateRepository,
} from './repositories';
import {
  DefaultPredictionChoiceService,
  DefaultPredictionGameRoundService,
  DefaultPredictionStreakService,
} from './services';
import { PredictionChoiceController, PredictionGameRoundController, PredictionStreakController } from './controllers';
import { DefaultPredictionChoiceEntityToDtoMapper, DefaultPredictionStreakEntityToDtoMapper } from './entity-mappers';
import { DefaultPredictionGameCoinsCalculationStrategy } from './strategies';
import PredictionGameModuleTokens from './prediction-game.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PredictionChoice.name, schema: PredictionChoiceSchema }]),
    MongooseModule.forFeature([{ name: PredictionStreak.name, schema: PredictionStreakSchema }]),
    MongooseModule.forFeature([{ name: PredictionGameState.name, schema: PredictionGameStateSchema }]),
    DigitalAssetsModule,
    CoreModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [PredictionChoiceController, PredictionGameRoundController, PredictionStreakController],
  providers: [
    {
      provide: PredictionGameModuleTokens.Services.PredictionChoiceService,
      useClass: DefaultPredictionChoiceService,
    },
    {
      provide: PredictionGameModuleTokens.Services.PredictionGameRoundService,
      useClass: DefaultPredictionGameRoundService,
    },
    {
      provide: PredictionGameModuleTokens.Services.PredictionStreakService,
      useClass: DefaultPredictionStreakService,
    },
    {
      provide: PredictionGameModuleTokens.Repositories.PredictionChoiceRepository,
      useClass: MongoPredictionChoiceRepository,
    },
    {
      provide: PredictionGameModuleTokens.Repositories.PredictionStreakRepository,
      useClass: MongoPredictionStreakRepository,
    },
    {
      provide: PredictionGameModuleTokens.Repositories.PredictionGameStateRepository,
      useClass: MongoPredictionGameStateRepository,
    },
    {
      provide: PredictionGameModuleTokens.EntityToDtoMappers.PredictionChoiceEntityToDtoMapper,
      useClass: DefaultPredictionChoiceEntityToDtoMapper,
    },
    {
      provide: PredictionGameModuleTokens.EntityToDtoMappers.PredictionStreakEntityToDtoMapper,
      useClass: DefaultPredictionStreakEntityToDtoMapper,
    },
    {
      provide: PredictionGameModuleTokens.Strategies.PredictionGameCoinsCalculationStrategy,
      useClass: DefaultPredictionGameCoinsCalculationStrategy,
    },
  ],
  exports: [PredictionGameModuleTokens.Services.PredictionChoiceService],
})
export class PredictionGameModule {}
