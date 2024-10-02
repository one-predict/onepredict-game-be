import { keyBy } from 'lodash';
import { NotFoundException } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { QuestRepository } from '@quests/repositories';
import {
  InjectQuestEntityToDtoMapper,
  InjectQuestProgressService,
  InjectQuestRepository,
  InjectQuestProgressStateEntityToDtoMapper,
} from '@quests/decorators';
import { QuestObjectiveType } from '@quests/enums';
import { QuestProgressService } from '@quests/services';
import { QuestDto, QuestProgressDto, UserQuestDto } from '@quests/dto';
import { QuestEntityToDtoMapper, QuestProgressStateEntityToDtoMapper } from '@quests/entity-mappers';
import { DEFAULT_QUESTS_GROUP } from '@quests/constants';

export interface QuestService {
  streamAllActive(): AsyncIterable<QuestDto>;
  listActiveQuestIdsByTags(objectiveTags: string[]): Promise<string[]>;
  listAvailableUserQuests(userId: string, group?: string): Promise<UserQuestDto[]>;
  getById(id: string): Promise<QuestDto | null>;
  startQuest(questId: string, userId: string): Promise<QuestProgressDto>;
}

export class DefaultQuestService implements QuestService {
  constructor(
    @InjectQuestRepository() private readonly questRepository: QuestRepository,
    @InjectQuestProgressService() private readonly questProgressService: QuestProgressService,
    @InjectQuestEntityToDtoMapper() private readonly questEntityToDtoMapper: QuestEntityToDtoMapper,
    @InjectQuestProgressStateEntityToDtoMapper()
    private readonly questProgressStateEntityToDtoMapper: QuestProgressStateEntityToDtoMapper,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public streamAllActive() {
    return this.questRepository.findAllActiveAsCursor(new Date()).stream((quest) => {
      return this.questEntityToDtoMapper.mapOne(quest);
    });
  }

  public async listAvailableUserQuests(userId: string, group: string = DEFAULT_QUESTS_GROUP) {
    const currentDate = new Date();

    const quests = await this.questRepository.findAvailableForUsersByGroup(group, currentDate);

    const states = await this.questProgressService.getProgressForQuests(
      quests.map((quest) => quest.getId()),
      userId,
    );

    const statesByQuestId = keyBy(states, (state) => state.getQuestId());

    return quests.map((quest) => {
      const questProgressState = statesByQuestId[quest.getId()];

      return {
        ...this.questEntityToDtoMapper.mapOne(quest),
        progressState: questProgressState ? this.questProgressStateEntityToDtoMapper.mapOne(questProgressState) : null,
      };
    });
  }

  public async listActiveQuestIdsByTags(objectiveTypes: QuestObjectiveType[]) {
    const currentDate = new Date();

    const quests = await this.questRepository.findActiveByObjectiveTags(objectiveTypes, currentDate);

    return quests.map((quest) => quest.getId());
  }

  public async getById(id: string) {
    const quest = await this.questRepository.findById(id);

    return quest ? this.questEntityToDtoMapper.mapOne(quest) : null;
  }

  public async startQuest(questId: string, userId: string) {
    const quest = await this.getById(questId);

    if (!quest) {
      throw new NotFoundException(`Quest with id ${questId} not found.`);
    }

    const questProgressState = await this.transactionsManager.useTransaction(async () => {
      const existingQuestProgressState = await this.questProgressService.getProgressForQuest(questId, userId);

      if (existingQuestProgressState) {
        return existingQuestProgressState;
      }

      return this.questProgressService.create({
        questId,
        ownerId: userId,
        objective: quest.objective,
      });
    });

    return this.questProgressStateEntityToDtoMapper.mapOne(questProgressState);
  }
}
