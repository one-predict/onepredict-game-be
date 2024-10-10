import { Injectable } from '@nestjs/common';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { PredictionStreakRepository } from '@prediction-game/repositories';
import { InjectPredictionStreakRepository, InjectPredictionStreakEntityToDtoMapper } from '@prediction-game/decorators';
import { PredictionStreakDto } from '@prediction-game/dto';
import { PredictionStreakEntityToDtoMapper } from '@prediction-game/entity-mappers';

export interface UpdatePredictionStreakParams {
  userId: string;
  sequence: number;
  predictionResults: Record<string, boolean>;
}

export interface UpdatePredictionStreakResult {
  choicesStreak: number;
  assetStreaks: Record<string, number>;
}

export interface PredictionStreakService {
  getForUser(userId: string): Promise<PredictionStreakDto | null>;
  update(params: UpdatePredictionStreakParams): Promise<UpdatePredictionStreakResult>;
}

@Injectable()
export class DefaultPredictionStreakService implements PredictionStreakService {
  constructor(
    @InjectPredictionStreakRepository()
    private readonly predictionStreakRepository: PredictionStreakRepository,
    @InjectPredictionStreakEntityToDtoMapper()
    private readonly predictionStreakEntityToDtoMapper: PredictionStreakEntityToDtoMapper,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async getForUser(userId: string) {
    const streak = await this.predictionStreakRepository.findByUserId(userId);

    return streak && this.predictionStreakEntityToDtoMapper.mapOne(streak);
  }

  public async update(params: UpdatePredictionStreakParams) {
    const nextStreak = await this.transactionsManager.useTransaction(async () => {
      const streak = await this.predictionStreakRepository.findByUserId(params.userId);

      if (!streak) {
        return this.predictionStreakRepository.createOne({
          currentSequence: params.sequence,
          user: params.userId,
        });
      }

      const isSameSequence = streak.getCurrentSequence() === params.sequence;

      const { allPredictionsCorrect, assetStreaks } = Object.keys(params.predictionResults).reduce(
        (aggregation, assetId) => {
          const currentAssetStreak = aggregation.assetStreaks[assetId] ?? 0;
          const isPredictionCorrect = params.predictionResults[assetId];

          if (isPredictionCorrect) {
            aggregation.assetStreaks[assetId] = currentAssetStreak + 1;
          } else {
            aggregation.allPredictionsCorrect = false;
          }

          return aggregation;
        },
        {
          assetStreaks: isSameSequence ? streak.getAssetStreaks() : {},
          allPredictionsCorrect: true,
        },
      );

      return this.predictionStreakRepository.updateOneById(streak.getId(), {
        choicesStreak: isSameSequence && allPredictionsCorrect ? streak.getChoicesStreak() + 1 : 0,
        currentSequence: params.sequence,
        assetStreaks,
      });
    });

    return {
      choicesStreak: nextStreak.getChoicesStreak(),
      assetStreaks: nextStreak.getAssetStreaks(),
    };
  }
}
