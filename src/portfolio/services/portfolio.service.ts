import { round } from 'lodash';
import { Cron } from '@nestjs/schedule';
import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SortDirection } from '@common/enums';
import { getCurrentUnixTimestamp, processCursor } from '@common/utils';
import { InjectUserService, UserService } from '@user';
import {
  InjectTournamentDeckService,
  InjectTournamentParticipationService,
  InjectTournamentService,
  TournamentDeckService,
  TournamentParticipationService,
  TournamentService,
} from '@tournament';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import {
  InjectCoinsPricingService,
  InjectTokensOfferService,
  CoinsPricingService,
  TokensOfferService,
  TokensOfferEntity,
  CoinsPricingRecordEntity,
  CoinsPricingRecordSortField,
} from '@coin';
import { InjectPortfolioRepository } from '@portfolio/decorators';
import { FindPortfolioEntitiesQuery, PortfolioRepository } from '@portfolio/repositories';
import { PortfolioEntity } from '@portfolio/entities';
import { SelectedPortfolioToken } from '@portfolio/schemas';
import { PortfolioSortingField } from '@portfolio/enums';
import { GameCardId } from '@card';

export type ListPortfoliosParams = FindPortfolioEntitiesQuery;

export interface CreatePortfolioParams {
  userId: string;
  selectedTokens: SelectedPortfolioToken[];
  offerId: string;
}

export interface UpdatePortfolioCardsParams {
  cardsToAdd: GameCardId[];
  cardsToRemove: GameCardId[];
}

export interface PortfolioService {
  list(params: ListPortfoliosParams): Promise<PortfolioEntity[]>;
  create(params: CreatePortfolioParams): Promise<PortfolioEntity>;
  updateCards(portfolioId: string, params: UpdatePortfolioCardsParams): Promise<PortfolioEntity>;
}

@Injectable()
export class PortfolioServiceImpl implements PortfolioService {
  constructor(
    @InjectPortfolioRepository() private readonly portfolioRepository: PortfolioRepository,
    @InjectTokensOfferService() private readonly tokensOfferService: TokensOfferService,
    @InjectCoinsPricingService() private readonly coinsPricingService: CoinsPricingService,
    @InjectTournamentService() private readonly tournamentService: TournamentService,
    @InjectTournamentParticipationService()
    private readonly tournamentParticipationService: TournamentParticipationService,
    @InjectUserService() private readonly userService: UserService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectTournamentDeckService() private readonly tournamentDeckService: TournamentDeckService,
  ) {}

  public list(params: ListPortfoliosParams) {
    return this.portfolioRepository.find(params);
  }

  public getById(id: string) {
    return this.portfolioRepository.findById(id);
  }

  public async getByIdIfExists(id: string) {
    const portfolio = await this.getById(id);

    if (!portfolio) {
      throw new NotFoundException('Portfolio is not found.');
    }

    return portfolio;
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
      offer.getTournamentId(),
    );

    if (!participation) {
      throw new UnprocessableEntityException('User is not a participant of the tournament.');
    }

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

    this.validateSelectedTokens(params.selectedTokens, offer);

