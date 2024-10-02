import { ObjectId } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { QuestProgressState } from '@quests/schemas';
import { MongoQuestProgressStateEntity, QuestProgressStateEntity } from '@quests/entities';
import { QuestProgressStatus } from '@quests/enums';
import { AnyObjectiveProcessingState } from '@quests/types';

export type FindQuestProgressStateEntitiesQuery = FindEntitiesQuery<{
  questId?: string;
  questIds?: string[];
  ownerId?: string;
}>;

export interface CreateQuestProgressStateEntityParams {
  quest: string;
  owner: string;
  status: QuestProgressStatus;
  objectiveProgressState: AnyObjectiveProcessingState | null;
  moderationEndDate?: Date;
}

export interface UpdateQuestProgressStateEntityParams {
  status?: QuestProgressStatus;
  objectiveProgressState?: AnyObjectiveProcessingState;
  moderationEndDate?: Date;
}

export interface QuestProgressStateRepository {
  find(query: FindQuestProgressStateEntitiesQuery): Promise<QuestProgressStateEntity[]>;
  create(params: CreateQuestProgressStateEntityParams): Promise<QuestProgressStateEntity>;
  findById(id: string): Promise<QuestProgressStateEntity | null>;
  updateById(id: string, params: UpdateQuestProgressStateEntityParams): Promise<QuestProgressStateEntity | null>;
}

@Injectable()
export class MongoQuestProgressStateRepository implements QuestProgressStateRepository {
  public constructor(
    @InjectModel(QuestProgressState.name) private questProgressStateModel: Model<QuestProgressState>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindQuestProgressStateEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<QuestProgressState> = {};

    if (query.filter.questId) {
      mongodbQueryFilter.quest = new ObjectId(query.filter.questId);
    }

    if (query.filter.questIds) {
      mongodbQueryFilter.quest = { $in: query.filter.questIds.map((questId) => new ObjectId(questId)) };
    }

    if (query.filter.ownerId) {
      mongodbQueryFilter.owner = new ObjectId(query.filter.ownerId);
    }

    const questProgressStateDocuments = await this.questProgressStateModel
      .find(mongodbQueryFilter, undefined, {
        skip: query.skip,
        limit: query.limit,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
        lean: true,
      })
      .exec();

    return questProgressStateDocuments.map(
      (questProgressStateDocument) => new MongoQuestProgressStateEntity(questProgressStateDocument),
    );
  }

  public async create(params: CreateQuestProgressStateEntityParams) {
    const [questProgressStateDocument] = await this.questProgressStateModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoQuestProgressStateEntity(questProgressStateDocument);
  }

  public async findById(id: string) {
    const questProgressStateDocument = await this.questProgressStateModel
      .findById(id)
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return questProgressStateDocument && new MongoQuestProgressStateEntity(questProgressStateDocument);
  }

  public async updateById(id: string, params: UpdateQuestProgressStateEntityParams) {
    const questProgressStateDocument = await this.questProgressStateModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        params,
        { new: true, session: this.transactionsManager.getSession(), lean: true },
      )
      .exec();

    return questProgressStateDocument && new MongoQuestProgressStateEntity(questProgressStateDocument);
  }
}
