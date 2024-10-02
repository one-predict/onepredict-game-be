import { ObjectId } from 'mongodb';
import { FlattenMaps } from 'mongoose';
import { AnyReward } from '@rewards/types';
import { Quest } from '@quests/schemas';
import { AnyObjective } from '@quests/types';

export interface QuestEntity {
  getId(): string;
  getObjective(): AnyObjective;
  getObjectiveTags(): string[];
  getCategory(): string;
  getGroup(): string;
  getTitle(): string;
  getDescription(): string;
  getOrder(): number;
  getImageUrl(): string | undefined;
  getRewards(): AnyReward[];
  getEndsAt(): Date | undefined;
}

export class MongoQuestEntity implements QuestEntity {
  constructor(private readonly questDocument: FlattenMaps<Quest> & { _id: ObjectId }) {}

  public getId() {
    return this.questDocument._id.toString();
  }

  public getObjective() {
    return this.questDocument.objective;
  }

  public getObjectiveTags() {
    return this.questDocument.objectiveTags;
  }

  public getCategory() {
    return this.questDocument.category;
  }

  public getGroup() {
    return this.questDocument.group;
  }

  public getTitle() {
    return this.questDocument.title;
  }

  public getDescription() {
    return this.questDocument.description;
  }

  public getOrder() {
    return this.questDocument.order;
  }

  public getImageUrl() {
    return this.questDocument.imageUrl;
  }

  public getRewards() {
    return this.questDocument.rewards;
  }

  public getEndsAt() {
    return this.questDocument.endsAt;
  }
}
