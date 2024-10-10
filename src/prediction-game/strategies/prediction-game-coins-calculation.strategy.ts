import { Injectable } from '@nestjs/common';
import { round } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { PredictionChoiceResult } from '@prediction-game/types';

export interface PredictionGameCoinsCalculationStrategy {
  calculate(
    predictionResults: Record<string, boolean>,
    assetStreaks: Record<string, number>,
    choicesStreak: number,
  ): PredictionChoiceResult;
}

@Injectable()
export class DefaultPredictionGameCoinsCalculationStrategy implements PredictionGameCoinsCalculationStrategy {
  private readonly EARNED_COINS_PRECISION = 2;
  private readonly MAX_STREAK_MULTIPLIER = 10;
  private readonly STREAK_MULTIPLIER_THRESHOLD = 3;
  private readonly INITIAL_STREAK_MULTIPLIER = 2;

  private readonly baseAssetCoins: number;

  constructor(private readonly configService: ConfigService) {
    this.baseAssetCoins = this.configService.getOrThrow<number>('PREDICTION_GAME_BASE_ASSET_COINS');
  }

  public calculate(
    predictionResults: Record<string, boolean>,
    assetsStreak: Record<string, number>,
    choicesStreak: number,
  ) {
    const predictionChoiceResult = Object.keys(predictionResults).reduce(
      (choiceResult, assetId) => {
        const assetStreak = assetsStreak[assetId] ?? 0;
        const isPredictionCorrect = predictionResults[assetId];

        const multiplier = this.getMultiplierForStreak(assetStreak);

        const earnedCoinsForAsset = isPredictionCorrect ? this.baseAssetCoins * multiplier : 0;

        choiceResult.predictionSummaries[assetId] = {
          correct: isPredictionCorrect,
          coins: earnedCoinsForAsset,
        };

        choiceResult.earnedCoins += earnedCoinsForAsset * assetStreak;

        return choiceResult;
      },
      { earnedCoins: 0, predictionSummaries: {} } as PredictionChoiceResult,
    );

    return {
      ...predictionChoiceResult,
      earnedCoins: round(predictionChoiceResult.earnedCoins * choicesStreak, this.EARNED_COINS_PRECISION),
    };
  }

  private getMultiplierForStreak(streak: number) {
    if (streak < this.STREAK_MULTIPLIER_THRESHOLD) {
      return 1;
    }

    const multiplier = streak - this.STREAK_MULTIPLIER_THRESHOLD + this.INITIAL_STREAK_MULTIPLIER;

    return Math.min(multiplier, this.MAX_STREAK_MULTIPLIER);
  }
}
