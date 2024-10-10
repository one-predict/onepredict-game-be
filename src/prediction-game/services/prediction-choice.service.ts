import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { keyBy } from 'lodash';
import { ModeBasedCron } from '@common/decorators';
import { processCursor } from '@common/utils';
import { InjectUserService, UserService } from '@user';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectDigitalAssetsPricesSnapshotService } from '@digital-assets/decorators';
import { DigitalAssetsPricesSnapshotService } from '@digital-assets/services';
import { PredictionGameRoundService, PredictionStreakService } from '@prediction-game/services';
import { PredictionChoiceRepository } from '@prediction-game/repositories';
import {
  InjectPredictionChoiceEntityToDtoMapper,
  InjectPredictionChoiceRepository,
  InjectPredictionGameRoundService,
  InjectPredictionStreakService,
  InjectPredictionGameCoinsCalculationStrategy,
} from '@prediction-game/decorators';
import { DigitalAssetPricePrediction } from '@prediction-game/types';
import { PredictionChoiceDto } from '@prediction-game/dto';
import { PredictionChoiceEntityToDtoMapper } from '@prediction-game/entity-mappers';
import { PredictionChoiceEntity } from '@prediction-game/entities';
import { DigitalAssetsPricesSnapshotDto } from '@digital-assets/dto';
import { PredictionGameCoinsCalculationStrategy } from '@prediction-game/strategies';
import { getPredictionResultsForRound } from '@prediction-game/utils';

export interface SubmitTokensPredictionChoiceParams {
  userId: string;
  predictions: DigitalAssetPricePrediction[];
  round: number;
}

export interface PredictionChoiceService {
  listForLatestRounds(limit: number): Promise<PredictionChoiceDto[]>;
  submit(params: SubmitTokensPredictionChoiceParams): Promise<PredictionChoiceDto>;
}

@Injectable()
export class DefaultPredictionChoiceService implements PredictionChoiceService {
  private readonly INITIAL_STREAK_SEQUENCE = 1;
  private readonly MAX_STREAK_INACTIVITY_ROUNDS = 8;

