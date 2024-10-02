import {
  InjectQuestService,
  InjectQuestProgressService,
  InjectQuestProgressStateEntityToDtoMapper,
} from '@quests/decorators';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AnyReward } from '@rewards/types';
import { EventsService } from '@events/services';
import { InjectEventsService } from '@events/decorators';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { QuestProgressService, QuestService } from '@quests/services';
import { QuestProgressStatus } from '@quests/enums';
import { generateRewardsIssuedEvent } from '@rewards/utils';
import { QuestProgressDto } from '@quests/dto';
import { QuestProgressStateEntityToDtoMapper } from '@quests/entity-mappers';

export interface ClaimQuestRewardsResult {
  rewards: AnyReward[];
  progressState: QuestProgressDto;
}

export interface QuestsRewardsService {
  claimReward(questId: string, userId: string): Promise<ClaimQuestRewardsResult>;
}

export class DefaultQuestRewardsService implements QuestsRewardsService {
  constructor(
    @InjectQuestService() private readonly questService: QuestService,
    @InjectQuestProgressService() private readonly questProgressService: QuestProgressService,
    @InjectEventsService() private readonly eventsService: EventsService,
    @InjectQuestProgressStateEntityToDtoMapper()
    private readonly questProgressStateEntityToDtoMapper: QuestProgressStateEntityToDtoMapper,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async claimReward(questId: string, userId: string) {
    const quest = await this.questService.getById(questId);

    if (!quest) {
      throw new NotFoundException(`Quest with id ${questId} not found.`);
    }

    return this.transactionsManager.useTransaction(async () => {
      const questProgress = await this.questProgressService.getProgressForQuest(questId, userId);

      if (!questProgress) {
        throw new UnprocessableEntityException(`Quest progress for quest with id ${questId} not found.`);
      }

      if (questProgress.getStatus() !== QuestProgressStatus.WaitingForClaim) {
        throw new UnprocessableEntityException(`Quest with id ${questId} is not completed yet.`);
      }

      const updatedQuestProgress = await this.questProgressService.update(questProgress.getId(), {
        status: QuestProgressStatus.Completed,
      });

      await this.eventsService.create(generateRewardsIssuedEvent(quest.rewards, userId));

      return {
        rewards: quest.rewards,
        progressState: this.questProgressStateEntityToDtoMapper.mapOne(updatedQuestProgress ?? questProgress),
      };
    });
  }
}
