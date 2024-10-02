import { Injectable } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectDeduplicationService } from '@deduplication/decorators';
import { DeduplicationService } from '@deduplication/services';
import { InjectCacheManager } from '@cache/decorators';
import { CacheManager } from '@cache/managers';
import { EventsService } from '@events/services';
import { InjectEventsService } from '@events/decorators';
import { AnyQuestAction } from '@quests/types';
import { ObjectiveTagsExtractorFactory } from '@quests-processing/factories';
import { QuestsCatalog } from '@quests-processing/catalogs';
import { InjectObjectiveTagsExtractorFactory, InjectQuestsCatalog } from '@quests-processing/decorators';
import {
  QuestsProcessingCacheNamespace,
  QuestsProcessingEventType,
  QuestsProcessingEventCategory,
} from '@quests-processing/enums';
import { ObjectiveTriggeredEventData } from '@quests-processing/types';
import { getCompletedQuestsCacheKey } from '@quests-processing/utils';

export interface ProcessDetectedQuestActionParams {
  action: AnyQuestAction;
  userId: string;
  detectionId: string;
}

export interface DetectedQuestActionsProcessingService {
  process(params: ProcessDetectedQuestActionParams): Promise<void>;
}

@Injectable()
export class DefaultDetectedQuestActionsProcessingService implements DetectedQuestActionsProcessingService {
  constructor(
    @InjectEventsService() private readonly eventsService: EventsService,
    @InjectObjectiveTagsExtractorFactory()
    private readonly objectiveTagsExtractorFactory: ObjectiveTagsExtractorFactory,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectDeduplicationService() private readonly deduplicationService: DeduplicationService,
    @InjectCacheManager(QuestsProcessingCacheNamespace.CompletedQuests)
    private readonly completedQuestsCacheManager: CacheManager,
    @InjectQuestsCatalog() private readonly questsCatalog: QuestsCatalog,
  ) {}

  public async process({ action, userId, detectionId }: ProcessDetectedQuestActionParams) {
    const extractor = this.objectiveTagsExtractorFactory.createExtractor(action.type);

    const objectiveTags = extractor.extract(action);

    const questIds = await this.questsCatalog.getQuestIdsByTags(objectiveTags);

    const completionCacheKeys = questIds.map((questId) => getCompletedQuestsCacheKey(questId, userId));

    const completionResults = await this.completedQuestsCacheManager.mget<boolean>(completionCacheKeys);

    const questIdsToProcess = questIds.filter((quest, index) => !completionResults[index]);

    await this.transactionsManager.useTransaction(async () => {
      await this.deduplicationService.createDeduplicationRecord(`detected-quest-actions-processing:${detectionId}`);

      await this.eventsService.batchCreate({
        batch: questIdsToProcess.map((questId) => {
          const eventData: ObjectiveTriggeredEventData = {
            objectiveQuestId: questId,
            triggerAction: action,
            userId,
          };

          return {
            type: QuestsProcessingEventType.QuestObjectiveTriggered,
            data: eventData,
            category: QuestsProcessingEventCategory.QuestsProcessing,
            userId: null,
          };
        }),
      });
    });
  }
}
