import { Injectable } from '@nestjs/common';
import { EventsService } from '@events/services';
import { InjectEventsService } from '@events/decorators';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { QuestProgressStateRepository, QuestRepository } from '@quests/repositories';
import { InjectQuestProgressStateRepository, InjectQuestRepository } from '@quests/decorators';
import { QuestProgressStateEntity } from '@quests/entities';
import { QuestProgressStatus, ObjectiveVerificationType } from '@quests/enums';
import { AnyObjective, AnyObjectiveProcessingState } from '@quests/types';
import { addMinutesToDate } from '@common/utils';

export interface CreateQuestProgressStateParams {
  questId: string;
  ownerId: string;
  objective: AnyObjective;
}

export interface UpdateQuestProgressStateEntityParams {
  status?: QuestProgressStatus;
  objectiveProgressState?: AnyObjectiveProcessingState;
}

export interface QuestProgressService {
  getProgressForQuest(questId: string, userId: string): Promise<QuestProgressStateEntity | null>;
  getProgressForQuests(questIds: string[], userId: string): Promise<QuestProgressStateEntity[]>;
  create(params: CreateQuestProgressStateParams): Promise<QuestProgressStateEntity>;
  update(id: string, params: UpdateQuestProgressStateEntityParams): Promise<QuestProgressStateEntity | null>;
}

@Injectable()
export class DefaultQuestProgressService implements QuestProgressService {
  private MINUTES_FOR_MODERATION = 0.5;

  constructor(
    @InjectQuestRepository() private readonly questRepository: QuestRepository,
    @InjectQuestProgressStateRepository() private readonly questProgressStateRepository: QuestProgressStateRepository,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectEventsService() private readonly eventsService: EventsService,
  ) {}

  public async getProgressForQuest(questId: string, ownerId: string) {
    const [questProgressState] = await this.questProgressStateRepository.find({
      filter: {
        questId,
        ownerId,
      },
      limit: 1,
    });

    return questProgressState ?? null;
  }

  public async getProgressForQuests(questIds: string[], ownerId: string) {
    return this.questProgressStateRepository.find({
      filter: {
        questIds,
        ownerId,
      },
    });
  }

  public create(params: CreateQuestProgressStateParams) {
    const initialStatus = this.getInitialProgressStatus(params.objective);

    const currentDate = new Date();

    return this.questProgressStateRepository.create({
      quest: params.questId,
      owner: params.ownerId,
      status: initialStatus,
      objectiveProgressState: null,
      moderationEndDate:
        initialStatus === QuestProgressStatus.Moderating
          ? addMinutesToDate(currentDate, this.MINUTES_FOR_MODERATION)
          : undefined,
    });
  }

  public async update(id: string, params: UpdateQuestProgressStateEntityParams) {
    return this.transactionsManager.useTransaction(async () => {
      const userQuestState = await this.questProgressStateRepository.findById(id);

      if (!userQuestState) {
        return null;
      }

      return this.questProgressStateRepository.updateById(id, params);
    });
  }

  private getInitialProgressStatus(objective: AnyObjective) {
    if (objective.verificationType === ObjectiveVerificationType.Moderation) {
      return QuestProgressStatus.Moderating;
    }

    return QuestProgressStatus.InProgress;
  }
}
