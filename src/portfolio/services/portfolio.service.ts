import { keyBy, round } from 'lodash';
import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { SortDirection } from '@common/enums';
import { ModeBasedCron } from '@common/decorators';
import { getCurrentUnixTimestamp, processCursor } from '@common/utils';
import { InjectUserService, UserService } from '@user';
import { InjectTokensOfferService, TokensOfferEntity, TokensOfferService } from '@offer';
import { DigitalAssetsPricesSnapshotService } from '@digital-assets/services';
import { InjectDigitalAssetsPricesSnapshotService } from '@digital-assets/decorators';
import { DigitalAssetsPricesSnapshotDto } from '@digital-assets/dto';
import { DigitalAssetPriceDirection } from '@digital-assets/enums';
import { DigitalAssetPricePrediction } from '@prediction-game/types';
import {
  InjectTournamentParticipationService,
  InjectTournamentService,
  TournamentParticipationService,
  TournamentService,
} from '@tournament';
import { InjectUserInventoryService, UserInventoryService } from '@inventory';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectPortfolioRepository } from '@portfolio/decorators';
import { FindPortfolioEntitiesQuery, PortfolioRepository } from '@portfolio/repositories';
import { PortfolioEntity } from '@portfolio/entities';
import { PortfolioSortingField } from '@portfolio/enums';
import { PortfolioResult } from '@portfolio/types';

export type ListPortfoliosParams = FindPortfolioEntitiesQuery;

export interface CreatePortfolioParams {
  userId: string;
  predictions: DigitalAssetPricePrediction[];
  tournamentId: string;
  offerId: string;
}

export interface PortfolioService {
  list(params: ListPortfoliosParams): Promise<PortfolioEntity[]>;
  create(params: CreatePortfolioParams): Promise<PortfolioEntity>;
}

