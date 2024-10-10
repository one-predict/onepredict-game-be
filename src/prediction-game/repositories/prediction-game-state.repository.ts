import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { PredictionGameStateEntity, MongoPredictionGameStateEntity } from '@prediction-game/entities';
import { PredictionGameState } from '@prediction-game/schemas';

export interface UpdateGameStateEntityParams {
  lastProcessedRound?: number;
}

export interface PredictionGameStateRepository {
  findOne(): Promise<PredictionGameStateEntity | null>;
  updateOne(params: UpdateGameStateEntityParams): Promise<void>;
}

@Injectable()
export class MongoPredictionGameStateRepository implements PredictionGameStateRepository {
  public constructor(
    @InjectModel(PredictionGameState.name) private predictionGameStateModel: Model<PredictionGameState>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findOne() {
    const predictionGameStateDocument = await this.predictionGameStateModel
      .findOne()
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return predictionGameStateDocument && new MongoPredictionGameStateEntity(predictionGameStateDocument);
  }

  public async updateOne(params: UpdateGameStateEntityParams) {
    await this.predictionGameStateModel
      .updateOne({}, params, { session: this.transactionsManager.getSession() })
      .exec();
  }
}
