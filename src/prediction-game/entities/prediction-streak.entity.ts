import { ObjectId } from 'mongodb';
import { FlattenMaps } from 'mongoose';
import { PredictionStreak } from '@prediction-game/schemas';

export interface PredictionStreakEntity {
  getId(): string;
  getUserId(): string;
  getAssetStreaks(): Record<string, number>;
  getChoicesStreak(): number;
  getCurrentSequence(): number;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
}

export class MongoPredictionStreakEntity implements PredictionStreakEntity {
  constructor(private readonly predictionStreakDocument: FlattenMaps<PredictionStreak> & { _id: ObjectId }) {}

  public getId() {
    return this.predictionStreakDocument._id.toString();
  }

  public getUserId() {
    return this.predictionStreakDocument.user.toString();
  }

  public getAssetStreaks() {
    return this.predictionStreakDocument.assetStreaks;
  }

  public getChoicesStreak() {
    return this.predictionStreakDocument.choicesStreak;
  }

  public getCurrentSequence() {
    return this.predictionStreakDocument.currentSequence;
  }

  public getCreatedAt() {
    return this.predictionStreakDocument.createdAt;
  }

  public getUpdatedAt() {
    return this.predictionStreakDocument.updatedAt;
  }
}