  constructor(
    @InjectPredictionChoiceRepository() private readonly predictionChoiceRepository: PredictionChoiceRepository,
    @InjectDigitalAssetsPricesSnapshotService()
    private readonly digitalAssetsPricesSnapshotService: DigitalAssetsPricesSnapshotService,
    @InjectUserService() private readonly userService: UserService,
    @InjectPredictionGameRoundService() private readonly predictionGameRoundService: PredictionGameRoundService,
    @InjectPredictionStreakService() private readonly predictionStreakService: PredictionStreakService,
    @InjectPredictionChoiceEntityToDtoMapper()
    private readonly predictionChoiceEntityToDtoMapper: PredictionChoiceEntityToDtoMapper,
    @InjectPredictionGameCoinsCalculationStrategy()
    private readonly predictionGameCoinsCalculationStrategy: PredictionGameCoinsCalculationStrategy,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async listForLatestRounds(limit: number) {
    const currentRound = this.predictionGameRoundService.getCurrentRound();
    const nextRound = currentRound + 1;

    const choices = await this.predictionChoiceRepository.findLimitedBeforeRound(nextRound, limit);

    return this.predictionChoiceEntityToDtoMapper.mapMany(choices);
  }

  public async submit(params: SubmitTokensPredictionChoiceParams) {
    const currentRound = this.predictionGameRoundService.getCurrentRound();
    const nextRound = currentRound + 1;

    if (params.round !== nextRound) {
      throw new UnprocessableEntityException('Provided round is not available.');
    }

    const user = await this.userService.getById(params.userId);

    if (!user) {
      throw new UnprocessableEntityException(`Provided user doesn't exist.`);
    }

    this.validateProvidedPredictions(params.round, params.userId, params.predictions);

    const choice = await this.transactionsManager.useTransaction(async () => {
      const existingChoice = await this.predictionChoiceRepository.findOneByUserIdAndRound(user.getId(), nextRound);

      if (existingChoice) {
        return this.predictionChoiceRepository.updateOneById(existingChoice.getId(), {
          predictions: params.predictions,
        });
      }

      const previousChoice = await this.predictionChoiceRepository.findNearestInPast(user.getId(), nextRound);

      return this.predictionChoiceRepository.createOne({
        user: params.userId,
        round: nextRound,
        predictions: params.predictions,
        streakSequence: this.getChoiceStreakSequence(nextRound, previousChoice),
      });
    });

    return this.predictionChoiceEntityToDtoMapper.mapOne(choice);
  }

  @ModeBasedCron('*/15 * * * *')
  public async processRounds() {
    const roundsToProcess = await this.determineRoundsToProcess();

    if (!roundsToProcess.length) {
      return;
    }

    const snapshots = await this.loadSnapshotsForRounds(roundsToProcess);

    for (const round of roundsToProcess) {
      await this.processRoundChoices(round, snapshots);
      await this.predictionGameRoundService.updateLastProcessedRound(round);
    }
  }

  private async processRoundChoices(round: number, snapshots: Record<string, DigitalAssetsPricesSnapshotDto>) {
    const { startTimestamp: roundStartTimestamp, endTimestamp: roundEndTimestamp } =
      this.predictionGameRoundService.getRoundTimeBoundaries(round);

    const roundStartPrices = snapshots[roundStartTimestamp].prices;
    const roundEndPrices = snapshots[roundEndTimestamp].prices;

    if (!roundStartPrices || !roundEndPrices) {
      return;
    }

    const cursor = this.predictionChoiceRepository.findNonAwardedByRoundAsCursor(round);

    const erroredChoiceIds: string[] = [];

    await processCursor<PredictionChoiceEntity>(cursor, async (choices) => {
      await Promise.all(
        choices.map(async (choice) => {
          try {
            await this.processChoice(choice, roundStartPrices, roundEndPrices);
          } catch (error) {
            erroredChoiceIds.push(choice.getId());

            Logger.error(`Failed to award prediction choice with ${choice.getId()} id: `, error);
          }
        }),
      );
    });

    if (erroredChoiceIds.length) {
      throw new Error(`Failed to award prediction choices for round ${round} with ids: ${erroredChoiceIds}`);
    }
  }

  private async processChoice(
    choice: PredictionChoiceEntity,
    roundStartPrices: Record<string, number>,
    roundEndPrices: Record<string, number>,
  ) {
    const choiceUserId = choice.getUserId();

    const predictionResults = getPredictionResultsForRound(choice.getPredictions(), roundStartPrices, roundEndPrices);

    await this.transactionsManager.useTransaction(async () => {
      const { choicesStreak, assetStreaks } = await this.predictionStreakService.update({
        userId: choiceUserId,
        sequence: choice.getStreakSequence(),
        predictionResults,
      });

      const choiceResult = await this.predictionGameCoinsCalculationStrategy.calculate(
        predictionResults,
        assetStreaks,
        choicesStreak,
      );

      await this.predictionChoiceRepository.updateOneById(choice.getId(), {
        isAwarded: true,
        result: choiceResult,
      });

      if (choiceResult.earnedCoins) {
        await this.userService.addCoins(choiceUserId, choiceResult.earnedCoins);
      }
    });
  }

  private validateProvidedPredictions(round: number, userId: string, predictions: DigitalAssetPricePrediction[]) {
    const assets = new Set(this.predictionGameRoundService.getRoundAssetsForUser(round, userId));

    const allAssetsAreCorrect = predictions.every((prediction) => assets.has(prediction.assetId));

    if (!allAssetsAreCorrect) {
      throw new BadRequestException('Provided predictions are not valid.');
    }
  }

  private async determineRoundsToProcess() {
    const lastProcessedRound = await this.predictionGameRoundService.getLastProcessedRound();
    const currentRound = this.predictionGameRoundService.getCurrentRound();

    const nextRoundToProcess = lastProcessedRound + 1;

    if (nextRoundToProcess >= currentRound) {
      return [] as number[];
    }

    const roundsToProcess = currentRound - nextRoundToProcess;

    return Array.from({ length: roundsToProcess }, (_, index) => nextRoundToProcess + index);
  }

  private async loadSnapshotsForRounds(roundsToProcess: number[]) {
    const { startTimestamp } = this.predictionGameRoundService.getRoundTimeBoundaries(roundsToProcess[0]);
    const { endTimestamp } = this.predictionGameRoundService.getRoundTimeBoundaries(
      roundsToProcess[roundsToProcess.length - 1],
    );

    const snapshots = await this.digitalAssetsPricesSnapshotService.listInInterval(startTimestamp, endTimestamp);

    return keyBy(snapshots, 'timestamp');
  }

  private getChoiceStreakSequence(choiceRound: number, previousChoice: PredictionChoiceEntity) {
    if (!previousChoice) {
      return this.INITIAL_STREAK_SEQUENCE;
    }

    const roundDifference = choiceRound - previousChoice.getRound();

    return roundDifference > this.MAX_STREAK_INACTIVITY_ROUNDS
      ? previousChoice.getStreakSequence() + 1
      : previousChoice.getStreakSequence();
  }
}
