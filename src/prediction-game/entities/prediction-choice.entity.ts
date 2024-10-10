import { ObjectId } from 'mongodb';
import { FlattenMaps } from 'mongoose';
import { PredictionChoice } from '@prediction-game/schemas';
import { DigitalAssetPricePrediction, PredictionChoiceResult } from '@prediction-game/types';

export interface PredictionChoiceEntity {
  getId(): string;
  getUserId(): string;
  getPredictions(): DigitalAssetPricePrediction[];
  getRound(): number;
  getStreakSequence(): number;
  getResult(): PredictionChoiceResult | undefined;
  getIsAwarded(): boolean;
}

export class MongoPredictionChoiceEntity implements PredictionChoiceEntity {
  constructor(private readonly predictionsChoiceDocument: FlattenMaps<PredictionChoice> & { _id: ObjectId }) {}

  public getId() {
    return this.predictionsChoiceDocument._id.toString();
  }

  public getUserId() {
    return this.predictionsChoiceDocument.user.toString();
  }

  public getPredictions() {
    return this.predictionsChoiceDocument.predictions;
  }

  public getRound() {
    return this.predictionsChoiceDocument.round;
  }

  public getStreakSequence() {
    return this.predictionsChoiceDocument.streakSequence;
  }

  public getIsAwarded() {
    return this.predictionsChoiceDocument.isAwarded;
  }

  public getResult() {
    return this.predictionsChoiceDocument.result;
  }
}
