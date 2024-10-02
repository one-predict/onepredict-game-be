import {
  InjectQuestService,
  InjectQuestProgressService,
  InjectQuestProgressStateEntityToDtoMapper,
} from '@quests/decorators';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { QuestProgressService, QuestService } from '@quests/services';
import { QuestProgressStatus } from '@quests/enums';
import { QuestProgressDto } from '@quests/dto';
import { QuestProgressStateEntityToDtoMapper } from '@quests/entity-mappers';
import { getSecondsDifference } from '@common/utils';

export interface QuestVerificationService {
  verify(questId: string, userId: string): Promise<QuestProgressDto>;
}

export class DefaultQuestVerificationService implements QuestVerificationService {
  constructor(
    @InjectQuestService() private readonly questService: QuestService,
    @InjectQuestProgressService() private readonly questProgressService: QuestProgressService,
    @InjectQuestProgressStateEntityToDtoMapper()
    private readonly questProgressStateEntityToDtoMapper: QuestProgressStateEntityToDtoMapper,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async verify(questId: string, userId: string) {
    const quest = await this.questService.getById(questId);

    if (!quest) {
      throw new NotFoundException(`Quest with id ${questId} not found.`);
    }

    return this.transactionsManager.useTransaction(async () => {
      const questProgressState = await this.questProgressService.getProgressForQuest(questId, userId);

      if (!questProgressState) {
        throw new UnprocessableEntityException(`Quest progress for this quest is not found.`);
      }

      if (questProgressState.getStatus() !== QuestProgressStatus.Moderating) {
        throw new UnprocessableEntityException(`You cannot verify this quest.`);
      }

      const currentDate = new Date();
      const moderationEndDate = questProgressState.getModerationEndDate();

      if (moderationEndDate && moderationEndDate > currentDate) {
        const secondsLeft = getSecondsDifference(moderationEndDate, currentDate);

        throw new UnprocessableEntityException(
          `This quest cannot be verified now. Please try again in ${secondsLeft} seconds`,
        );
      }

      const updatedQuestProgressState = await this.questProgressService.update(questProgressState.getId(), {
        status: QuestProgressStatus.WaitingForClaim,
      });

      return this.questProgressStateEntityToDtoMapper.mapOne(updatedQuestProgressState ?? questProgressState);
    });
  }
}