    return this.portfolioRepository.createOne({
      user: params.userId,
      selectedTokens: params.selectedTokens,
      offer: params.offerId,
      tournament: offer.getTournamentId(),
      intervalStartTimestamp: offerTimestamp,
      intervalEndTimestamp: offerTimestamp + offerDurationInSeconds,
      isAwarded: false,
    });
  }

  public updateCards(portfolioId: string) {
    return this.transactionsManager.useTransaction(async () => {
      const portfolio = await this.getByIdIfExists(portfolioId);

      if (!portfolio.getTournamentId()) {
        throw new UnprocessableEntityException('Portfolio is not related to the tournament.');
      }

      const deck = await this.tournamentDeckService.getUserDeckForTournament(
        portfolio.getUserId(),
        portfolio.getTournamentId(),
      );

      if (!deck) {
        throw new UnprocessableEntityException('Cannot find user deck for the tournament.');
      }

      return portfolio;
    });
  }

  @Cron('*/30 * * * *')
  public async awardPortfolios() {
    const [latestCompletedCoinsPricingRecord] = await this.coinsPricingService.list({
      filter: {
        completed: true,
      },
      sort: [
        {
          field: CoinsPricingRecordSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: 1,
    });

    if (!latestCompletedCoinsPricingRecord) {
      return;
    }

    const coinsPricingRecordsCache: Record<number, CoinsPricingRecordEntity> = {
      [latestCompletedCoinsPricingRecord.getTimestamp()]: latestCompletedCoinsPricingRecord,
    };

    const cursor = this.portfolioRepository.findAsCursor({
      filter: {
        isAwarded: false,
        intervalEndsBefore: latestCompletedCoinsPricingRecord.getTimestamp(),
      },
      sort: [
        {
          field: PortfolioSortingField.IntervalStartTimestamp,
          direction: SortDirection.Ascending,
        },
      ],
    });

    await processCursor<PortfolioEntity>(cursor, async (portfolios) => {
      const coinPricingTimestampsToLoadSet = portfolios.reduce((previousSet, portfolio) => {
        const [intervalStartTimestamp, intervalEndTimestamp] = portfolio.getInterval();

        if (!coinsPricingRecordsCache[intervalStartTimestamp]) {
          previousSet.add(intervalStartTimestamp);
        }

        if (!coinsPricingRecordsCache[intervalEndTimestamp]) {
          previousSet.add(intervalEndTimestamp);
        }

        return previousSet;
      }, new Set<number>());

      const coinsPricingRecords = await this.coinsPricingService.list({
        filter: {
          timestamps: Array.from(coinPricingTimestampsToLoadSet),
        },
      });

      for (const coinsPricingRecord of coinsPricingRecords) {
        coinsPricingRecordsCache[coinsPricingRecord.getTimestamp()] = coinsPricingRecord;
      }

      for (const portfolio of portfolios) {
        try {
          const [intervalStartTimestamp, intervalEndTimestamp] = portfolio.getInterval();

          const intervalStartPrices = coinsPricingRecordsCache[intervalStartTimestamp].getPrices();
          const intervalEndPrices = coinsPricingRecordsCache[intervalEndTimestamp].getPrices();

          if (!intervalStartPrices || !intervalEndPrices) {
            continue;
          }

          const earnedCoins = portfolio.getSelectedTokens().reduce((previousCoins, selectedToken) => {
            const startIntervalTokenPrice = intervalStartPrices[selectedToken.id];
            const endIntervalTokenPrice = intervalEndPrices[selectedToken.id];

            const percentage = ((endIntervalTokenPrice - startIntervalTokenPrice) / startIntervalTokenPrice) * 100;

            return previousCoins + (selectedToken.direction === 'falling' ? -percentage : percentage);
          }, 0);

          await this.transactionsManager.useTransaction(async () => {
            await this.portfolioRepository.updateOneById(portfolio.getId(), {
              isAwarded: true,
              earnedCoins: round(earnedCoins, 2),
            });

            if (portfolio.getTournamentId()) {
              await this.tournamentParticipationService.addPoints(
                portfolio.getUserId(),
                portfolio.getTournamentId(),
                earnedCoins,
              );
            } else {
              await this.userService.addCoins(portfolio.getUserId(), Math.max(0, earnedCoins * 2));
            }
          });
        } catch (error) {
          Logger.error(`Failed to award portfolio with ${portfolio.getId()} id: `, error);
        }
      }
    });
  }

  private validateSelectedTokens(selectedTokens: SelectedPortfolioToken[], offer: TokensOfferEntity) {
    const offerTokens = offer.getTokens();

    const hasInvalidTokens = selectedTokens.some((token) => {
      return !offerTokens.includes(token.id);
    });

    if (hasInvalidTokens) {
      throw new UnprocessableEntityException('Selected tokens are not valid for the offer.');
    }
  }
}
