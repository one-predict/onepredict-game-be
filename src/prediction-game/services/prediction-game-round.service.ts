import { Injectable } from '@nestjs/common';
import { generatePseudoRandomNumberWithSeed } from '@prng';
import { getCurrentUnixTimestamp } from '@common/utils';
import { DigitalAssetId } from '@digital-assets/enums';
import { RoundBoundaries, RoundsInfo } from '@prediction-game/types';
import { InjectPredictionGameStateRepository } from '@prediction-game/decorators';
import { PredictionGameStateRepository } from '@prediction-game/repositories';

export interface PredictionGameRoundService {
  getLastProcessedRound(): Promise<number>;
  updateLastProcessedRound(round: number): Promise<void>;
  getRoundsInfoForUser(userId: string): RoundsInfo;
  getCurrentRound(): number;
  getRoundAssetsForUser(round: number, userId: string): string[];
  getRoundTimeBoundaries(round: number): RoundBoundaries;
  getRoundByUnixTimestamp(unixTimestamp: number): number;
}

@Injectable()
export class DefaultPredictionGameRoundService implements PredictionGameRoundService {
  private readonly INITIAL_ROUND_UNIX_TIMESTAMP = 1728032400;
  private readonly ROUND_DURATION_IN_SECONDS = 3600; // 1 hour

  constructor(
    @InjectPredictionGameStateRepository()
    private readonly predictionGameStateRepository: PredictionGameStateRepository,
  ) {}

  public getRoundsInfoForUser(userId: string): RoundsInfo {
    const currentRound = this.getCurrentRound();
    const currentRoundTimeBoundaries = this.getRoundTimeBoundaries(currentRound);

    const nextRound = currentRound + 1;
    const nextRoundAssets = this.getRoundAssetsForUser(nextRound, userId);
    const nextRoundTimeBoundaries = this.getRoundTimeBoundaries(nextRound);

    return {
      currentRound,
      currentRoundTimeBoundaries,
      nextRound,
      nextRoundTimeBoundaries,
      nextRoundAssets,
    };
  }

  public async getLastProcessedRound() {
    const state = await this.predictionGameStateRepository.findOne();

    return state.getLastProcessedRound();
  }

  public async updateLastProcessedRound(round: number) {
    await this.predictionGameStateRepository.updateOne({
      lastProcessedRound: round,
    });
  }

  public getRoundAssetsForUser(round: number, userId: string) {
    const roundAssets: DigitalAssetId[] = [];

    let availableAssets = Object.values(DigitalAssetId);

    for (let i = 0; i < 3; i++) {
      const seed = `${userId}:${round}:${i}:some_secret`;
      const index = generatePseudoRandomNumberWithSeed(seed, 0, availableAssets.length - 1);

      const roundAssetId = availableAssets[index] as DigitalAssetId;

      roundAssets.push(roundAssetId);

      availableAssets = availableAssets.filter((availableAssetId) => availableAssetId !== roundAssetId);
    }

    return roundAssets;
  }

  public getRoundTimeBoundaries(round: number) {
    return {
      startTimestamp: this.INITIAL_ROUND_UNIX_TIMESTAMP + round * this.ROUND_DURATION_IN_SECONDS,
      endTimestamp: this.INITIAL_ROUND_UNIX_TIMESTAMP + (round + 1) * this.ROUND_DURATION_IN_SECONDS,
    };
  }

  public getCurrentRound() {
    const currentUnixTimestamp = getCurrentUnixTimestamp();

    return this.getRoundByUnixTimestamp(currentUnixTimestamp);
  }

  public getRoundByUnixTimestamp(unixTimestamp: number) {
    return Math.floor((unixTimestamp - this.INITIAL_ROUND_UNIX_TIMESTAMP) / this.ROUND_DURATION_IN_SECONDS);
  }
}
