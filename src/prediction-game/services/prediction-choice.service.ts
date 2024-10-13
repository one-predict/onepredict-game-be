import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
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
  InjectPredictionGameCoinsCalculationStrategy,
  InjectPredictionGameRoundService,
  InjectPredictionStreakService,
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
  listLatestForUser(userId: string, limit: number): Promise<PredictionChoiceDto[]>;
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

  public async listLatestForUser(userId: string, limit: number) {
    const currentRound = this.predictionGameRoundService.getCurrentRound();
    const nextRound = currentRound + 1;

    const choices = await this.predictionChoiceRepository.findLimitedBeforeRoundByUserId(userId, nextRound, limit);

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

      const previousChoice = await this.predictionChoiceRepository.findNearestInPastByUserId(user.getId(), nextRound);

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

    for (const round of roundsToProcess) {
      const { startTimestamp, endTimestamp } = this.predictionGameRoundService.getRoundTimeBoundaries(round);

      const [roundStartSnapshot, roundEndSnapshot] = await Promise.all([
        this.digitalAssetsPricesSnapshotService.getByTimestamp(startTimestamp),
        this.digitalAssetsPricesSnapshotService.getByTimestamp(endTimestamp),
      ]);

      if (!roundStartSnapshot || !roundEndSnapshot) {
        throw new Error(`Failed to fetch snapshots for round ${round}`);
      }

      await this.processRoundChoices(round, roundStartSnapshot, roundEndSnapshot);
      await this.predictionGameRoundService.updateLastProcessedRound(round);
    }
  }

  private async processRoundChoices(
    round: number,
    startRoundSnapshot: DigitalAssetsPricesSnapshotDto,
    endRoundSnapshot: DigitalAssetsPricesSnapshotDto,
  ) {
    const roundStartPrices = startRoundSnapshot.prices;
    const roundEndPrices = endRoundSnapshot.prices;

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
    const [latestSnapshot] = await this.digitalAssetsPricesSnapshotService.listLatest(1);

    if (!latestSnapshot) {
      return [] as number[];
    }

    const lastProcessedRound = await this.predictionGameRoundService.getLastProcessedRound();
    const availableRound = this.predictionGameRoundService.getRoundByUnixTimestamp(latestSnapshot.timestamp);

    if (availableRound <= lastProcessedRound) {
      return [] as number[];
    }

    const roundsToProcess = availableRound - lastProcessedRound;

    return Array.from({ length: roundsToProcess }, (_, index) => lastProcessedRound + index);
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
