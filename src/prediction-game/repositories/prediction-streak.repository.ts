import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { PredictionStreakEntity, MongoPredictionStreakEntity } from '@prediction-game/entities';
import { PredictionStreak } from '@prediction-game/schemas';

export interface CreatePredictionStreakEntityParams {
  user: string;
  currentSequence: number;
}

export interface UpdatePredictionStreakEntityParams {
  currentSequence?: number;
  choicesStreak?: number;
  assetStreaks?: Record<string, number>;
}

export interface PredictionStreakRepository {
  findByUserId(userId: string): Promise<PredictionStreakEntity | null>;
  createOne(params: CreatePredictionStreakEntityParams): Promise<PredictionStreakEntity>;
  updateOneById(id: string, params: UpdatePredictionStreakEntityParams): Promise<PredictionStreakEntity | null>;
}

@Injectable()
export class MongoPredictionStreakRepository implements PredictionStreakRepository {
  public constructor(
    @InjectModel(PredictionStreak.name) private predictionStreakModel: Model<PredictionStreak>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByUserId(userId: string) {
    const predictionStreakDocument = await this.predictionStreakModel
      .findOne({ user: new ObjectId(userId) })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return predictionStreakDocument && new MongoPredictionStreakEntity(predictionStreakDocument);
  }

  public async createOne(params: CreatePredictionStreakEntityParams) {
    const [predictionStreakDocument] = await this.predictionStreakModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoPredictionStreakEntity(predictionStreakDocument);
  }

  public async updateOneById(id: string, params: UpdatePredictionStreakEntityParams) {
    const predictionStreakDocument = await this.predictionStreakModel
      .findOneAndUpdate({ _id: new ObjectId(id) }, params)
      .session(this.transactionsManager.getSession())
      .exec();

    return predictionStreakDocument && new MongoPredictionStreakEntity(predictionStreakDocument);
  }
}
