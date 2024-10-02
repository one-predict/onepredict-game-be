import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cursor } from '@common/data';
import { MongodbCursorAdapter } from '@common/adapters';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { Quest } from '@quests/schemas';
import { MongoQuestEntity, QuestEntity } from '@quests/entities';

export interface QuestRepository {
  findAllActiveAsCursor(currentDate: Date): Cursor<QuestEntity>;
  findAvailableForUsersByGroup(group: string, currentDate: Date): Promise<QuestEntity[]>;
  findActiveByObjectiveTags(objectiveTags: string[], currentDate: Date): Promise<QuestEntity[]>;
  findById(id: string): Promise<QuestEntity | null>;
}

@Injectable()
export class MongoQuestRepository implements QuestRepository {
  public constructor(
    @InjectModel(Quest.name) private questModel: Model<Quest>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public findAllActiveAsCursor(currentDate: Date) {
    const cursor = this.questModel
      .find({
        endsAt: { $gte: currentDate },
      })
      .session(this.transactionsManager.getSession())
      .lean()
      .cursor();

    return new MongodbCursorAdapter(cursor, (questDocument) => {
      return new MongoQuestEntity(questDocument);
    });
  }

  public async findAvailableForUsersByGroup(group: string, currentDate: Date) {
    const questDocuments = await this.questModel
      .find(
        {
          group,
          hiddenTill: { $lte: currentDate },
          endsAt: { $gte: currentDate },
        },
        undefined,
        {
          sort: { startsAt: 1 },
          session: this.transactionsManager.getSession(),
          lean: true,
        },
      )
      .exec();

    return questDocuments.map((questDocument) => new MongoQuestEntity(questDocument));
  }

  public async findActiveByObjectiveTags(objectiveTags: string[], currentDate: Date) {
    const questDocuments = await this.questModel
      .find(
        {
          objectiveTags: { $in: objectiveTags },
          endsAt: { $gte: currentDate },
        },
        { _id: 1 },
        { session: this.transactionsManager.getSession() },
      )
      .lean()
      .exec();

    return questDocuments.map((questDocument) => new MongoQuestEntity(questDocument));
  }

  public async findById(id: string) {
    const questDocument = await this.questModel
      .findById(id)
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return questDocument && new MongoQuestEntity(questDocument);
  }
}
