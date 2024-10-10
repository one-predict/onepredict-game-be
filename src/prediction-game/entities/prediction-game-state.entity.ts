import { ObjectId } from 'mongodb';
import { FlattenMaps } from 'mongoose';
import { PredictionGameState } from '@prediction-game/schemas';

export interface PredictionGameStateEntity {
  getLastProcessedRound(): number;
}

export class MongoPredictionGameStateEntity implements PredictionGameStateEntity {
  constructor(private readonly predictionGameStateDocument: FlattenMaps<PredictionGameState> & { _id: ObjectId }) {}

  public getLastProcessedRound() {
    return this.predictionGameStateDocument.lastProcessedRound;
  }
}
