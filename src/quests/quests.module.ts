import {Module} from '@nestjs/common';
import { MongooseModule} from '@nestjs/mongoose';
import {EventsModule} from '@events';
import {CoreModule} from '@core';
import {QuestController} from './controllers';
import {
  DefaultQuestProgressService,
  DefaultQuestRewardsService,
  DefaultQuestService,
  DefaultQuestVerificationService,
} from './services';
import {MongoQuestProgressStateRepository, MongoQuestRepository} from './repositories';
import {Quest, QuestProgressState, QuestProgressStateSchema, QuestSchema} from './schemas';
import {DefaultQuestEntityToDtoMapper, DefaultQuestProgressStateEntityToDtoMapper} from './entity-mappers';
import QuestsModuleTokens from './quests.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quest.name, schema: QuestSchema }]),
    MongooseModule.forFeature([{ name: QuestProgressState.name, schema: QuestProgressStateSchema }]),
    CoreModule,
    EventsModule,
  ],
  providers: [
    {
      provide: QuestsModuleTokens.Services.QuestService,
      useClass: DefaultQuestService,
    },
    {
      provide: QuestsModuleTokens.Repositories.QuestRepository,
      useClass: MongoQuestRepository,
    },
    {
      provide: QuestsModuleTokens.Repositories.QuestProgressStateRepository,
      useClass: MongoQuestProgressStateRepository,
    },
    {
      provide: QuestsModuleTokens.Services.QuestProgressService,
      useClass: DefaultQuestProgressService,
    },
    {
      provide: QuestsModuleTokens.Services.QuestRewardsService,
      useClass: DefaultQuestRewardsService,
    },
    {
      provide: QuestsModuleTokens.EntityToDtoMappers.QuestEntityToDtoMapper,
      useClass: DefaultQuestEntityToDtoMapper,
    },
    {
      provide: QuestsModuleTokens.EntityToDtoMappers.QuestProgressStateEntityToDtoMapper,
      useClass: DefaultQuestProgressStateEntityToDtoMapper,
    },
    {
      provide: QuestsModuleTokens.Services.QuestVerificationService,
      useClass: DefaultQuestVerificationService,
    },
  ],
  controllers: [QuestController],
  exports: [QuestsModuleTokens.Services.QuestService, QuestsModuleTokens.Services.QuestProgressService],
})
export class QuestsModule {
  public static Tokens = QuestsModuleTokens;
}
