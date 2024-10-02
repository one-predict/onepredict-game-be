import { Injectable } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectQuestProgressService } from '@quests/decorators';
import { QuestService, QuestProgressService } from '@quests/services';
import { AnyQuestAction } from '@quests/types';
import { QuestProgressStatus } from '@quests/enums';
import { QuestDto } from '@quests/dto';
import { InjectLockService } from '@lock/decorators';
import { LockService } from '@lock/services';
import { DeduplicationService } from '@deduplication/services';
import { InjectDeduplicationService } from '@deduplication/decorators';
import { InjectCacheManager } from '@cache/decorators';
import { CacheManager } from '@cache/managers';
import { InjectObjectiveProcessorFactory, InjectQuestService } from '@quests-processing/decorators';
import { ObjectiveProcessorFactory } from '@quests-processing/factories';
import { QuestsProcessingCacheNamespace } from '@quests-processing/enums';
import { getCompletedQuestsCacheKey } from '@quests-processing/utils';

export interface ProcessQuestObjectiveParams {
  processingId: string;
  questId: string;
  userId: string;
  action: AnyQuestAction;
}

export interface QuestObjectiveProcessingService {
  process(params: ProcessQuestObjectiveParams): Promise<void>;
}

@Injectable()
export class DefaultQuestObjectiveProcessingService implements QuestObjectiveProcessingService {
  private readonly LOCK_TIMEOUT = 5000;

  constructor(
    @InjectLockService() private readonly lockService: LockService,
    @InjectQuestService() private readonly questService: QuestService,
    @InjectQuestProgressService() private readonly questProgressStateService: QuestProgressService,
    @InjectObjectiveProcessorFactory() private readonly objectiveProcessorFactory: ObjectiveProcessorFactory,
    @InjectDeduplicationService() private deduplicationService: DeduplicationService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectCacheManager(QuestsProcessingCacheNamespace.CompletedQuests)
    private readonly completedQuestsCacheManager: CacheManager,
  ) {}

  public async process({ questId, userId, action, processingId }: ProcessQuestObjectiveParams) {
    const quest = await this.questService.getById(questId);

    if (!quest) {
      return;
    }

    const objective = quest.objective;
    const processor = this.objectiveProcessorFactory.createProcessor(objective.type);

    const updatedQuestProgressState = await this.lockService.lock(
      [`${questId}:${userId}`],
      async () => {
        return this.transactionsManager.useTransaction(async () => {
          let questProgressState = await this.questProgressStateService.getProgressForQuest(questId, userId);

          if (!questProgressState) {
            questProgressState = await this.questProgressStateService.create({
              questId,
              ownerId: userId,
              objective,
            });
          }

          if (questProgressState.getStatus() !== QuestProgressStatus.InProgress) {
            return questProgressState;
          }

          await this.deduplicationService.createDeduplicationRecord(`objective-processing:${processingId}`);

          const objectiveProgressState = questProgressState.getObjectiveProgressState();

          const { completed, nextState } = await processor.process(objectiveProgressState, action, objective);

          if (nextState || completed) {
            return this.questProgressStateService.update(questProgressState.getId(), {
              status: this.getNextStatus(quest, completed),
              objectiveProgressState: nextState,
            });
          }

          return questProgressState;
        });
      },
      this.LOCK_TIMEOUT,
    );

    if (updatedQuestProgressState.getStatus() !== QuestProgressStatus.InProgress) {
      await this.completedQuestsCacheManager.set(getCompletedQuestsCacheKey(questId, userId), true);
    }
  }

  private getNextStatus(quest: QuestDto, completed: boolean) {
    if (!completed) {
      return QuestProgressStatus.InProgress;
    }

    return quest.rewards.length ? QuestProgressStatus.WaitingForClaim : QuestProgressStatus.Completed;
  }
}
