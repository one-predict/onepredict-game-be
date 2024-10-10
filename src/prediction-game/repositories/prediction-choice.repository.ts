import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cursor } from '@common/data';
import { MongodbCursorAdapter } from '@common/adapters';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { MongoPredictionChoiceEntity, PredictionChoiceEntity } from '@prediction-game/entities';
import { PredictionChoice } from '@prediction-game/schemas';
import { DigitalAssetPricePrediction, PredictionChoiceResult } from '@prediction-game/types';

export interface CreatePredictionChoiceEntityParams {
  user: string;
  predictions: DigitalAssetPricePrediction[];
  round: number;
  streakSequence: number;
}

export interface UpdatePredictionChoiceEntityParams {
  earnedCoins?: number;
  predictions?: DigitalAssetPricePrediction[];
  result?: PredictionChoiceResult;
  isAwarded?: boolean;
}

export interface PredictionChoiceRepository {
  findOneByUserIdAndRound(userId: string, round: number): Promise<PredictionChoiceEntity | null>;
  findLimitedBeforeRound(round: number, limit: number): Promise<PredictionChoiceEntity[]>;
  findNearestInPast(userId: string, round: number): Promise<PredictionChoiceEntity | null>;
  findNonAwardedByRoundAsCursor(round: number): Cursor<PredictionChoiceEntity>;
  createOne(params: CreatePredictionChoiceEntityParams): Promise<PredictionChoiceEntity>;
  updateOneById(id: string, params: UpdatePredictionChoiceEntityParams): Promise<PredictionChoiceEntity | null>;
}

@Injectable()
export class MongoPredictionChoiceRepository implements PredictionChoiceRepository {
  public constructor(
    @InjectModel(PredictionChoice.name) private predictionChoiceModel: Model<PredictionChoice>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findNearestInPast(userId: string, round: number) {
    const predictionChoiceDocument = await this.predictionChoiceModel
      .findOne({ user: new ObjectId(userId), round: { $lt: round } })
      .sort({ round: -1 })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return predictionChoiceDocument && new MongoPredictionChoiceEntity(predictionChoiceDocument);
  }

  public async findOneByUserIdAndRound(userId: string, round: number) {
    const predictionChoiceDocument = await this.predictionChoiceModel
      .findOne({ user: new ObjectId(userId), round })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return predictionChoiceDocument && new MongoPredictionChoiceEntity(predictionChoiceDocument);
  }

  public async findLimitedBeforeRound(round: number, limit: number) {
    const predictionChoiceDocuments = await this.predictionChoiceModel
      .find({ round: { $lte: round } })
      .sort({ round: -1 })
      .limit(limit)
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return predictionChoiceDocuments.map((predictionChoiceDocument) => {
      return new MongoPredictionChoiceEntity(predictionChoiceDocument);
    });
  }

  public findNonAwardedByRoundAsCursor(round: number) {
    const cursor = this.predictionChoiceModel
      .find({ round, awarded: false })
      .session(this.transactionsManager.getSession())
      .lean()
      .cursor();

    return new MongodbCursorAdapter(cursor, (predictionChoiceDocument) => {
      return new MongoPredictionChoiceEntity(predictionChoiceDocument);
    });
  }

  public async createOne(params: CreatePredictionChoiceEntityParams) {
    const [predictionChoiceDocument] = await this.predictionChoiceModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoPredictionChoiceEntity(predictionChoiceDocument);
  }

  public async updateOneById(id: string, params: UpdatePredictionChoiceEntityParams) {
    const predictionChoiceDocument = await this.predictionChoiceModel
      .findByIdAndUpdate(id, params, {
        new: true,
        session: this.transactionsManager.getSession(),
        lean: true,
      })
      .exec();

    return predictionChoiceDocument && new MongoPredictionChoiceEntity(predictionChoiceDocument);
  }
}
