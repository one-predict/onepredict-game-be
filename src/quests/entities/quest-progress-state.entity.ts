import { ObjectId } from 'mongodb';
import { FlattenMaps } from 'mongoose';
import { QuestProgressState } from '@quests/schemas';
import { QuestProgressStatus } from '@quests/enums';
import { AnyObjectiveProcessingState } from '@quests/types';

export interface QuestProgressStateEntity {
  getId(): string;
  getQuestId(): string;
  getOwnerId(): string;
  getStatus(): QuestProgressStatus;
  getObjectiveProgressState(): AnyObjectiveProcessingState | null;
  getModerationEndDate(): Date | undefined;
}

export class MongoQuestProgressStateEntity implements QuestProgressStateEntity {
  constructor(private readonly questProgressStateDocument: FlattenMaps<QuestProgressState> & { _id: ObjectId }) {}

  public getId() {
    return this.questProgressStateDocument._id.toString();
  }

  public getQuestId() {
    return this.questProgressStateDocument.quest.toString();
  }

  public getOwnerId() {
    return this.questProgressStateDocument.owner.toString();
  }

  public getStatus() {
    return this.questProgressStateDocument.status;
  }

  public getObjectiveProgressState() {
    return this.questProgressStateDocument.objectiveProgressState;
  }

  public getModerationEndDate() {
    return this.questProgressStateDocument.moderationEndDate;
  }
}