@Injectable()
export class PortfolioServiceImpl implements PortfolioService {
  constructor(
    @InjectPortfolioRepository() private readonly portfolioRepository: PortfolioRepository,
    @InjectTokensOfferService() private readonly tokensOfferService: TokensOfferService,
    @InjectDigitalAssetsPricesSnapshotService()
    private readonly digitalAssetsPricesSnapshotService: DigitalAssetsPricesSnapshotService,
    @InjectUserInventoryService() private readonly userInventoryService: UserInventoryService,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectTournamentParticipationService()
    private readonly tournamentParticipationService: TournamentParticipationService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public list(params: ListPortfoliosParams) {
    return this.portfolioRepository.find(params);
  }

  public getById(id: string) {
    return this.portfolioRepository.findById(id);
  }

  public async create(params: CreatePortfolioParams) {
    const offer = await this.tokensOfferService.getById(params.offerId);

    if (!offer) {
      throw new UnprocessableEntityException(`Provided offer doesn't exist.`);
    }

    const currentTimestamp = getCurrentUnixTimestamp();

    const offerTimestamp = offer.getTimestamp();
    const offerOpensAfterTimestamp = offer.getOpensAfterTimestamp();
    const offerDurationInSeconds = offer.getDurationInSeconds();

    if (currentTimestamp >= offerTimestamp || offerOpensAfterTimestamp > currentTimestamp) {
      throw new UnprocessableEntityException('Provided offer is not available.');
    }

    const user = await this.userService.getById(params.userId);

    if (!user) {
      throw new UnprocessableEntityException(`Provided user doesn't exist.`);
    }

    const participation = await this.tournamentParticipationService.getUserParticipationInTournament(
      user.getId(),
      params.tournamentId,
    );

    if (!participation) {
      //throw new UnprocessableEntityException('User is not a participant of the tournament.');
    }

    return this.transactionsManager.useTransaction(async () => {
      const [existingPortfolio] = await this.portfolioRepository.find({
        filter: {
          userId: user.getId(),
          offerIds: [params.offerId],
        },
        limit: 1,
      });

      if (existingPortfolio) {
        throw new UnprocessableEntityException('Portfolio for this day already submitted.');
      }

      this.validatePredictions(params.predictions, offer);

      return this.portfolioRepository.createOne({
        user: params.userId,
        predictions: params.predictions,
        offer: params.offerId,
        tournament: params.tournamentId,
        intervalStartTimestamp: offerTimestamp,
        intervalEndTimestamp: offerTimestamp + offerDurationInSeconds,
        isAwarded: false,
      });
    });
  }

  @ModeBasedCron('*/30 * * * *')
  public async awardPortfolios() {
    const [latestSnapshot] = await this.digitalAssetsPricesSnapshotService.listLatest(1);

    if (!latestSnapshot) {
      return;
    }

    const cursor = this.portfolioRepository.findAsCursor({
      filter: {
        isAwarded: false,
        intervalEndsBefore: latestSnapshot.timestamp,
      },
      sort: [
        {
          field: PortfolioSortingField.IntervalStartTimestamp,
          direction: SortDirection.Ascending,
        },
      ],
    });

    let snapshotsPool: Record<string, DigitalAssetsPricesSnapshotDto>;

    await processCursor<PortfolioEntity>(cursor, async (portfolios) => {
      if (!snapshotsPool && portfolios.length) {
        const [firstAvailablePortfolio] = portfolios;
        const [startInterval] = firstAvailablePortfolio.getInterval();

        const snapshots = await this.digitalAssetsPricesSnapshotService.listInInterval(
          startInterval,
          latestSnapshot.timestamp,
        );

        snapshotsPool = keyBy(snapshots, 'timestamp');
      }

      for (const portfolio of portfolios) {
        try {
          const [intervalStartTimestamp, intervalEndTimestamp] = portfolio.getInterval();

          const intervalStartPrices = snapshotsPool[intervalStartTimestamp].prices;
          const intervalEndPrices = snapshotsPool[intervalEndTimestamp].prices;

          if (!intervalStartPrices || !intervalEndPrices) {
            continue;
          }

          const portfolioResult = portfolio.getPredictions().reduce(
            (previousResult, prediction) => {
              const startIntervalAssetPrice = intervalStartPrices[prediction.assetId];
              const endIntervalIntervalPrice = intervalEndPrices[prediction.assetId];

              const priceChange =
                ((endIntervalIntervalPrice - startIntervalAssetPrice) / startIntervalAssetPrice) * 100;

              const points = prediction.priceDirection === DigitalAssetPriceDirection.Down ? -priceChange : priceChange;

              previousResult.predictionSummaries[prediction.assetId] = {
                points,
                priceChange,
              };

              previousResult.totalPoints += points;

              return previousResult;
            },
            { totalPoints: 0, predictionSummaries: {} } as PortfolioResult,
          );

          portfolioResult.totalPoints = round(portfolioResult.totalPoints, 2);

          await this.transactionsManager.useTransaction(async () => {
            const portfolioTournamentId = portfolio.getTournamentId();
            const portfolioUserId = portfolio.getUserId();

            await this.portfolioRepository.updateOneById(portfolio.getId(), {
              isAwarded: true,
              result: portfolioResult,
            });

            await this.tournamentParticipationService.addPoints(
              portfolioUserId,
              portfolioTournamentId,
              portfolioResult.totalPoints,
            );
          });
        } catch (error) {
          Logger.error(`Failed to award portfolio with ${portfolio.getId()} id: `, error);
        }
      }
    });
  }

  private validatePredictions(predictions: DigitalAssetPricePrediction[], offer: TokensOfferEntity) {
    const availableAssets = new Set(offer.getAssets());

    const allAssetsAreCorrect = predictions.every((prediction) => availableAssets.has(prediction.assetId));

    if (!allAssetsAreCorrect) {
      throw new BadRequestException('Provided predictions are not valid.');
    }
  }
}
