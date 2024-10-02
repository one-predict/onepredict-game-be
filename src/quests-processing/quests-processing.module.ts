import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationMode } from '@common/enums';
import { isDefaultMode } from '@common/utils';
import { ModeBasedCron } from '@common/decorators';
import { EventsModule } from '@events';
import { QuestsModule } from '@quests';
import { CacheModule } from '@cache';
import { LockModule } from '@lock';
import { CoreModule } from '@core';
import { DeduplicationModule } from '@deduplication';
import { InjectCacheManager } from '@cache/decorators';
import { CacheManager } from '@cache/managers';
import { QuestActionType, QuestObjectiveType } from '@quests/enums';
import { QuestService } from '@quests/services';
import { InMemoryQuestsCatalog, QuestsCatalog } from './catalogs';
import { InjectQuestsCatalog, InjectQuestService } from './decorators';
import {
  CachedQuestService,
  DefaultDetectedQuestActionsProcessingService,
  DefaultQuestObjectiveProcessingService,
} from './services';
import { DefaultObjectiveExtractorFactory, DefaultObjectiveProcessorsFactory } from './factories';
import { EarnCoinsObjectiveProcessor, JoinTournamentObjectiveProcessor } from './objective-processors';
import { CoinsEarnedObjectiveTagsExtractor, TournamentJoinedObjectiveTagsExtractor } from './objective-tags-extractors';
import { DetectedQuestActionsProcessingConsumer, QuestObjectiveProcessingConsumer } from './consumers';
import { QuestsProcessingCacheNamespace } from './enums';
import QuestsProcessingModuleTokens from './quests-processing.module.tokens';

@Module({
  imports: [
    EventsModule,
    QuestsModule,
    LockModule,
    DeduplicationModule,
    CoreModule,
    ConfigModule,
    CacheModule.register(QuestsProcessingCacheNamespace.CompletedQuests),
    CacheModule.register(QuestsProcessingCacheNamespace.Quests),
  ],
  controllers: [],
  providers: [
    {
      provide: EarnCoinsObjectiveProcessor,
      useClass: EarnCoinsObjectiveProcessor,
    },
    {
      provide: JoinTournamentObjectiveProcessor,
      useClass: JoinTournamentObjectiveProcessor,
    },
    {
      provide: TournamentJoinedObjectiveTagsExtractor,
      useClass: TournamentJoinedObjectiveTagsExtractor,
    },
    {
      provide: CoinsEarnedObjectiveTagsExtractor,
      useClass: CoinsEarnedObjectiveTagsExtractor,
    },
    {
      provide: QuestsProcessingModuleTokens.Services.QuestsObjectiveProcessingService,
      useClass: DefaultQuestObjectiveProcessingService,
    },
    {
      provide: QuestsProcessingModuleTokens.Services.DetectedQuestActionsProcessingService,
      useClass: DefaultDetectedQuestActionsProcessingService,
    },
    {
      provide: QuestsProcessingModuleTokens.Factories.ObjectiveProcessorFactory,
      useClass: DefaultObjectiveProcessorsFactory,
    },
    {
      provide: QuestsProcessingModuleTokens.Factories.ObjectiveTagsExtractorFactory,
      useClass: DefaultObjectiveExtractorFactory,
    },
    {
      provide: QuestsProcessingModuleTokens.ObjectiveProcessors,
      useFactory: (earnCoinsProcessor, joinTournamentProcessor) => {
        return new Map([
          [QuestObjectiveType.EarnCoins, earnCoinsProcessor],
          [QuestObjectiveType.JoinTournament, joinTournamentProcessor],
        ]);
      },
      inject: [EarnCoinsObjectiveProcessor, JoinTournamentObjectiveProcessor],
    },
    {
      provide: QuestsProcessingModuleTokens.ObjectiveTagsExtractors,
      useFactory: (tournamentJoinedExtractor, coinsEarnedObjectiveTagsExtractor) => {
        return new Map([
          [QuestActionType.TournamentJoined, tournamentJoinedExtractor],
          [QuestActionType.CoinsEarned, coinsEarnedObjectiveTagsExtractor],
        ]);
      },
      inject: [TournamentJoinedObjectiveTagsExtractor, CoinsEarnedObjectiveTagsExtractor],
    },
    {
      provide: DetectedQuestActionsProcessingConsumer,
      useClass: DetectedQuestActionsProcessingConsumer,
    },
    {
      provide: QuestObjectiveProcessingConsumer,
      useClass: QuestObjectiveProcessingConsumer,
    },
    {
      provide: QuestsProcessingModuleTokens.Services.QuestService,
      useFactory: (originalQuestService: QuestService, questsCacheManager: CacheManager) => {
        return new CachedQuestService(originalQuestService, questsCacheManager);
      },
      inject: [
        QuestsModule.Tokens.Services.QuestService,
        CacheModule.getCacheManagerToken(QuestsProcessingCacheNamespace.Quests),
      ],
    },
    {
      provide: QuestsProcessingModuleTokens.Catalogs.QuestsCatalog,
      useClass: InMemoryQuestsCatalog,
    },
  ],
  exports: [],
})
export class QuestsProcessingModule implements OnModuleInit {
  public static Tokens = QuestsProcessingModuleTokens;

  constructor(
    @InjectQuestService() private readonly questService: QuestService,
    @InjectQuestsCatalog() private readonly questsCatalog: QuestsCatalog,
    @InjectCacheManager(QuestsProcessingCacheNamespace.Quests) private readonly questsCacheManager: CacheManager,
  ) {}

  public async onModuleInit() {
    if (isDefaultMode()) {
      await this.populateQuestsCache();
    }
  }

  @ModeBasedCron('*/30 * * * *', { modes: [ApplicationMode.Default] })
  public async populateQuestsCache() {
    const questsCatalogMap: Record<string, string[]> = {};

    for await (const quest of this.questService.streamAllActive()) {
      quest.objectiveTags.forEach((tag) => {
        if (!questsCatalogMap[tag]) {
          questsCatalogMap[tag] = [];
        }

        questsCatalogMap[tag].push(quest.id);
      });

      await this.questsCacheManager.set(quest.id, quest);
    }

    await this.questsCatalog.build(questsCatalogMap);
  }
}
